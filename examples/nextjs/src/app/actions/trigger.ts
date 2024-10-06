"use server";
import Restack from "@restackio/ai";
import { Example } from "../components/examplesList";

const connectionOptions = {
  engineId: process.env.RESTACK_ENGINE_ID!,
  address: process.env.RESTACK_ENGINE_ADDRESS!,
  apiKey: process.env.RESTACK_ENGINE_API_KEY!,
};

const client = new Restack(
  process.env.RESTACK_ENGINE_API_KEY ? connectionOptions : undefined
);

export async function triggerWorkflow(
  workflowName: Example["workflowName"],
  input: Example["input"]
) {
  if (!workflowName || !input) {
    throw new Error("Workflow name and input are required");
  }

  const workflowId = `${Date.now()}-${workflowName.toString()}`;

  const runId = await client.scheduleWorkflow({
    workflowName: workflowName as string,
    workflowId,
    input,
  });

  const result = await client.getWorkflowResult({
    workflowId,
    runId,
  });

  return result;
}
