import { ChatModel } from "openai/resources/index";
import { FunctionFailure } from "@restackio/ai/function";
import { Assistant, AssistantTool } from "openai/resources/beta/index";

import { openaiClient } from "../utils/client";

export async function createAssistant({
  apiKey,
  name,
  instructions,
  model = "gpt-4o-mini",
  tools = [],
}: {
  apiKey: string;
  name: string;
  instructions: string;
  tools?: AssistantTool[];
  model: ChatModel;
}): Promise<Assistant> {
  try {
    const openai = openaiClient({ apiKey });

    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
      tools,
    });

    return assistant;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error creating assistant: ${error}`);
  }
}
