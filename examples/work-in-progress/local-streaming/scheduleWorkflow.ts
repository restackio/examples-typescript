import Restack from "restack-sdk-ts-local";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const streamUpdate = (result: string) => {
      console.log("Stream update:", result);
    };

    const handle = await restack.schedule({
      workflowName: "stream",
      workflowId: `${Date.now()}-streamWorkflow`,
      input: [
        {
          name: "test",
          streamUpdate,
        },
      ],
    });

    console.log("Workflow scheduled successfully:", handle.firstExecutionRunId);

    handle.result().then((result) => {
      console.log("Workflow result:", result);
    });

    handle.startUpdate;

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
