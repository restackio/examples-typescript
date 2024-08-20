import Restack from "@restackio/restack-sdk-ts";
import { goodbye } from "./functions";
import { openaiService } from "@restackio/integrations-openai";
export const restack = new Restack();

async function main() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      restack.startService({
        workflowsPath,
        functions: { goodbye },
      }),
      // Start the openai service
      openaiService(),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
