import { defineEvent, onEvent } from "@restackio/ai/event";
import * as functions from "../functions";
import { condition, log, step } from "@restackio/ai/workflow";
import z from "zod";
import { ChunkSummary } from "./chunk";
import zodToJsonSchema from "zod-to-json-schema";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";

export type ChunkSummaryEvent = {
  recordingId: string;
  summary: ChunkSummary;
  cost: number;
};

export const chunkSummaryEvent = defineEvent<ChunkSummaryEvent>("chunkSummary");

export const summaryEndEvent = defineEvent("summaryEnd");

export async function recordingWorkflow({
  recordingId,
  blobKeys,
  projectId,
  host,
  maxChunks,
}: {
  recordingId: string;
  blobKeys: string[];
  projectId: string;
  host: string;
  maxChunks?: number;
}) {
  const events = await step<typeof functions>({
    taskQueue: "posthog",
  }).posthogSessionEvents({
    recordingId,
    projectId,
    host,
  });

  let summaries: ChunkSummaryEvent[] = [];
  let totalCost = 0;

  // Get chunks and create unique workflow for each and stream back event summary

  await step<typeof functions>({
    taskQueue: "posthog",
  }).posthogBlobChunks({
    recordingId,
    blobKeys,
    projectId,
    host,
    maxChunks,
  });

  // Push summary to check

  onEvent(
    chunkSummaryEvent,
    async ({ recordingId, summary, cost }: ChunkSummaryEvent) => {
      summaries.push({
        recordingId,
        summary,
        cost,
      });
      totalCost += cost;
      return {
        recordingId,
        summary,
        cost,
      };
    }
  );

  let ended = false;

  // When all summaries are done, continue.

  onEvent(summaryEndEvent, async () => {
    log.info(`summaryEnd received`);
    ended = true;
  });

  await condition(() => ended);

  // Create a summary from all the chunks summaries

  const recordingSummarySchema = z.object({
    recordingId: z.string().describe("The id of the recording."),
    summary: z.string().describe("The summary of the recording."),
    highlights: z
      .array(
        z.object({
          name: z.string().describe("The name of the behavior highlight."),
          timestamp: z
            .string()
            .describe("The timestamp of the behavior highlight."),
        })
      )
      .describe("Noticeable user behavior to be highlighted."),
  });

  type RecordingSummary = z.infer<typeof recordingSummarySchema>;

  const recordingSummaryJsonSchema = {
    name: "recordingSummary",
    schema: zodToJsonSchema(recordingSummarySchema),
  };

  const { cost, result } = await step<typeof openaiFunctions>({
    taskQueue: openaiTaskQueue,
  }).openaiChatCompletionsBase({
    systemContent:
      "You are a helpful assistant that summarizes posthog recordings.",
    model: "gpt-4o-mini",
    userContent: `
      Here are summaries of each chunk of the recording blob:
      ${summaries}
      The users events are ${JSON.stringify(events)}
      Group all this data, make a summary and highlight particular interesting or unexpected user behavior.
    `,
    jsonSchema: recordingSummaryJsonSchema,
    price: {
      input: 0.00000015,
      output: 0.0000006,
    },
  });

  totalCost += cost ?? 0;

  const summaryResult = result.choices[0].message.content;

  if (!summaryResult) {
    throw new Error("No summary result");
  }

  const summary = JSON.parse(summaryResult) as RecordingSummary;

  return {
    summary,
    totalCost,
    events,
    summaries,
  };
}
