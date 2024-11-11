import { FunctionFailure, log } from "@restackio/ai/function";
import { geminiClient } from "../utils/client";
import { GeminiChatInput } from "../types";

export const geminiGenerateContent = async ({
  userContent,
  systemContent = "",
  model = "gemini-pro",
  apiKey,
  params,
}: GeminiChatInput): Promise<{ result: any }> => {
  try {
    const gemini = geminiClient({ apiKey });
    const model_ = gemini.getGenerativeModel({ model });

    const chatParams = {
      temperature: params?.temperature ?? 0.9,
      topP: params?.topP ?? 1,
      topK: params?.topK ?? 1,
      candidateCount: params?.candidateCount ?? 1,
      ...(params?.maxOutputTokens && {
        maxOutputTokens: params.maxOutputTokens,
      }),
      ...(params?.stopSequences && { stopSequences: params.stopSequences }),
    };

    log.debug("Gemini chat completion params", {
      chatParams,
    });

    const prompt = systemContent
      ? `${systemContent}\n${userContent}`
      : userContent;

    const result = await model_.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      result: {
        choices: [
          {
            message: {
              role: "assistant",
              content: text,
            },
          },
        ],
      },
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error Gemini chat: ${error}`);
  }
};
