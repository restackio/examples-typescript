import { OpenaiChatOutput } from "../openai/toWebsocket";
import { WebSocketConnect } from "./connect";
import { log, FunctionFailure } from "@restackio/restack-sdk-ts/function";

export async function emitToWebSocket({
  event,
  streamSid,
  data,
}: {
  event: string;
  streamSid: string;
  data: OpenaiChatOutput;
}) {
  try {
    const ws = WebSocketConnect();

    ws.send(JSON.stringify({ streamSid, event, data }));
    log.info(`Emitting to WebSocket: ${event}`, { streamSid, data });
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error emitting to WebSocket: ${error}`);
  }
}
