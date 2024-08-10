import { log, step } from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";
import { UsageOutput } from "../functions/openai/chat";

interface Input {
  name: string;
}

interface Output {
  messages: string[];
  usage: UsageOutput;
}

export async function example({ name }: Input): Promise<Output> {
  // Step 1 call OpenAI

  const {
    output: { message: greetMessage },
    usage: greetUsage,
  } = await step<typeof functions>({
    podName: `openai`,
    scheduleToCloseTimeout: "1 minute",
  }).greet({ name });

  log.info("greeted", { greetMessage });

  // Step 2 create goodbye message with simple function

  const { message: goodbyeMessage } = await step<typeof functions>({
    podName: `restack`,
    scheduleToCloseTimeout: "1 minute",
  }).goodbye({ name });

  log.info("goodbye", { goodbyeMessage });

  return {
    messages: [greetMessage, goodbyeMessage],
    usage: {
      ...greetUsage,
    },
  };
}
