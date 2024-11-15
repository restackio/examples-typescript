import { FunctionFailure } from "@restackio/ai/function";
import { Stream } from "openai/streaming";
import { AssistantStreamEvent } from "openai/resources/beta/index";
import { Run } from "openai/resources/beta/threads/runs/index";

import { openaiClient } from "../utils/client";

export async function runThread({
  apiKey,
  threadId,
  assistantId,
  stream = false,
}: {
  apiKey: string;
  threadId: string;
  assistantId: string;
  stream: boolean;
}): Promise<Stream<AssistantStreamEvent> | Run> {
  try {
    const openai = openaiClient({ apiKey });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      ...(stream && { stream }),
    });

    return run;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error running thread: ${error}`);
  }
}