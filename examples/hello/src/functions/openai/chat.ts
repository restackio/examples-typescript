import { ZodObject } from "zod";
import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { zodPrompt } from "./zodPrompt";
import { openaiClient } from "./client";
import { openaiCost } from "./cost";

export type UsageOutput = { tokens: number; cost: number };

export const openaiChat = async ({
  zodSchema,
  template,
  model,
}: {
  zodSchema: ZodObject<any>;
  template: string;
  model?: string;
}): Promise<{ response: object; usage: UsageOutput }> => {
  try {
    const parserPrompt = await zodPrompt({ zodSchema });

    // Default to gpt-4o model
    const modelToUse = model ?? "gpt-4o-mini-2024-07-18";

    const completion = await openaiClient.chat.completions.create({
      messages: [
        { role: "system", content: parserPrompt },
        { role: "user", content: template },
      ],
      response_format: { type: "json_object" },
      model: modelToUse,
      temperature: 0,
    });

    log.info("completion", { completion });

    const assistantAnswer = completion.choices[0].message.content;

    try {
      const parsedAnswer = JSON.parse(assistantAnswer!);

      return {
        response: parsedAnswer,
        usage: {
          tokens: completion.usage?.total_tokens ?? 0,
          cost: openaiCost({
            model: modelToUse,
            tokensCountInput: completion.usage?.prompt_tokens ?? 0,
            tokensCountOutput: completion.usage?.completion_tokens ?? 0,
          }),
        },
      };
    } catch (error) {
      throw FunctionFailure.nonRetryable(
        `Error parsing response: ${assistantAnswer}`
      );
    }
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
