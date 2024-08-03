import { OpenaiChat } from "./chat";
import { log, FunctionFailure } from "@restackio/restack-sdk-ts/function";
import { VoiceAgent } from "../agent/voiceAgent"; // Import VoiceAgent

export type OpenaiChatInput = {
  text: string;
  interactionCount: number;
  streamSid: string;
};

export type OpenaiChatOutput = {
  gptReply: string;
  interactionCount: number;
};

export async function OpenaiToWebsocket({
  text,
  interactionCount,
  streamSid,
}: OpenaiChatInput): Promise<OpenaiChatOutput> {
  try {
    const voiceAgent = new VoiceAgent(streamSid);
    const ws = voiceAgent.getWebSocket();

    const openaiChat = new OpenaiChat();
    openaiChat.setCallSid(streamSid);

    return new Promise((resolve, reject) => {
      openaiChat.completion(text, interactionCount);

      openaiChat.on("gptreply", async (gptReply, interactionCount) => {
        log.info(
          `Interaction ${interactionCount}: GPT -> TTS: ${gptReply.partialResponse}`
        );
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              streamSid,
              event: "gptreply",
              data: { gptReply, interactionCount },
            })
          );
        }
        resolve({ gptReply, interactionCount });
      });

      openaiChat.on("error", (error) => {
        reject(
          FunctionFailure.nonRetryable(`Error in openaiChatActivity: ${error}`)
        );
      });
    });
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error in openaiChatActivity: ${error}`);
  }
}
