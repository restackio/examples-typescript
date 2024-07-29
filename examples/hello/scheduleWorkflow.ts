import Restack from "@restackio/restack-sdk-ts";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const handle = await restack.schedule({
      workflowName: "example",
      workflowId: `${Date.now()}-exampleWorkflow`,
      input: [
        {
          name: "test",
        },
      ],
    });

    console.log("Workflow scheduled successfully:", handle.firstExecutionRunId);

    handle.result().then((result) => {
      console.log("Workflow result:", result);
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
