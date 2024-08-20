import "dotenv/config";

import { FunctionFailure } from "@restackio/restack-sdk-ts/function";

export async function getOpenaiKey() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw FunctionFailure.nonRetryable("OPENAI_API_KEY is not set");
  }
  return openaiKey;
}
