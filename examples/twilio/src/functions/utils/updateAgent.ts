import "dotenv/config";
import Restack from "@restackio/restack-sdk-ts";

interface UpdateAgentInput {
  workflowId: string;
  runId: string;
  updateName: string;
  input: {
    [key: string]: any;
  };
}

export async function updateAgent({
  workflowId,
  runId,
  updateName,
  input,
}: UpdateAgentInput) {
  const restack = new Restack();

  return restack.update({
    workflowId,
    runId,
    updateName,
    input,
  });
}
