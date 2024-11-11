import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiInstance: GoogleGenerativeAI | null = null;

export const geminiClient = ({
  apiKey = process.env.GEMINI_API_KEY,
}: {
  apiKey?: string;
}): GoogleGenerativeAI => {
  if (!apiKey) {
    throw new Error("API key is required to create Google Gemini client.");
  }

  if (!geminiInstance) {
    geminiInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiInstance;
};
