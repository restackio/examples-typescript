import { log, step, condition } from "@restackio/ai/workflow";
import { onEvent } from "@restackio/ai/event";

import { feedbackEvent, FeedbackEvent, endEvent, EndEvent } from "../events";
import * as functions from "../functions";

export async function humanLoopWorkflow() {
  let endWorkflow = false;

  onEvent(feedbackEvent, async (event: FeedbackEvent) => {
    log.info("Received feedback", { feedback: event.feedback });

    const feedback = await step<typeof functions>({}).feedback({
      feedback: event.feedback,
    });
    return feedback;
  });

  onEvent(endEvent, async (event: EndEvent) => {
    log.info("Received end", { end: event.end });
    endWorkflow = event.end;
    return event.end;
  });

  await condition(() => endWorkflow);

  const goodbye = await step<typeof functions>({}).goodbye();

  return goodbye;
}
