import { Buffer } from "node:buffer";
import { EventEmitter } from "events";
import axios from "axios";
import "dotenv/config";
import { log } from "@restackio/restack-sdk-ts/function";

class DeepgramTextToSpeech extends EventEmitter {
  private nextExpectedIndex: number;
  private speechBuffer: { [key: number]: string };

  constructor() {
    super();
    this.nextExpectedIndex = 0;
    this.speechBuffer = {};
  }

  async generate({
    gptReply,
    interactionCount,
  }: {
    gptReply: { partialResponseIndex: number | null; partialResponse: any };
    interactionCount: number;
  }) {
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) {
      return;
    }

    try {
      const response = await axios.post(
        `https://api.deepgram.com/v1/speak?model=${process.env.VOICE_MODEL}&encoding=mulaw&sample_rate=8000&container=none`,
        {
          text: partialResponse,
        },
        {
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      if (response.status === 200) {
        try {
          const audioArrayBuffer = response.data;
          const base64String = Buffer.from(audioArrayBuffer).toString("base64");
          this.emit(
            "speech",
            partialResponseIndex,
            base64String,
            partialResponse,
            interactionCount
          );
        } catch (err) {
          log.error("Error in Deepgram TTS:", { err });
        }
      } else {
        log.error("Deepgram TTS error:", { response });
      }
    } catch (err) {
      log.error("Error occurred in TextToSpeech service", { err });
    }
  }
}

export { DeepgramTextToSpeech };
