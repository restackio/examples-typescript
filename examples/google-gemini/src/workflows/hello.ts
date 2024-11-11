import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
}

export async function helloWorkflow({ name }: Input) {
  const userContent = `Greet this person: ${name}. In 4 words or less.`;

  // Step 1 create greeting message with google gemini

  const geminiOutput = await step<typeof functions>({
    taskQueue: "gemini",
  }).geminiGenerateContent({
    userContent,
  });

  const greetMessage = geminiOutput.result.choices[0].message.content ?? "";

  log.info("greeted", { greetMessage });

  // Step 2 create goodbye message with simple function

  const { message: goodbyeMessage } = await step<typeof functions>({}).goodbye({
    name,
  });

  log.info("goodbye", { goodbyeMessage });

  return {
    messages: [greetMessage, goodbyeMessage],
  };
}
