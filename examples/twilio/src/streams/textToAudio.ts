import { heartbeat, log } from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { DeepgramTextToSpeech } from "../functions/deepgram/textToSpeech";
import { v4 as uuidv4 } from "uuid";
import { StreamInput } from "./audioToText";

export async function streamTextToAudio({ streamSid, trackName }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    const textToSpeech = new DeepgramTextToSpeech();

    textToSpeech.generate({
      gptReply: {
        partialResponseIndex: null,
        partialResponse:
          "Hello! My name is Emilia from Apple. You are interested in Airpods, is that correct?",
      },
      interactionCount: 0,
      trackName: "agent",
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.event === "answer") {
        if (message.streamSid === streamSid) {
          const { gptReply, interactionCount, trackName } = message.data;
          log.info("TextToAudio -> gptReply:", gptReply);
          textToSpeech.generate({
            gptReply,
            interactionCount,
            trackName,
          });
        }
      }
      if (message.streamSid === streamSid) heartbeat(message.streamSid);
      if (message.event === "stop") {
        resolve();
      }
    });

    ws.on("close", () => {
      resolve();
    });

    textToSpeech.on("speech", (partialResponseIndex, base64String) => {
      log.info("TextToAudio -> speech", {
        partialResponseIndex,
        audioLength: base64String.length,
      });
      bufferAudio(partialResponseIndex, base64String);
    });

    function bufferAudio(index: number, audio: string) {
      let expectedAudioIndex = 0;

      const audioBuffer: { [key: number]: string } = {};

      // Escape hatch for intro message, which doesn't have an index
      if (index === null) {
        sendAudio(audio);
      } else if (index === expectedAudioIndex) {
        sendAudio(audio);
        expectedAudioIndex++;

        while (
          Object.prototype.hasOwnProperty.call(audioBuffer, expectedAudioIndex)
        ) {
          const bufferedAudio = audioBuffer[expectedAudioIndex];
          sendAudio(bufferedAudio);
          expectedAudioIndex++;
        }
      } else {
        audioBuffer[index] = audio;
      }
    }

    function sendAudio(audio: string) {
      const audioEvent = {
        streamSid: streamSid,
        event: "media",
        media: {
          payload: audio,
        },
      };
      ws.send(JSON.stringify(audioEvent));
      // When the media completes you will receive a `mark` message with the label
      const markLabel = uuidv4();
      ws.send(
        JSON.stringify({
          streamSid: streamSid,
          event: "mark",
          mark: {
            name: markLabel,
          },
        })
      );
      ws.emit("audiosent", markLabel);
    }
  });
}
