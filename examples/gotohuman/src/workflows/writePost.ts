import { log, step, condition, workflowInfo } from "@restackio/ai/workflow";
import { onEvent } from "@restackio/ai/event";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { HumanResponseInput, HumanResponseEvent } from "../events";
import * as functions from "../functions";

interface TopicInput {
  topic: string;
}

export async function writePostWorkflow({ topic }: TopicInput) {
  const workflowId = workflowInfo().workflowId
  const runId = workflowInfo().runId
  let endWorkflow = false;

  // Step 1: Create LinkedIn post with openai
  
  const prompt = `Write a short LinkedIn post about '${topic}' and how it will be affected by AI.`;

  const ResponseSchema = z.object({
    linkedInPost: z.string().describe("The drafted LinkedIn post."),
  });
  const jsonSchema = {
    name: "post",
    schema: zodToJsonSchema(ResponseSchema),
  };

  const openaiOutput = await step<typeof functions>({
    taskQueue: "openai",
  }).openaiChatCompletionsBase({
    userContent: prompt,
    jsonSchema,
  });

  const response = openaiOutput.result.choices[0].message.content ?? "";
  const {linkedInPost} = JSON.parse(response)

  log.info("drafted post: ", { DRAFT: linkedInPost });

  // Step 2: Request a human review
  
  const { reviewId: gotoHumanReviewId } = await step<typeof functions>({}).requestReview({
    topic,
    postDraft: linkedInPost,
    workflowId,
    runId
  });

  log.info("awaiting gotoHuman review, ID: ", { gotoHumanReviewId });

  // Step 3: Listen to review response and publish if approved

  let message;
  onEvent(HumanResponseEvent, async (event: HumanResponseInput) => {
    log.info("Received human response from gotoHuman", event);

    if (event.publishDecision === 'publish') {
      message = await step<typeof functions>({}).publishPost({
        post: event.linkedInPost,
      });
    } else {
      message = "Discarded"
    }
    endWorkflow = true;
    return message;
  });

  await condition(() => endWorkflow);
  return message;
}
