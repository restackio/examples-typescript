import Restack from "@restackio/restack-sdk-ts";

async function triggerExampleWorkflow() {
  try {
    const restack = new Restack();

    const handle = await restack.start({
      workflowName: "example",
      workflowId: `${Date.now()}-exampleWorkflow`,
      input: [
        {
          name: "test",
        },
      ],
    });

    console.log("Workflow started successfully:", handle.firstExecutionRunId);

    handle.result().then((result) => {
      console.log("Workflow result:", result);
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error starting workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

// Trigger the workflow
triggerExampleWorkflow();
