import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { log, step } from "@restackio/ai/workflow";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import * as functions from "../functions";

interface Input {
  name: string;
}
const GoodbyeMessageSchema = z.object({
  message: z.string().describe("The goodbye message."),
});

const goodbyeJsonSchema = {
  name: "goodbye",
  schema: zodToJsonSchema(GoodbyeMessageSchema),
};

export async function helloWorkflow({ name }: Input) {
  // Step 1: Create hello message with simple function
  const { message: greetMessage } = await step<typeof functions>({}).hello({
    name,
  });

  log.info("Hello", { greetMessage });

  // Step 2: Create goodbye message with our OpenAI integration (requires OPENAI_API_KEY in .env)
  let goodbyeMessage;
  try {
    const userContent = `Say goodbye to this person: ${name}. In 4 words or less.`;

    const openaiOutput = await step<typeof openaiFunctions>({
      taskQueue: openaiTaskQueue,
    }).openaiChatCompletionsBase({
      userContent,
      jsonSchema: goodbyeJsonSchema,
    });

    goodbyeMessage = openaiOutput.result.choices[0].message.content ?? "";

    log.info("Goodbye", { goodbyeMessage });
  } catch (error: any) {
    if (error.failure.cause.message.includes("API key is required")) {
      log.warn("Provide an OpenAI API key to use the OpenAI integration", {
        error,
      });
    }
  }

  return {
    messages: { greetMessage, goodbyeMessage },
  };
}
