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
import { client } from "./client";

export async function services() {
  const workflowsPath = require.resolve("./workflows");

  try {
    await Promise.all([
      client.startService({
        workflowsPath,
        functions: { workflowSendEvent },
      }),
      client.startService({
        taskQueue: "erp",
        functions: {
          erpGetTools,
          erpCheckPrice,
          erpCheckInventory,
          erpPlaceOrder,
        },
      }),
      websocketService({ client }),
      twilioService({ client }),
      openaiService({ client }),
      deepgramService({ client }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

services().catch((err) => {
  console.error("Error in services:", err);
});
