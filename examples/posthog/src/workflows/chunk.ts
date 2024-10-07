import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import {
  chunkSummaryEvent,
  ChunkSummaryEvent,
  summaryEndEvent,
} from "./recording";

const chunkSummarySchema = z.object({
  recordingId: z.string().describe("The id of the recording."),
  fromTimestamp: z
    .string()
    .describe("The start timestamp of this recording chunk."),
  toTimestamp: z
    .string()
    .describe("The end timestamp of this recording chunk."),
  summary: z.string().describe("The summary of this recording chunk."),
});

export type ChunkSummary = z.infer<typeof chunkSummarySchema>;

export async function chunkWorkflow({
  recordingId,
  chunk,
  workflow,
  isLastChunk,
}: {
  recordingId: string;
  chunk: string;
  workflow: {
    workflowId: string;
    runId: string;
  };
  isLastChunk?: boolean;
}) {
  const chunkSummaryJsonSchema = {
    name: "chunkSummary",
    schema: zodToJsonSchema(chunkSummarySchema),
  };

  const { cost, result } = await step<typeof openaiFunctions>({
    taskQueue: openaiTaskQueue,
  }).openaiChatCompletionsBase({
    systemContent:
      "You are a helpful assistant that summarizes posthog recordings. Here is the snapshot blob of it",
    model: "gpt-4o-mini",
    userContent: `
      Here is a chunk of the recording blob:
      ${chunk}
      For the particular extract the behavior of the user and summarize it.
      Highlight if the user is doing something interesting or unexpected.
      If nothing interesting, just write "No interesting behavior".
    `,
    jsonSchema: chunkSummaryJsonSchema,
    price: {
      input: 0.00000015,
      output: 0.0000006,
    },
  });

  const summaryResult = result.choices[0].message.content;

  if (!summaryResult) {
    throw new Error("No summary result");
  }

  const summary = JSON.parse(summaryResult) as ChunkSummary;

  const input: ChunkSummaryEvent = {
    recordingId,
    summary,
    cost: cost ?? 0,
  };

  try {
    await step<typeof functions>({
      taskQueue: "restack",
    }).workflowSendEvent({
      event: {
        name: chunkSummaryEvent.name,
        input,
      },
      workflow,
    });

    if (isLastChunk) {
      await step<typeof functions>({
        taskQueue: "restack",
      }).workflowSendEvent({
        event: {
          name: summaryEndEvent.name,
        },
        workflow,
      });
    }
  } catch (error) {
    log.error("Encountered exception. ", { error });
    throw error;
  }

  return input;
}
