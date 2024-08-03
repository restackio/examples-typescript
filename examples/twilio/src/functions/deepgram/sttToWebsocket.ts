import { DeepgramSpeechToText } from "./speechToText";
import { log, FunctionFailure } from "@restackio/restack-sdk-ts/function";
import { VoiceAgent } from "../agent/voiceAgent";

export type DeepgramSpeechToTextInput = {
  media: any;
  streamSid: string;
  marksLength: number;
};

export type DeepgramSpeechToTextOutput = {
  text: string;
};

export async function DeepgramSpeechToTextToWebsocket({
  media,
  marksLength,
  streamSid,
}: DeepgramSpeechToTextInput): Promise<DeepgramSpeechToTextOutput> {
  try {
    const voiceAgent = new VoiceAgent(streamSid);
    const ws = voiceAgent.getWebSocket();

    const speechToText = new DeepgramSpeechToText();

    speechToText.send(media);

    return new Promise((resolve, reject) => {
      speechToText.on("transcription", async (text) => {
        log.info(`STT -> Transcription: ${text}`);
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              streamSid,
              event: "sttreply",
              data: { text },
            })
          );
        }
        resolve({ text });
      });

      speechToText.on("utterance", async (text) => {
        log.info(`STT -> Transcription: ${text}`);
        if (marksLength > 0 && text?.length > 5) {
          log.info("Twilio -> Interruption, Clearing stream");
          ws.send(
            JSON.stringify({
              streamSid,
              event: "clear",
            })
          );
        }
        resolve({ text });
      });

      speechToText.on("error", (error) => {
        reject(
          FunctionFailure.nonRetryable(
            `Error in DeepgramSpeechToText: ${error}`
          )
        );
      });
    });
  } catch (error) {
    throw FunctionFailure.nonRetryable(
      `Error in DeepgramSpeechToText: ${error}`
    );
  }
}
