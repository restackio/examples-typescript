import Restack from "@restackio/restack-sdk-ts";
import {
  posthogGetRecordings,
  posthogGetSnapshotBlob,
  posthogGetSnapshots,
  posthogBlobChunks,
  posthogSessionEvents,
  workflowSendEvent,
} from "./functions";
import { openaiService } from "@restackio/integrations-openai";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    const restack = new Restack();

    // https://posthog.com/docs/api#rate-limiting

    await Promise.all([
      restack.startService({
        workflowsPath,
        functions: {
          workflowSendEvent,
        },
      }),
      restack.startService({
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
      openaiService(),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
