import {
  heartbeat,
  currentWorkflow,
  log,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import Restack from "@restackio/restack-sdk-ts";
import { audioInEvent, streamEnd, TrackName } from "../../threads/stream";

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
      heartbeat(message.streamSid);
      if (message.event === "stop") {
        restack.update({ workflowId, runId, updateName: streamEnd.name });
        resolve();
      }
    });
  });
}
