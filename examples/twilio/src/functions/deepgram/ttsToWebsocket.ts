import { DeepgramTextToSpeech } from "./textToSpeech";
import { log, FunctionFailure } from "@restackio/restack-sdk-ts/function";
import { VoiceAgent } from "../agent/voiceAgent";

export type DeepgramTextToSpeechInput = {
  gptReply: {
    partialResponseIndex: number;
    partialResponse: any;
  };
  interactionCount: number;
  streamSid: string;
};

export type DeepgramTextToSpeechOutput = {
  audioLength: number;
  interactionCount: number;
};

export async function DeepgramTextToSpeechToWebsocket({
  gptReply,
  interactionCount,
  streamSid,
}: DeepgramTextToSpeechInput): Promise<DeepgramTextToSpeechOutput> {
  try {
    const voiceAgent = new VoiceAgent(streamSid);
    const ws = voiceAgent.getWebSocket();

    const textToSpeech = new DeepgramTextToSpeech();

    return new Promise((resolve, reject) => {
      textToSpeech.generate({ gptReply, interactionCount });

      textToSpeech.on(
        "speech",
        (responseIndex, audio, label, interactionCount) => {
          log.info(`Interaction ${interactionCount}: TTS -> TWILIO: ${label}`);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                streamSid,
                event: "ttsreply",
                data: { responseIndex, audio, label, interactionCount },
              })
            );
          }
          resolve({ audioLength: audio.length, interactionCount });
        }
      );

      textToSpeech.on("error", (error) => {
        reject(
          FunctionFailure.nonRetryable(
            `Error in DeepgramTextToSpeech: ${error}`
          )
        );
      });
    });
  } catch (error) {
    throw FunctionFailure.nonRetryable(
      `Error in DeepgramTextToSpeech: ${error}`
    );
  }
}
