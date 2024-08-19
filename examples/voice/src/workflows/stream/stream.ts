import {
  step,
  log,
  condition,
  startChild,
  workflowInfo,
} from "@restackio/restack-sdk-ts/workflow";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import * as functions from "../../functions";
import { agentWorkflow } from "../agent/agent";
import {
  audioInEvent,
  userEvent,
  streamEndEvent,
  StreamInfo,
  streamInfoEvent,
  UserEvent,
} from "./events";
import { assistantEvent } from "../agent/events";
import { websocketTaskQueue } from "@restackio/integrations-websocket/taskQueue";
import * as websocketFunctions from "@restackio/integrations-websocket/functions";
import { deepgramTaskQueue } from "@restackio/integrations-deepgram/taskQueue";
import * as deepgramFunctions from "@restackio/integrations-deepgram/functions";
import { StreamEvent } from "@restackio/integrations-openai/types";
import { WebsocketEvent } from "@restackio/integrations-websocket/types";

export async function streamWorkflow({ address }: { address?: string }) {
  try {
    let currentstreamSid: string;
    let interactionCount = 0;
    let audioQueue: {
      audio: string;
      text: string;
    }[] = [];
    let isSendingAudio = false;
    let childAgentRunId = "";

    const assistantName = "agent";

    // Start long running websocket and stream welcome message to websocket.
    onEvent(streamInfoEvent, async ({ streamSid }: StreamInfo) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      step<typeof websocketFunctions>({
        taskQueue: websocketTaskQueue,
        scheduleToCloseTimeout: "1 hour",
        heartbeatTimeout: "2 minutes",
      }).websocketListen({
        streamSid,
        address,
        events: [
          {
            websocketEventName: "media",
            workflowEventName: audioInEvent.name,
          },
          {
            websocketEventName: "stop",
            workflowEventName: streamEndEvent.name,
          },
        ],
      });

      const welcomeMessage = "Hello! I am Pete from Apple.";

      const { media } = await step<typeof deepgramFunctions>({
        taskQueue: deepgramTaskQueue,
      }).deepgramSpeak({
        text: welcomeMessage,
        twilioEncoding: true,
      });

      await step<typeof websocketFunctions>({
        taskQueue: websocketTaskQueue,
      }).websocketSend({
        name: "media",
        input: {
          streamSid,
          media: {
            trackId: assistantName,
            payload: media.payload,
          },
        },
        address,
      });

      await step<typeof websocketFunctions>({
        taskQueue: websocketTaskQueue,
      }).websocketSend({
        name: assistantEvent.name,
        input: {
          streamSid,
          data: { trackId: assistantName, text: welcomeMessage },
        },
        address,
      });

      currentstreamSid = streamSid;
      return { streamSid };
    });

    // Receives audio, transcribe it and send transcription to AI agent.

    onEvent(audioInEvent, async ({ streamSid, media }: WebsocketEvent) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);

      if (!media?.payload || media.trackId === assistantName) return;

      const { result } = await step<typeof deepgramFunctions>({
        taskQueue: deepgramTaskQueue,
      }).deepgramListen({
        base64Payload: media?.payload,
        twilioEncoding: true,
      });

      const transcript = result.results.channels[0].alternatives[0].transcript;

      if (!transcript.length) {
        const input: StreamEvent = {
          response: "Sorry i didn't understand. Can you repeat?",
          assistantName,
          isLast: true,
        };

        log.info("Answer to transcript ", { input });

        await step<typeof functions>({}).workflowSendEvent({
          event: {
            name: assistantEvent.name,
            input,
          },
          workflow: {
            workflowId: workflowInfo().workflowId,
            runId: workflowInfo().runId,
          },
        });
      }

      interactionCount += 1;

      step<typeof websocketFunctions>({
        taskQueue: websocketTaskQueue,
      }).websocketSend({
        name: userEvent.name,
        input: {
          streamSid,
          data: {
            trackId: media.trackId,
            text: transcript,
          },
        },
        address,
      });

      if (!childAgentRunId) {
        const childAgent = await startChild(agentWorkflow, {
          args: [
            {
              assistantName,
              userName: media.trackId,
              message: transcript,
            },
          ],
          workflowId: `${streamSid}-agentWorkflow`,
        });
        childAgentRunId = childAgent.firstExecutionRunId;
      } else {
        const input: UserEvent = {
          userName: media.trackId,
          message: transcript,
        };
        step<typeof functions>({
          taskQueue: `restack`,
        }).workflowSendEvent({
          event: {
            name: userEvent.name,
            input,
          },
          workflow: {
            workflowId: `${streamSid}-agentWorkflow`,
            runId: childAgentRunId,
          },
        });
      }
      return { streamSid };
    });

    // Receives AI answer, generates audio and stream it to websocket.

    onEvent(
      assistantEvent,
      async ({ response, isLast, assistantName }: StreamEvent) => {
        const { media } = await step<typeof deepgramFunctions>({
          taskQueue: deepgramTaskQueue,
        }).deepgramSpeak({
          text: response,
          twilioEncoding: true,
        });

        audioQueue.push({ audio: media.payload, text: response });

        if (!isSendingAudio && isLast) {
          isSendingAudio = true;

          while (audioQueue.length > 0) {
            const { audio } = audioQueue.shift()!;

            await step<typeof websocketFunctions>({
              taskQueue: websocketTaskQueue,
            }).websocketSend({
              name: "media",
              input: {
                streamSid: currentstreamSid,
                media: {
                  trackId: assistantName,
                  payload: audio,
                },
              },
              address,
            });
          }

          await step<typeof websocketFunctions>({
            taskQueue: websocketTaskQueue,
          }).websocketSend({
            name: assistantEvent.name,
            input: {
              streamSid: currentstreamSid,
              data: { trackId: assistantName, text: response },
            },
            address,
          });

          isSendingAudio = false;
        }

        return { response };
      }
    );

    // Terminates stream workflow.

    let ended = false;

    onEvent(streamEndEvent, async () => {
      log.info(`streamEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in streamWorkflow", { error });
    throw error;
  }
}
