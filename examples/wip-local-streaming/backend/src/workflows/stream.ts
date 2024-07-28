import { step } from "restack-sdk-ts-local/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
  streamUpdate: (result: string) => void;
}

export async function stream({ name, streamUpdate }: Input) {
  await step<typeof functions>({
    tool: `openai`,
    scheduleToCloseTimeout: "1 minute",
  }).stream({ name, streamUpdate });
}
