import {
  heartbeat,
  currentWorkflow,
  log,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import Restack from "@restackio/restack-sdk-ts";
import {
  AudioIn,
  audioInEvent,
  streamEndEvent,
  TrackName,
} from "../../workflows/stream";

type StreamInput = {
  streamSid: string;
  trackName?: TrackName;
};

export async function listenMedia({ streamSid }: StreamInput) {
  return new Promise<void>(async (resolve) => {
    const ws = await webSocketConnect();
    const restack = new Restack();
    const { workflowId, runId } = currentWorkflow().workflowExecution;
    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.streamSid === streamSid) {
        if (message.event === "media") {
          if (message.media.track === "inbound") {
            // Clean Twilio empty noise
            const cleanedPayload = message.media.payload?.replace(
              /(\+\/[a-zA-Z0-9+\/]{2,}==)/g,
              ""
            );
            if (!cleanedPayload) {
              return;
            }
            log.info("send payload", {
              streamSid,
              payload: message.media.payload.length,
            });
            const input: AudioIn = {
              streamSid,
              payload: message.media.payload,
              trackName: "user",
            };
            restack.sendWorkflowEvent({
              workflowId,
              runId,
              eventName: audioInEvent.name,
              input,
            });
          }
        }
      }
      heartbeat(message.streamSid);
      if (message.event === "stop") {
        restack.sendWorkflowEvent({
          workflowId,
          runId,
          eventName: streamEndEvent.name,
        });
        resolve();
      }
    });
  });
}
