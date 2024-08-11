import Restack from "@restackio/restack-sdk-ts";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const workflowId = `${Date.now()}-exampleWorkflow`;
    const runId = await restack.schedule({
      workflowName: "example",
      workflowId: `${Date.now()}-exampleWorkflow`,
      input: [
        {
          name: "test",
        },
      ],
    });

    const result = await restack.getResult({ workflowId, runId });

    console.log("Workflow result:", result);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
