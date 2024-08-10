import { heartbeat, log } from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { DeepgramTextToSpeech } from "../functions/deepgram/textToSpeech";
import { v4 as uuidv4 } from "uuid";
import { StreamInput } from "./audioToText";
import { TrackName } from "../workflows";

export async function streamTextToAudio({ streamSid, trackName }: StreamInput) {
  return new Promise<void>(async (resolve, reject) => {
    const ws = await webSocketConnect();

    const textToSpeech = new DeepgramTextToSpeech();

    const welcomeMessage = {
      gptReply: {
        partialResponseIndex: null,
        partialResponse:
          "Hello! My name is Emilia from Apple. You are interested in Airpods, is that correct?",
      },
      interactionCount: 0,
      trackName: "agent" as TrackName,
    };

    textToSpeech.generate(welcomeMessage);

    const event = {
      streamSid,
      event: "answer",
      data: welcomeMessage,
    };
    ws.send(JSON.stringify(event));

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

    textToSpeech.on(
      "speech",
      (
        partialResponseIndex,
        base64String,
        partialResponse,
        interactionCount
      ) => {
        log.info("TextToAudio -> speech", {
          partialResponseIndex,
          audioLength: base64String.length,
          interactionCount,
        });
        bufferAudio(interactionCount, partialResponseIndex, base64String);
      }
    );

    const audioBuffers: {
      [interactionCount: number]: { [index: number]: string };
    } = {};
    const expectedAudioIndices: { [interactionCount: number]: number } = {};

    function bufferAudio(
      interactionCount: number,
      index: number,
      audio: string
    ) {
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

      // Escape hatch for intro message, which doesn't have an index
      if (index === null) {
        sendAudio(audio);
      } else if (index === expectedAudioIndex) {
        sendAudio(audio);
        expectedAudioIndices[interactionCount]++;

        while (
          audioBuffers[interactionCount].hasOwnProperty(
            expectedAudioIndices[interactionCount]
          )
        ) {
          const bufferedAudio =
            audioBuffers[interactionCount][
              expectedAudioIndices[interactionCount]
            ];
          sendAudio(bufferedAudio);
          delete audioBuffers[interactionCount][
            expectedAudioIndices[interactionCount]
          ];
          expectedAudioIndices[interactionCount]++;
        }
      } else {
        audioBuffers[interactionCount][index] = audio;
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
