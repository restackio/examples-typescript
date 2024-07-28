import Restack from "restack-sdk-ts";

async function triggerExampleWorkflow() {
  try {
    const restack = new Restack();

    const streamUpdate = (result: string) => {
      console.log("Stream update:", result);
    };

    const handle = await restack.start({
      workflowName: "stream",
      workflowId: `${Date.now()}-streamWorkflow`,
      input: [
        {
          name: "test",
          streamUpdate,
        },
      ],
    });

    console.log("Workflow started successfully:", handle.firstExecutionRunId);

    handle.result().then((result) => {
      console.log("Workflow result:", result);
    });

    handle.startUpdate;

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error starting workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

// Trigger the workflow
triggerExampleWorkflow();
