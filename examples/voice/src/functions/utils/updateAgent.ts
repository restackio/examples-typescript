import "dotenv/config";
import Restack from "@restackio/restack-sdk-ts";

interface UpdateAgentInput {
  workflowId: string;
  runId: string;
  eventName: string;
  input: {
    [key: string]: any;
  };
}

export async function updateAgent({
  workflowId,
  runId,
  eventName,
  input,
}: UpdateAgentInput) {
  const restack = new Restack();

  return restack.sendWorkflowEvent({
    workflowId,
    runId,
    eventName,
    input,
  });
}
