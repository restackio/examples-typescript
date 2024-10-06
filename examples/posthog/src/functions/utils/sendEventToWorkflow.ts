import Restack from "@restackio/ai";
import { SendWorkflowEvent } from "@restackio/ai/event";

export async function workflowSendEvent({
  event,
  workflow,
}: SendWorkflowEvent) {
  const restack = new Restack();

  return restack.sendWorkflowEvent({
    event,
    workflow,
  });
}
