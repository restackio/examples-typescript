import {
  FunctionFailure,
  log,
  heartbeat,
} from "@restackio/restack-sdk-ts/function";
import { DeepgramSpeechToText } from "../deepgram/speechToText";
import { StreamAudio } from "../websocket/streamAudio";
import { DeepgramTextToSpeech } from "../deepgram/textToSpeech";
import { Context } from "@temporalio/activity";
import Restack from "@restackio/restack-sdk-ts";
import WebSocket from "ws";
import { WebSocketConnect } from "../websocket/connect";
// import { DeepgramTextToSpeechToWebsocket } from "../deepgram/ttsToWebsocket";

export class VoiceAgent {
  private ws: WebSocket;
  private streamSid: string;

  constructor(streamSid: string) {
    this.ws = WebSocketConnect();
    this.streamSid = streamSid;
  }

  getWebSocket() {
    return this.ws;
  }

  async start() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const textToSpeech = new DeepgramTextToSpeech();
        const restack = new Restack();
        const { runId, workflowId } = Context.current().info.workflowExecution;
        const handle = await restack.getHandle(workflowId, runId);

        textToSpeech.generate({
          gptReply: {
            partialResponseIndex: null,
            partialResponse:
              "Hello! My name is Emilia from Apple. You are interested in Airpods, is that correct?",
          },
          interactionCount: 0,
        });

        // TODO child workflow and update
        //
        // await handle.executeUpdate("script", {
        //   args: [
        //     {
        //       gptReply: {
        //         partialResponseIndex: null,
        //         partialResponse:
        //           "Hello! My name is Asteria from Apple. You are interested in Airpods, is that correct?",
        //       },
        //       interactionCount: 0,
        //     },
        //   ],
        // });

        const streamAudio = new StreamAudio(this.ws);
        const speechToText = new DeepgramSpeechToText();

        streamAudio.setStreamSid(this.streamSid);

        let marks: string[] = [];
        let interactionCount = 0;

        this.ws.on("open", () => {
          log.debug(`WebSocket connection opened`);
        });

        this.ws.on("message", async (data) => {
          const message = JSON.parse(data.toString());
          heartbeat(message);

          if (message.event === "media") {
            if (message.streamSid === this.streamSid) {
              // TODO child workflow and update
              //
              // await handle.executeUpdate("media", {
              //   args: [{ payload: message.media.payload }],
              // });
              speechToText.send(message.media.payload);
            } else {
              log.info(
                `Received message for different streamSid: ${message.streamSid}`
              );
            }
          }

          if (
            message.event === "gptreply" &&
            message.streamSid === this.streamSid
          ) {
            const { gptReply, interactionCount } = message.data;
            log.info(
              `Interaction ${interactionCount}: GPT -> TTS: ${gptReply.partialResponse}`
            );
            // TODO child workflow and update
            //
            // await handle.executeUpdate("script", {
            //   args: [{ gptReply, interactionCount }],
            // });
            textToSpeech.generate({ gptReply, interactionCount });
          }

          if (
            message.event === "sttreply" &&
            message.streamSid === this.streamSid
          ) {
            const { text } = message.data;
            if (!message.data.text) {
              return;
            }
            log.info(`Interaction ${interactionCount} – STT -> GPT: ${text}`);
            await handle.executeUpdate("transcription", {
              args: [{ text, interactionCount }],
            });
            interactionCount += 1;
          }

          if (
            message.event === "ttsreply" &&
            message.streamSid === this.streamSid
          ) {
            const { responseIndex, audio, label, interactionCount } =
              message.data;
            if (!message.data.audio) {
              return;
            }
            streamAudio.buffer(responseIndex, audio);
            log.info(
              `Audio ${responseIndex} for Interaction ${interactionCount}: TTS -> TWILIO: ${label}`
            );
          }

          if (message.event === "mark") {
            const label = message.mark.name;
            log.info(
              `Twilio -> Audio completed mark (${message.sequenceNumber}): ${label}`
            );
            marks = marks.filter((m) => m !== message.mark.name);
          }

          if (message.event === "stop") {
            log.info(`Twilio -> Media stream ${this.streamSid} ended.`);
            this.ws.close();
          }
        });

        // TODO child workflow and update
        //

        speechToText.on("utterance", async (text) => {
          if (marks.length > 0 && text?.length > 5) {
            log.info("Twilio -> Interruption, Clearing stream");
            this.ws.send(
              JSON.stringify({
                streamSid: this.streamSid,
                event: "clear",
              })
            );
          }
        });

        speechToText.on("transcription", async (text) => {
          if (!text) {
            return;
          }
          log.info(`Interaction ${interactionCount} – STT -> GPT: ${text}`);
          await handle.executeUpdate("transcription", {
            args: [{ text, interactionCount }],
          });
          interactionCount += 1;
        });

        textToSpeech.on(
          "speech",
          (responseIndex, audio, label, interactionCount) => {
            log.info(
              `Interaction ${interactionCount}: TTS -> TWILIO: ${label}`
            );
            streamAudio.buffer(responseIndex, audio);
          }
        );

        streamAudio.on("audiosent", (markLabel) => {
          marks.push(markLabel);
        });

        this.ws.on("close", async () => {
          log.info(`WebSocket closed for streamSid: ${this.streamSid}`);
          await handle.executeUpdate("endSignal", {
            args: [],
          });
          resolve();
        });

        this.ws.on("error", (error) => {
          log.error(`WebSocket error: ${error}`);
          reject(FunctionFailure.nonRetryable(`WebSocket error: ${error}`));
        });
      } catch (error) {
        reject(
          FunctionFailure.nonRetryable(
            `Error connecting to WebSocket: ${error}`
          )
        );
      }
    });
  }
}

export async function StartVoiceAgent({ streamSid }: { streamSid: string }) {
  try {
    const voiceAgent = new VoiceAgent(streamSid);
    await voiceAgent.start();
    log.info(`VoiceAgent started for streamSid: ${streamSid}`);
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error starting VoiceAgent: ${error}`);
  }
}
