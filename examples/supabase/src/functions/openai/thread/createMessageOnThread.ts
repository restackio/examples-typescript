import OpenAI from "openai/index";
import { FunctionFailure } from "@restackio/ai/function";

import { openaiClient } from "../utils/client";

export async function createMessageOnThread({
  apiKey,
  threadId,
  content,
  role,
}: {
  apiKey: string;
  threadId: string;
  content: string;
  role: OpenAI.Beta.Threads.MessageCreateParams["role"];
}) {
  try {
    const openai = openaiClient({ apiKey });
    await openai.beta.threads.messages.create(threadId, {
      role,
      content,
    });
  } catch (error) {
    throw FunctionFailure.nonRetryable(
      `Error creating message thread: ${error}`
    );
  }
}
