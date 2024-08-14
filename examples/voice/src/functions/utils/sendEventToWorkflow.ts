import "dotenv/config";
import Restack from "@restackio/restack-sdk-ts";

interface SendEventToWorkflowInput {
  workflowId: string;
  runId: string;
  eventName: string;
  input: {
    [key: string]: any;
  };
}

export async function workflowSendEvent({
  workflowId,
  runId,
  eventName,
  input,
}: SendEventToWorkflowInput) {
  const restack = new Restack();

  return restack.sendWorkflowEvent({
    workflowId,
    runId,
    eventName,
    input,
  });
}
