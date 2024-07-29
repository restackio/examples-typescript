import { FunctionFailure, log } from "restack-sdk-ts-local/function";
import { openaiClient } from "./openai/client";

export async function stream({
  name,
  streamUpdate,
}: {
  name: string;
  streamUpdate: (result: string) => void;
}) {
  try {
    const modelToUse = "gpt-4o-mini-2024-07-18";

    const template = `Tell me a story about: ${name}. In 4 words or less.`;

    const stream = await openaiClient.chat.completions.create({
      messages: [{ role: "user", content: template }],
      model: modelToUse,
      temperature: 0,
      stream: true,
    });

    let message = "";
    for await (const part of stream) {
      message = message + part.choices[0]?.delta?.content;
      log.info("stream openai", { content: part.choices[0]?.delta?.content });
    }

    return message;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
}
