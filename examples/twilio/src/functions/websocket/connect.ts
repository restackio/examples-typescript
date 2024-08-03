import WebSocket from "ws";
import dotenv from "dotenv";
import { FunctionFailure } from "@restackio/restack-sdk-ts/function";

dotenv.config();

export function WebSocketConnect(): WebSocket {
  try {
    const websocketAddress = `wss://${process.env.SERVER}/connection`;
    const ws = new WebSocket(websocketAddress);
    return ws;
  } catch (error) {
    throw FunctionFailure.nonRetryable(
      `Error connecting to WebSocket: ${error}`
    );
  }
}
