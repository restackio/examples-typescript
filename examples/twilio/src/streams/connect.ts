import WebSocket from "ws";
import "dotenv/config";
import { FunctionFailure } from "@restackio/restack-sdk-ts/function";

export function webSocketConnect(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      const websocketAddress = `wss://${process.env.SERVER}/connection`;
      const ws = new WebSocket(websocketAddress);

      ws.on("open", () => {
        resolve(ws);
      });

      ws.on("error", (error) => {
        reject(
          FunctionFailure.nonRetryable(
            `Error connecting to WebSocket: ${error}`
          )
        );
      });
    } catch (error) {
      reject(
        FunctionFailure.nonRetryable(`Error connecting to WebSocket: ${error}`)
      );
    }
  });
}
