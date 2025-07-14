import { FunctionFailure, log } from "@restackio/ai/function";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import { openaiClient } from "../utils/client";
import { CreateTodoSchema, ExecuteTodoSchema, ResponseSchema } from "./types";
import { parseAndValidateResponse } from "./utils/responseUtils";

export type Message =
  | ChatCompletionSystemMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionToolMessageParam;

export const LLMChatInputSchema = z.object({
  systemContent: z.string().optional().default(""),
  model: z.string().optional().default("gpt-4.1-mini"),
  messages: z.array(z.any()),
});

export const LLMChatOutputSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().nullable(),
  structured_data: ResponseSchema.optional(),
});

export type LLMChatInput = z.infer<typeof LLMChatInputSchema>;
export type LLMChatOutput = z.infer<typeof LLMChatOutputSchema>;

const availableFunctions = [
  {
    schema: CreateTodoSchema,
    name: "createTodo",
    description: CreateTodoSchema.description || "Creates a new todo item"
  },
  {
    schema: ExecuteTodoSchema,
    name: "executeTodoWorkflow",
    description: ExecuteTodoSchema.description || "Executes a todo item"
  }
];

const baseSystemMessage = `You are a helpful assistant that can create and execute todos. When a user asks to "do something" or "complete a task", you should: 1. First create the todo using createTodo2. Then execute it using executeTodoWorkflow with the todoId from the previous step`;

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4.1-mini",
  messages,
}: LLMChatInput): Promise<LLMChatOutput> => {
  try {
    const openai = openaiClient({});

    const finalSystemContent = systemContent
      ? `${baseSystemMessage}\n\n${systemContent}`
      : baseSystemMessage;

    const functionSchemas = availableFunctions.map(fn => {
      const schema = zodToJsonSchema(fn.schema);
      return {
        name: fn.name,
        description: fn.description,
        schema: JSON.stringify(schema, null, 2)
      };
    });

    const functionDocsString = functionSchemas.map(fn => {
      return `Function: ${fn.name}\nDescription: ${fn.description}\nParameters Schema: \n${fn.schema}`;
    }).join('\n\n');

    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        {
          role: "system",
          content: `${finalSystemContent}\n\nYou are a JSON-speaking assistant that responds in one of these formats:\nFor executing functions: {"type":"function_call","function_name":"<name>","function_arguments":{<args>}}\nFor text responses: {"type":"text","content":"<text>"}\n\nAvailable functions with their schemas:\n${functionDocsString}`
        },
        ...messages
      ],
      model,
      response_format: { type: "json_object" },
    };

    log.debug("OpenAI chat completion params", { chatParams });

    const completion = await openai.chat.completions.create(chatParams);
    const message = completion.choices[0].message;

    const messageContent = message.content || "";

    const structuredData = parseAndValidateResponse(messageContent);

    return {
      role: "assistant",
      content: messageContent,
      structured_data: structuredData,
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error in OpenAI chat: ${error}`);
  }
};
