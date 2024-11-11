import { FunctionFailure, log } from "@restackio/ai/function";
import { geminiClient } from "../utils/client";
import { GeminiChatInput } from "../types";

export const geminiGenerateContentStream = async ({
  userContent,
  systemContent = "",
  model = "gemini-pro",
  apiKey,
  params,
}: GeminiChatInput): Promise<ReadableStream> => {
  try {
    const gemini = geminiClient({ apiKey });
    const model_ = gemini.getGenerativeModel({ model });

    const chatParams = {
      temperature: params?.temperature ?? 0.9,
      topP: params?.topP ?? 1,
      topK: params?.topK ?? 1,
      candidateCount: params?.candidateCount ?? 1,
      maxOutputTokens: params?.maxOutputTokens,
      stopSequences: params?.stopSequences,
    };

    log.debug("Gemini chat completion params", {
      chatParams,
    });

    const prompt = systemContent ? `${systemContent}\n${userContent}` : userContent;

    const result = await model_.generateContentStream(prompt);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue({
              choices: [{
                delta: {
                  role: "assistant",
                  content: text
                }
              }]
            });
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error Gemini chat stream: ${error}`);
  }
};
