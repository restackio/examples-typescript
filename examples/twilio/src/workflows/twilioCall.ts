import { log, step } from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";

interface Output {
  sid: string;
}

export async function twilioCallWorkflow(): Promise<Output> {
  const { sid } = await step<typeof functions>({
    podName: `twilio`,
    scheduleToCloseTimeout: "1 minute",
  }).twilioCall();

  if (!sid) {
    throw new Error("Not able to create Twilio call");
  }

  log.info("sid", { sid });

  return {
    sid,
  };
}
