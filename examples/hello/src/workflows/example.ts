import { log, step } from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";
import { z } from "zod";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import zodToJsonSchema from "zod-to-json-schema";

interface Input {
  name: string;
}

export async function example({ name }: Input) {
  // Need to get the openai key from the utils function otherwise breaks determinism

  const openaiKey = await step<typeof functions>({}).getOpenaiKey();

  const content = `Greet this person: ${name}. In 4 words or less.`;

  const MessageSchema = z.object({
    message: z.string().describe("The greeting message."),
  });

  const jsonSchema = {
    name: "greet",
    schema: zodToJsonSchema(MessageSchema),
  };

  const openaiOutput = await step<typeof openaiFunctions>({
    taskQueue: openaiTaskQueue,
  }).openaiChatCompletion({
    apiKey: openaiKey,
    content,
    jsonSchema,
  });

  const greetMessage = openaiOutput.response.choices[0].message.content ?? "";
  const greetUsage = openaiOutput.usage;

  log.info("greeted", { greetMessage });

  // Step 2 create goodbye message with simple function

  const { message: goodbyeMessage } = await step<typeof functions>({}).goodbye({
    name,
  });

  log.info("goodbye", { goodbyeMessage });

  return {
    messages: [greetMessage, goodbyeMessage],
    usage: {
      ...greetUsage,
    },
  };
}
