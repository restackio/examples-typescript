import Restack from "@restackio/restack-sdk-ts";
import {
  workflowSendEvent,
  erpGetTools,
  erpPlaceOrder,
  erpCheckInventory,
  erpCheckPrice,
} from "./functions";
import { websocketService } from "@restackio/integrations-websocket";
import { twilioService } from "@restackio/integrations-twilio";
import { openaiService } from "@restackio/integrations-openai";
import { deepgramService } from "@restackio/integrations-deepgram";

async function main() {
  const workflowsPath = require.resolve("./Workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.startService({
        workflowsPath,
        functions: { workflowSendEvent },
      }),
      restack.startService({
        taskQueue: "erp",
        functions: {
          erpGetTools,
          erpCheckPrice,
          erpCheckInventory,
          erpPlaceOrder,
        },
      }),
      websocketService(),
      twilioService(),
      openaiService(),
      deepgramService(),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
