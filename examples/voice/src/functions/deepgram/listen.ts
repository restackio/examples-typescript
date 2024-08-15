import { FunctionFailure, log } from "@restackio/restack-sdk-ts/function";
import { Buffer } from "node:buffer";
import "dotenv/config";
import { deepgramClient } from "./client";

export async function deepgramListen({
  streamSid,
  payload,
}: {
  streamSid: string;
  payload: string;
}) {
  if (!payload) {
    throw FunctionFailure.nonRetryable("No audio file");
  }

  try {
    const decodedBuffer = Buffer.from(payload, "base64");
    const deepgram = deepgramClient();
    const response = await deepgram.listen.prerecorded.transcribeFile(
      decodedBuffer,
      {
        encoding: "mulaw",
        sample_rate: 8000,
        model: "nova-2",
        punctuate: true,
        interim_results: true,
        endpointing: 500,
        utterance_end_ms: 2000,
      }
    );

    if (response.error) {
      log.error("deepgramListen error", { error: response.error });
    }

    const results = response.result?.results;
    const transcript = results?.channels?.[0]?.alternatives?.[0]?.transcript;

    return {
      streamSid,
      finalResult: transcript ?? "",
    };
  } catch (error) {
    throw new Error(`Deepgram TTS error ${error}`);
  }
}
