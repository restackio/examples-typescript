import Restack from "@restackio/restack-sdk-ts";
import "dotenv/config";

async function scheduleWorkflow() {
  try {
    const restack = new Restack();

    const workflowRunId = await restack.scheduleWorkflow({
      workflowName: "digestWorkflow",
      workflowId: `${Date.now()}-digestWorkflow`,
      input: {
        projectId: process.env.POSTHOG_PROJECT_ID,
        host: process.env.POSTHOG_HOST,
        maxRecordings: 5, // Useful to limit cost when debugging locally. Comment out to run for all recordings
        maxChunksPerRecordingBlob: 10, // Useful to limit cost when debugging locally. Comment out to process all chunks
      },
    });

    console.log("Workflow scheduled successfully:", workflowRunId);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
