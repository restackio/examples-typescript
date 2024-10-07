import { log, step } from "@restackio/ai/workflow";
import * as twilioFunctions from "@restackio/integrations-twilio/functions";
import { twilioTaskQueue } from "@restackio/integrations-twilio/taskQueue";
interface Output {
  sid: string;
}

export async function twilioCallWorkflow({
  to,
  from,
  url,
}: {
  to: string;
  from: string;
  url: string;
}): Promise<Output> {
  const { sid } = await step<typeof twilioFunctions>({
    taskQueue: twilioTaskQueue,
    scheduleToCloseTimeout: "1 minute",
  }).twilioCall({
    options: {
      to,
      from,
      url,
    },
  });

  if (!sid) {
    throw new Error("Not able to create Twilio call");
  }

  log.info("sid", { sid });

  return {
    sid,
  };
}
