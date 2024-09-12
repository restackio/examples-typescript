import { client } from "./src/client";

async function scheduleWorkflow() {
  try {
    const workflowId = `${Date.now()}-helloWorkflow`;
    const runId = await client.scheduleWorkflow({
      workflowName: "helloWorkflow",
      workflowId,
      input: {
        name: "test",
      },
    });

    const result = await client.getWorkflowResult({ workflowId, runId });

    console.log("Workflow result:", result);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
