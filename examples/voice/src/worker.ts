import Restack from "@restackio/restack-sdk-ts";
import {
  workflowSendEvent,
  twilioCall,
  deepgramListen,
  deepgramSpeak,
  openaiChat,
  websocketListenMedia,
  websocketSendAudio,
  websocketSendEvent,
  erpGetTools,
  erpPlaceOrder,
  erpCheckInventory,
  erpCheckPrice,
} from "./functions";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.startWorker({
        taskQueue: "restack",
        workflowsPath,
        functions: { workflowSendEvent },
      }),
      restack.startWorker({
        taskQueue: "websocket",
        workflowsPath,
        functions: {
          websocketListenMedia,
          websocketSendAudio,
          websocketSendEvent,
        },
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
        functions: {
          erpGetTools,
          erpCheckPrice,
          erpCheckInventory,
          erpPlaceOrder,
        },
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
