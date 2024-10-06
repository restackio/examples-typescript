import { executeChild, step } from "@restackio/ai/workflow";
import { recordingWorkflow } from "./recording";
import * as functions from "../functions";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import * as linearFunctions from "@restackio/integrations-linear/functions";
import { linearTaskQueue } from "@restackio/integrations-linear/taskQueue";

export async function digestWorkflow({
  projectId,
  host,
  maxRecordings,
  maxChunksPerRecordingBlob,
  linearTeamId,
}: {
  projectId: string;
  host: string;
  maxRecordings?: number;
  maxChunksPerRecordingBlob?: number;
  linearTeamId?: string;
}) {
  let totalCost = 0;
  // Get last 24h recordings
  const { results: recordings } = await step<typeof functions>({
    taskQueue: "posthog",
  }).posthogGetRecordings({ projectId, host });

  let summaries: Awaited<ReturnType<typeof recordingWorkflow>>[] = [];

  await Promise.all(
    recordings.slice(0, maxRecordings).map(async (recording) => {
      // Get snapshots for recording
      const { blobKeys } = await step<typeof functions>({
        taskQueue: "posthog",
      }).posthogGetSnapshots({
        recordingId: recording.id,
        projectId,
        host,
      });

      if (blobKeys.length > 0) {
        // Get recording summary
        const recordingData = await executeChild(recordingWorkflow, {
          workflowId: `${recording.id}-recordingWorkflow`,
          args: [
            {
              recordingId: recording.id,
              blobKeys,
              projectId,
              host,
              maxChunks: maxChunksPerRecordingBlob,
            },
          ],
        });
        totalCost += recordingData.totalCost;
        summaries.push(recordingData);
      }
    })
  );

  // Create a digest from all the chunks summaries

  const { cost, result } = await step<typeof openaiFunctions>({
    taskQueue: `${openaiTaskQueue}-beta`,
  }).openaiChatCompletionsBase({
    model: "o1-preview",
    userContent: `
      Summarize the following PostHog recordings analysis into a linear issue in markdown format, following the structure:

        •	10-second overview: Briefly mention the most urgent and critical user behavior or anomalies.
        •	30-second summary: Highlight key user interactions and events, such as network requests, page views, and modal interactions. Focus on patterns or significant moments.
        •	1-minute deep dive: Provide a more detailed breakdown of the user’s behavior, including network activity, UI interactions, and any potential anomalies. Include timestamps or specific event details when relevant.
      Finally, end the issue description with a brief call to action or recommendation.
      Include the url to the recordings when necessary so user can easily access them.
      To make the recording url replace the RECORDING_ID in: ${host}/project/${projectId}/replay/RECORDING_ID

      Here is the data:
      ${JSON.stringify(summaries)}
    `,
    price: {
      input: 0.000015,
      output: 0.00006,
    },
  });

  totalCost += cost ?? 0;

  const digest = result.choices[0].message.content;

  if (linearTeamId) {
    const linearResult = await step<typeof linearFunctions>({
      taskQueue: linearTaskQueue,
    }).linearCreateIssue({
      issue: {
        teamId: linearTeamId,
        title: `PostHog Digest - ${new Date().toISOString()}`,
        description: digest,
      },
    });

    return {
      digest,
      totalCost,
      summaries,
      linearResult,
    };
  }

  return {
    digest,
    totalCost,
    summaries,
  };
}
