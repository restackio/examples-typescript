import {
  createClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { Buffer } from "node:buffer";
import { log } from "@restackio/restack-sdk-ts/function";
import "dotenv/config";

type Output = {
  streamSid: string;
  trackName: string;
  finalResult: string;
};

export async function transcribe({
  streamSid,
  trackName,
  payload,
}: {
  streamSid: string;
  trackName: string;
  payload: string;
}): Promise<Output> {
  return new Promise<Output>((resolve, reject) => {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const dgConnection = deepgram.listen.live({
      encoding: "mulaw",
      sample_rate: 8000,
      model: "nova-2",
      punctuate: true,
      interim_results: true,
      endpointing: 500,
      utterance_end_ms: 2000,
    });

    let finalResult = "";
    let speechFinal = false;

    dgConnection.on(LiveTranscriptionEvents.Open, () => {
      log.info("Deepgram connection opened");

      dgConnection.on(
        LiveTranscriptionEvents.Transcript,
        (transcriptionEvent: LiveTranscriptionEvent) => {
          log.info("Received transcription event", { transcriptionEvent });
          const alternatives = transcriptionEvent.channel?.alternatives;
          let text = "";
          if (alternatives) {
            text = alternatives[0]?.transcript;
          }

          if (transcriptionEvent.type === ("UtteranceEnd" as any)) {
            log.info("Received UtteranceEnd event");
            if (!speechFinal) {
              log.warn(
                `UtteranceEnd received before speechFinal, emit the text collected so far: ${finalResult}`
              );
              resolve({
                streamSid,
                trackName,
                finalResult,
              });
              return;
            } else {
              log.warn(
                "STT -> Speech was already final when UtteranceEnd received"
              );
              return;
            }
          }

          if (transcriptionEvent.is_final === true && text.trim().length > 0) {
            log.info("Received final transcription", { text });
            finalResult += ` ${text}`;
            if (transcriptionEvent.speech_final === true) {
              log.info("Speech is final, emitting transcription", {
                finalResult,
              });
              speechFinal = true;
              resolve({
                streamSid,
                trackName,
                finalResult,
              });
              finalResult = "";
            } else {
              speechFinal = false;
            }
          } else {
            log.info("Emitting interim utterance", { text });
          }
        }
      );

      dgConnection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
        log.error("STT -> deepgram error", { error });
        reject(error);
      });

      dgConnection.on(
        LiveTranscriptionEvents.Unhandled,
        (unhandledEvent: unknown) => {
          log.error("STT -> deepgram unhandled event", { unhandledEvent });
        }
      );

      dgConnection.on(LiveTranscriptionEvents.Metadata, (metadata: unknown) => {
        log.info("STT -> deepgram metadata", { metadata });
      });

      dgConnection.on(LiveTranscriptionEvents.Close, () => {
        log.warn("STT -> Deepgram connection closed");
      });
    });

    const sendPayload = () => {
      const readyState = dgConnection.getReadyState();
      log.info("Deepgram connection readyState", { readyState });

      if (readyState === 1) {
        dgConnection.send(Buffer.from(payload, "base64"));
      } else if (readyState === 0) {
        log.info("Deepgram connection is connecting, retrying...");
        setTimeout(sendPayload, 100); // Retry after 1 second
      } else {
        log.warn("Cannot send payload, Deepgram connection is not open");
        reject(new Error("Deepgram connection is not open"));
      }
    };

    sendPayload();
  });
}
