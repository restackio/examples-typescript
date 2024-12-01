import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
}

export async function helloWorkflow({ name }: Input) {
  const userContent = `Greet this person: ${name}. In 4 words or less.`;

  // Step 1 create greeting message with llama-stack

  const llamaStackOutput = await step<typeof functions>({
    taskQueue: "llama-stack",
  }).llamaStackChatCompletion({
    model: 'llama3.1:8b-instruct-fp16',
    messages: [{ role: 'user', content: userContent }],
  });

  // Step 2 create goodbye message with simple function

  const { message: goodbyeMessage } = await step<typeof functions>({}).goodbye({
    name,
  });

  log.info("goodbye", { goodbyeMessage });

  return {
    messages: [llamaStackOutput, goodbyeMessage],
  };
}
