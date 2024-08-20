import Restack from "@restackio/restack-sdk-ts";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const workflowId = `${Date.now()}-helloWorkflow`;
    const runId = await restack.scheduleWorkflow({
      workflowName: "helloWorkflow",
      workflowId,
      input: {
        name: "test",
      },
    });

    const result = await restack.getWorkflowResult({ workflowId, runId });

    console.log("Workflow result:", result);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
