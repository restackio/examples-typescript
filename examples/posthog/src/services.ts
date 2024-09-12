import {
  posthogGetRecordings,
  posthogGetSnapshotBlob,
  posthogGetSnapshots,
  posthogBlobChunks,
  posthogSessionEvents,
  workflowSendEvent,
} from "./functions";
import { openaiService } from "@restackio/integrations-openai";
import { client } from "./client";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    // https://posthog.com/docs/api#rate-limiting

    await Promise.all([
      client.startService({
        workflowsPath,
        functions: {
          workflowSendEvent,
        },
      }),
      client.startService({
        taskQueue: "posthog",
        functions: {
          posthogGetRecordings,
          posthogGetSnapshotBlob,
          posthogGetSnapshots,
          posthogBlobChunks,
          posthogSessionEvents,
        },
        options: {
          rateLimit: 240 * 60,
        },
      }),
      openaiService({ client }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
