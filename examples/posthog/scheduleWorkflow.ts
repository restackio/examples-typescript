import "dotenv/config";
import { client } from "./src/client";

async function scheduleWorkflow() {
  try {
    const workflowRunId = await client.scheduleWorkflow({
      workflowName: "digestWorkflow",
      workflowId: `${Date.now()}-digestWorkflow`,
      input: {
        projectId: process.env.POSTHOG_PROJECT_ID,
        host: process.env.POSTHOG_HOST,
        maxRecordings: 2, // Useful to limit cost when debugging locally. Comment out to run for all recordings
        maxChunksPerRecordingBlob: 2, // Useful to limit cost when debugging locally. Comment out to process all chunks per recording
        linearTeamId: process.env.LINEAR_TEAM_ID,
      },
      // Uncomment to schedule workflow to run at a specific time
      // schedule: {
      //   calendars: [
      //     {
      //       dayOfWeek: "*",
      //       hour: 17, // Everyday at 5pm UTC = 10am PST
      //     },
      //   ],
      // },
    });

    console.log("Workflow scheduled successfully:", workflowRunId);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
