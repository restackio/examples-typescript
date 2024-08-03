import {
  createClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { Buffer } from "node:buffer";
import { EventEmitter } from "events";
import { log } from "@restackio/restack-sdk-ts/function";
import "dotenv/config";

class DeepgramSpeechToText extends EventEmitter {
  private dgConnection: any;
  private finalResult: string;
  private speechFinal: boolean;

  constructor() {
    super();
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    this.dgConnection = deepgram.listen.live({
      encoding: "mulaw",
      sample_rate: 8000,
      model: "nova-2",
      punctuate: true,
      interim_results: true,
      endpointing: 50,
      utterance_end_ms: 1000,
    });

    this.finalResult = "";
    this.speechFinal = false;

    this.dgConnection.on(LiveTranscriptionEvents.Open, () => {
      this.dgConnection.on(
        LiveTranscriptionEvents.Transcript,
        (transcriptionEvent: LiveTranscriptionEvent) => {
          const alternatives = transcriptionEvent.channel?.alternatives;
          let text = "";
          if (alternatives) {
            text = alternatives[0]?.transcript;
          }
          // @ts-ignore
          if (transcriptionEvent.type === "UtteranceEnd") {
            if (!this.speechFinal) {
              log.warn(
                `UtteranceEnd received before speechFinal, emit the text collected so far: ${this.finalResult}`
              );
              this.emit("transcription", this.finalResult);
              return;
            } else {
              log.warn(
                "STT -> Speech was already final when UtteranceEnd received"
              );
              return;
            }
          }

          if (transcriptionEvent.is_final === true && text.trim().length > 0) {
            this.finalResult += ` ${text}`;
            if (transcriptionEvent.speech_final === true) {
              this.speechFinal = true;
              this.emit("transcription", this.finalResult);
              this.finalResult = "";
            } else {
              this.speechFinal = false;
            }
          } else {
            this.emit("utterance", text);
          }
        }
      );

      this.dgConnection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
        log.error("STT -> deepgram error", { error });
      });

      this.dgConnection.on(
        LiveTranscriptionEvents.Unhandled,
        (unhandledEvent: unknown) => {
          log.error("STT -> deepgram unhandled event", { unhandledEvent });
        }
      );

      this.dgConnection.on(
        LiveTranscriptionEvents.Metadata,
        (metadata: unknown) => {
          log.error("STT -> deepgram metadata", { metadata });
        }
      );

      this.dgConnection.on(LiveTranscriptionEvents.Close, () => {
        log.warn("STT -> Deepgram connection closed");
      });
    });
  }

  send(payload: string) {
    if (this.dgConnection.getReadyState() === 1) {
      this.dgConnection.send(Buffer.from(payload, "base64"));
    }
  }
}

export { DeepgramSpeechToText };
