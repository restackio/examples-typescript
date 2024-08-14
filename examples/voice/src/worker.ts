import Restack from "@restackio/restack-sdk-ts";
import {
  updateAgent,
  twilioCall,
  deepgramListen,
  deepgramSpeak,
  openaiChat,
  listenMedia,
  sendAudio,
  sendEvent,
  checkPrice,
  checkInventory,
  placeOrder,
  erpTools,
} from "./functions";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.startWorker({
        taskQueue: "restack",
        workflowsPath,
        functions: { updateAgent },
      }),
      restack.startWorker({
        taskQueue: "websocket",
        workflowsPath,
        functions: { listenMedia, sendAudio, sendEvent },
      }),
      restack.startWorker({
        taskQueue: "twilio",
        workflowsPath,
        functions: { twilioCall },
        rateLimit: 200,
      }),
      restack.startWorker({
        taskQueue: "openai",
        workflowsPath,
        functions: { openaiChat },
        rateLimit: 10000,
      }),
      restack.startWorker({
        taskQueue: "deepgram",
        workflowsPath,
        functions: { deepgramSpeak, deepgramListen },
        rateLimit: 10000,
      }),
      restack.startWorker({
        taskQueue: "erp",
        workflowsPath,
        functions: { erpTools, checkPrice, checkInventory, placeOrder },
      }),
    ]);

    console.log("Workers running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
