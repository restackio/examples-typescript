import "dotenv/config";
import { client } from "../hello/src/client";

async function scheduleWorkflow() {
  try {
    const workflowRunId = await client.scheduleWorkflow({
      workflowName: "digestWorkflow",
      workflowId: `${Date.now()}-digestWorkflow`,
      input: {
        projectId: process.env.POSTHOG_PROJECT_ID,
        host: process.env.POSTHOG_HOST,
        maxRecordings: 5, // Useful to limit cost when debugging locally. Comment out to run for all recordings
        maxChunksPerRecordingBlob: 10, // Useful to limit cost when debugging locally. Comment out to process all chunks per recording
        linearTeamId: process.env.LINEAR_TEAM_ID,
      },
      schedule: {
        calendars: [
          {
            dayOfWeek: "*",
            hour: 17, // Everyday at 5pm UTC = 10am
          },
        ],
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
