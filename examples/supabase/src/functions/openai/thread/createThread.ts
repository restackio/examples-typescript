import { FunctionFailure } from "@restackio/ai/function";
import { Thread } from "openai/resources/beta/index";

import { openaiClient } from "../utils/client";

export async function createThread({
  apiKey,
}: {
  apiKey: string;
}): Promise<Thread> {
  try {
    const openai = openaiClient({ apiKey });
    const thread = await openai.beta.threads.create();

    return thread;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error creating thread: ${error}`);
  }
}
