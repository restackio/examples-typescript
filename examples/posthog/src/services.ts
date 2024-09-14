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
import { linearService } from "@restackio/integrations-linear";

async function services() {
  const workflowsPath = require.resolve("./workflows");

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
      openaiService({ client, taskQueueSuffix: "-beta" }),
      linearService({ client }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
