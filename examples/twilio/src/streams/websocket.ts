import {
  heartbeat,
  currentWorkflow,
  log,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { audioInEvent, TrackName } from "../workflows/twilioStream";
import Restack from "@restackio/restack-sdk-ts";

type StreamInput = {
  streamSid: string;
  trackName?: TrackName;
};

export async function websocket({ streamSid }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.event === "media") {
        if (message.streamSid === streamSid) {
          if (message.media.track === "inbound") {
            const restack = new Restack();
            const { workflowId, runId } = currentWorkflow().workflowExecution;
            log.info("send payload", {
              streamSid,
              payload: message.media.payload.length,
            });
            restack.update({
              workflowId,
              runId,
              updateName: audioInEvent.name,
              input: {
                streamSid,
                payload: message.media.payload,
                trackName: "user",
              },
            });
          }
        }
      }
      if (message.streamSid === streamSid) heartbeat(message.streamSid);
      if (message.event === "stop") {
        resolve();
      }
    });

    ws.on("close", () => {
      resolve();
    });
  });
}
