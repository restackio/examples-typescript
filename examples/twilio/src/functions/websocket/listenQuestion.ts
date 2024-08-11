import {
  log,
  heartbeat,
  currentWorkflow,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";

import Restack from "@restackio/restack-sdk-ts";
import { TrackName } from "../../threads/stream";

type StreamInput = {
  streamSid: string;
  trackName?: TrackName;
};

export async function listenQuestion({ streamSid }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.event === "question") {
        if (message.streamSid === streamSid) {
          const { text, interactionCount, trackName } = message.data;
          log.info("question", { text, interactionCount, trackName });
          const restack = new Restack();
          const { workflowId, runId } = currentWorkflow().workflowExecution;
          restack.update({
            workflowId,
            runId,
            updateName: "question",
            input: {
              streamSid,
              text,
              interactionCount,
            },
          });
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
