import { hello } from "./functions";
import { openaiService } from "@restackio/integrations-openai";
import { client } from "./client";

async function services() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
        functions: { hello },
      }),
      // Start the openai service
      openaiService({ client }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
