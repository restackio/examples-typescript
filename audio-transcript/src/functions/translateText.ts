import OpenAI from "openai";
import { FunctionFailure } from "@restackio/ai/function";

type TranslateTextInput = {
  text: string;
  targetLanguage: string;
};

export async function translateText({ text, targetLanguage }: TranslateTextInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw FunctionFailure.nonRetryable("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
      const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
      const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content || "Translation failed.";
  } catch (error) {
      throw FunctionFailure.nonRetryable(`Error translating text ${error}`);
  }
}
