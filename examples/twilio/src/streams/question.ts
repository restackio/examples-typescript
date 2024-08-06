import {
  log,
  heartbeat,
  currentWorkflow,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { OpenaiChat } from "../functions/openai/chat";
import { StreamInput } from "./audioToText";
import Restack from "@restackio/restack-sdk-ts";

export async function streamQuestion({ streamSid }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    const openaiChat = new OpenaiChat();
    openaiChat.setCallSid({ callSid: streamSid });

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
      if (message.event === "stop") {
        resolve();
      }
      if (message.streamSid === streamSid) heartbeat(message.streamSid);
    });

    ws.on("close", () => {
      resolve();
    });
  });
}
