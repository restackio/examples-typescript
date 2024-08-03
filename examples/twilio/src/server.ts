import "dotenv/config";
import express from "express";
import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import Restack from "@restackio/restack-sdk-ts";
import { twilioAgentWorkflow } from "./workflows";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;
export const websocketAddress = `wss://${process.env.SERVER}/connection`;

app.post("/incoming", async (req, res) => {
  try {
    const workflowId = `${Date.now()}-${twilioAgentWorkflow.name}`;
    const restack = new Restack();
    const runId = await restack.schedule({
      workflowName: twilioAgentWorkflow.name,
      workflowId,
    });

    console.log(`Started workflow with runId: ${runId}`);

    if (runId) {
      const response = new VoiceResponse();
      const connect = response.connect();
      const stream = connect.stream({ url: `${websocketAddress}` });

      stream.parameter({ name: "runId", value: runId });
      stream.parameter({ name: "workflowId", value: workflowId });
      res.type("text/xml");
      res.end(response.toString());
    } else {
      throw new Error("Failed to get runId from workflow handle");
    }
  } catch (err) {
    console.log(err);
  }
});

wss.on("connection", (ws) => {
  const restack = new Restack();

  let workflowId: string;
  let runId: string;

  ws.on("error", console.error);

  ws.on("message", async function message(data, isBinary) {
    // allows broadcast to all clients except this one (otherwwise echo)

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });

    const message = JSON.parse(data.toString());
    const streamSid = message.streamSid;

    if (message.event === "start") {
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`);
      runId = message.start.customParameters.runId;
      workflowId = message.start.customParameters.workflowId;
      if (runId) {
        try {
          const handle = await restack.getHandle(workflowId, runId);
          // const handle = client.workflow.getHandle(workflowId, runId);

          if (streamSid) {
            await handle.executeUpdate("streamSid", {
              args: [streamSid],
            });
            console.log(
              `Signaled workflow ${workflowId} runId ${runId} with Twilio streamId: ${streamSid}`
            );
          }
        } catch (error) {
          console.log("Error signaling workflow", error);
        }
      }
    }

    if (message.event === "stop") {
      console.log(`Twilio -> Media stream ${streamSid} ended.`);
      if (runId) {
        const handle = await restack.getHandle(workflowId, runId);
        handle.executeUpdate("endSignal", {
          args: [],
        });
      }
    }
  });
});

function shutdown() {
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
}

// Listen for termination signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
