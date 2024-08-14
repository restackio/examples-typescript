import {
  step,
  log,
  condition,
  startChild,
} from "@restackio/restack-sdk-ts/workflow";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import * as functions from "../../functions";
import { agentWorkflow } from "../agent/agent";
import {
  Answer,
  answerEvent,
  AudioIn,
  audioInEvent,
  questionEvent,
  streamEndEvent,
  StreamInfo,
  streamInfoEvent,
} from "./events";
import { Reply, replyEvent } from "../agent/events";

export async function streamWorkflow() {
  try {
    let currentstreamSid: string;
    let interactionCount = 0;
    let audioQueue: {
      streamSid: string;
      audio: string;
      text: string;
    }[] = [];
    let isSendingAudio = false;
    let childAgentRunId = "";

    // Start long running websocket and send welcome message.
    onEvent(streamInfoEvent, async ({ streamSid }: StreamInfo) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      step<typeof functions>({
        taskQueue: `websocket`,
        scheduleToCloseTimeout: "30 minutes",
      }).websocketListenMedia({ streamSid });

      const welcomeMessage =
        "Hello! I am Pete from Apple. Are you thinking about getting AirPods?";
      const { audio } = await step<typeof functions>({
        taskQueue: `deepgram`,
      }).deepgramSpeak({
        streamSid,
        text: welcomeMessage,
      });

      await step<typeof functions>({
        taskQueue: `websocket`,
      }).websocketSendAudio({ streamSid, audio });

      await step<typeof functions>({
        taskQueue: `websocket`,
      }).websocketSendEvent({
        streamSid,
        eventName: answerEvent.name,
        data: { text: welcomeMessage },
      });

      currentstreamSid = streamSid;
      return { streamSid };
    });

    // Transcribe audio and send it to AI agent

    onEvent(audioInEvent, async ({ streamSid, payload }: AudioIn) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      const { finalResult } = await step<typeof functions>({
        taskQueue: `deepgram`,
      }).deepgramListen({ streamSid, payload });

      interactionCount += 1;

      step<typeof functions>({
        taskQueue: `websocket`,
      }).websocketSendEvent({
        streamSid,
        eventName: questionEvent.name,
        data: { text: finalResult },
      });

      if (!childAgentRunId) {
        const childAgent = await startChild(agentWorkflow, {
          args: [
            {
              streamSid,
              message: finalResult,
            },
          ],
          workflowId: `${streamSid}-agentWorkflow`,
        });
        childAgentRunId = childAgent.firstExecutionRunId;
      } else {
        const input: Reply = { streamSid, text: finalResult };
        step<typeof functions>({
          taskQueue: `restack`,
        }).workflowSendEvent({
          workflowId: `${streamSid}-agentWorkflow`,
          runId: childAgentRunId,
          eventName: replyEvent.name,
          input,
        });
      }
      return { streamSid };
    });

    // Generate audio from AI answer and send it to websocket

    onEvent(answerEvent, async ({ streamSid, response, isLast }: Answer) => {
      const { audio } = await step<typeof functions>({
        taskQueue: `deepgram`,
      }).deepgramSpeak({
        streamSid,
        text: response,
      });

      audioQueue.push({ streamSid, audio, text: response });

      if (!isSendingAudio && isLast) {
        isSendingAudio = true;

        while (audioQueue.length > 0) {
          const { streamSid, audio } = audioQueue.shift()!;

          await step<typeof functions>({
            taskQueue: `websocket`,
          }).websocketSendAudio({ streamSid, audio });
        }

        await step<typeof functions>({
          taskQueue: `websocket`,
        }).websocketSendEvent({
          streamSid,
          eventName: answerEvent.name,
          data: { text: response },
        });

        isSendingAudio = false;
      }

      return { streamSid };
    });

    // Terminates stream workflow

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
