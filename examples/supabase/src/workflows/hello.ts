import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

interface Input {
  name: string;
}

export async function helloWorkflow({ name }: Input) {
  const userContent = `Greet this person: ${name}. In 4 words or less.`;

  const MessageSchema = z.object({
    message: z.string().describe("The greeting message."),
  });

  const jsonSchema = {
    name: "greet",
    schema: zodToJsonSchema(MessageSchema),
  };

  // Step 1 create greeting message with openai

  const openaiOutput = await step<typeof functions>({
    taskQueue: "openai",
  }).openaiChatCompletionsBase({
    userContent,
    jsonSchema,
  });

  const greetMessage = openaiOutput.result.choices[0].message.content ?? "";
  const greetCost = openaiOutput.cost;

  log.info("greeted", { greetMessage });

  // Step 2 create goodbye message with simple function

  const { message: goodbyeMessage } = await step<typeof functions>({}).goodbye({
    name,
  });

  log.info("goodbye", { goodbyeMessage });

  return {
    messages: [greetMessage, goodbyeMessage],
    cost: greetCost,
  };
}
