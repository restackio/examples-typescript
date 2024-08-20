import Restack from "@restackio/restack-sdk-ts";
import { SendWorkflowEvent } from "@restackio/restack-sdk-ts/event";

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
