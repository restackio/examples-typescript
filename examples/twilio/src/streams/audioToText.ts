import {
  log,
  FunctionFailure,
  heartbeat,
} from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { DeepgramSpeechToText } from "../functions/deepgram/speechToText";
import { TrackName } from "../workflows/twilioStream";

export type StreamInput = {
  streamSid: string;
  trackName?: TrackName;
};

export async function streamAudioToText({ streamSid, trackName }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    const speechToText = new DeepgramSpeechToText();
    let marks: string[] = [];
    let interactionCount = 0;

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.event === "media") {
        if (message.streamSid === streamSid) {
          if (message.media.track === "inbound") {
            speechToText.send(message.media.payload);
          }
        }
      }
      if (message.event === "mark") {
        const label = message.mark.name;
        marks = marks.filter((m) => m !== message.mark.name);
        log.info("Twilio -> Audio completed mark:", {
          label,
          sequenceNumber: message.sequenceNumber,
        });
      }

      if (message.streamSid === streamSid) heartbeat(message.streamSid);
      if (message.event === "stop") {
        resolve();
      }
    });

    speechToText.on("transcription", async (text) => {
      if (!text) {
        return;
      }
      const event = {
        streamSid,
        event: "question",
        data: { text, interactionCount, trackName },
      };
      ws.send(JSON.stringify(event));
      log.info(`Audio -> Transcription: ${event}`);
      interactionCount += 1;
    });

    speechToText.on("utterance", async (text) => {
      // This is a bit of a hack to filter out empty utterances
      if (marks.length > 0 && text?.length > 5) {
        const event = {
          streamSid,
          event: "clear",
        };
        ws.send(JSON.stringify(event));
        log.info("Twilio -> Interruption, Clearing stream", event);
      }
    });

    speechToText.on("error", (error) => {
      reject(
        FunctionFailure.nonRetryable(`Error in DeepgramSpeechToText: ${error}`)
      );
    });

    ws.on("close", () => {
      resolve();
    });
  });
}
