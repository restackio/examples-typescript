import { goodbye, geminiGenerateContent, geminiGenerateContentStream } from "./functions";

import { client } from "./client";

async function services() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
        functions: { goodbye },
      }),
      // Start the gemini service
      client.startService({
        taskQueue: "gemini",
        functions: { geminiGenerateContent, geminiGenerateContentStream },
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
