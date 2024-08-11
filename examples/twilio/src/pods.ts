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
  const workflowsPath = require.resolve("./threads");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.pod({
        name: "restack",
        workflowsPath,
        functions: { updateAgent },
      }),
      restack.pod({
        name: "websocket",
        workflowsPath,
        functions: { listenMedia, sendAudio, sendEvent },
      }),
      restack.pod({
        name: "twilio",
        workflowsPath,
        functions: { twilioCall },
        rateLimit: 200,
      }),
      restack.pod({
        name: "openai",
        workflowsPath,
        functions: { openaiChat },
        rateLimit: 10000,
      }),
      restack.pod({
        name: "deepgram",
        workflowsPath,
        functions: { deepgramSpeak, deepgramListen },
        rateLimit: 10000,
      }),
      restack.pod({
        name: "erp",
        workflowsPath,
        functions: { erpTools, checkPrice, checkInventory, placeOrder },
      }),
    ]);

    console.log("Pods running successfully.");
  } catch (e) {
    console.error("Failed to run pod", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
