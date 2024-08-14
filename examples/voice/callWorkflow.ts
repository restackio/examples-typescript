import Restack from "@restackio/restack-sdk-ts";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const workflowRunId = await restack.scheduleWorkflow({
      workflowName: "twilioCallWorkflow",
      workflowId: `${Date.now()}-twilioCallWorkflow`,
    });

    console.log("Workflow scheduled successfully:", workflowRunId);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
