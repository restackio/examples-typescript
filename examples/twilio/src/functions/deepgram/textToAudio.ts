import { log } from "@restackio/restack-sdk-ts/function";
import { Answer } from "../../workflows";
import { Buffer } from "node:buffer";
import axios from "axios";

export async function textToAudio({
  streamSid,
  trackName,
  gptReply,
  interactionCount,
}: Answer) {
  const { partialResponseIndex, partialResponse } = gptReply;
  if (!partialResponse) throw new Error("No partial response provided");

  const deepgramModel =
    trackName === "agent" ? "aura-asteria-en" : "aura-arcas-en";

  const audioBuffers: {
    [interactionCount: number]: { [index: number]: string };
  } = {};
  const expectedAudioIndices: { [interactionCount: number]: number } = {};

  async function generateTTS({
    gptReply,
    trackName,
  }: {
    gptReply: { partialResponseIndex: number | null; partialResponse: any };
    trackName: string;
  }): Promise<string> {
    try {
      const response = await axios.post(
        `https://api.deepgram.com/v1/speak?model=${deepgramModel}&encoding=mulaw&sample_rate=8000&container=none`,
        { text: partialResponse },
        {
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      if (response.status === 200) {
        const base64String = Buffer.from(response.data).toString("base64");
        log.info("TextToAudio -> speech", {
          partialResponseIndex,
          audioLength: base64String.length,
          interactionCount,
        });
        return base64String;
      } else {
        log.error("Deepgram TTS error:", { response });
        throw new Error("Deepgram TTS error");
      }
    } catch (err) {
      log.error("Error occurred in TextToSpeech service", { err });
      throw err;
    }
  }

  function bufferAudio(
    interactionCount: number,
    index: number | null,
    audio: string
  ): string {
    if (!audioBuffers[interactionCount]) {
      audioBuffers[interactionCount] = {};
      expectedAudioIndices[interactionCount] = 0;
    }

    const expectedAudioIndex = expectedAudioIndices[interactionCount];
    log.info("Buffering audio", {
      interactionCount,
      index,
      expectedAudioIndex,
    });

    if (index === null || index === expectedAudioIndex) {
      if (index !== null) expectedAudioIndices[interactionCount]++;
      while (
        audioBuffers[interactionCount][expectedAudioIndices[interactionCount]]
      ) {
        const bufferedAudio =
          audioBuffers[interactionCount][
            expectedAudioIndices[interactionCount]
          ];
        audioBuffers[interactionCount][expectedAudioIndices[interactionCount]] =
          bufferedAudio;
        delete audioBuffers[interactionCount][
          expectedAudioIndices[interactionCount]
        ];
        expectedAudioIndices[interactionCount]++;
      }
      return audio;
    } else {
      audioBuffers[interactionCount][index] = audio;
    }
  }

  const audio = await generateTTS({ gptReply, trackName });
  const bufferedAudio = bufferAudio(
    interactionCount,
    partialResponseIndex,
    audio
  );

  return {
    streamSid,
    trackName,
    audio: bufferedAudio,
  };
}
