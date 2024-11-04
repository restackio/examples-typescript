import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { log, step } from "@restackio/ai/workflow";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import * as functions from "../functions";

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
  const openaiOutput = await step<typeof openaiFunctions>({
    taskQueue: openaiTaskQueue,
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