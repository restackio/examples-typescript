import { FunctionFailure } from "restack-sdk-ts/function";
import { openaiClient } from "../tools/openai/client";

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

    for await (const part of stream) {
      streamUpdate(part.choices[0]?.delta?.content || "");
    }
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
}
