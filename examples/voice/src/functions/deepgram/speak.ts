import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { TrackName } from "../../threads";
import { Buffer } from "node:buffer";
import "dotenv/config";
import { createClient } from "@deepgram/sdk";

const getAudioBuffer = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  const buffer = Buffer.from(dataArray.buffer);
  return buffer;
};

export async function deepgramSpeak({
  streamSid,
  trackName,
  text,
}: {
  streamSid: string;
  trackName: TrackName;
  text: string;
}): Promise<{ streamSid: string; audio: string }> {
  if (!text.length) {
    log.error("Text is empty");
    throw FunctionFailure.nonRetryable("Text is empty");
  }
  const deepgramModel =
    trackName === "agent" ? "aura-arcas-en" : "aura-asteria-en";

  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    const response = await deepgram.speak.request(
      { text },
      {
        model: deepgramModel,
        encoding: "mulaw",
        sample_rate: 8000,
        container: "none",
      }
    );
    const stream = await response.getStream();

    if (!stream) {
      log.error("Deepgram speak stream error", { response });
      throw new Error(`Deepgram speak stream error ${response}`);
    }

    const buffer = await getAudioBuffer(stream);
    if (!buffer) {
      log.error("Deepgram audio buffer error", { stream });
      throw new Error(`Deepgram audio buffer error ${stream}`);
    }
    const base64String = buffer.toString("base64");
    log.info("deepgramSpeak: ", {
      audioLength: base64String.length,
    });
    return { streamSid, audio: base64String };
  } catch (error) {
    log.error("Deepgram TTS error", { error });
    throw new Error(`Deepgram TTS error ${error}`);
  }
}
