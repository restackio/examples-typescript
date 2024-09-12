import { goodbye } from "./functions";
import { openaiService } from "@restackio/integrations-openai";
import { client } from "./client";

async function main() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
        functions: { goodbye },
      }),
      // Start the openai service
      openaiService({ client }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
