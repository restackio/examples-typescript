import {
  step,
  log,
  workflowInfo,
  condition,
  startChild,
} from "@restackio/restack-sdk-ts/workflow";
import { defineEvent, onEvent } from "@restackio/restack-sdk-ts/event";
import * as functions from "../functions";
import { agentWorkflow, replyEvent } from "./agent";

export type TrackName = "user" | "agent" | "testUser";

type StreamInfo = {
  streamSid: string;
};

export type AudioIn = {
  streamSid: string;
  trackName: TrackName;
  payload: string;
};

export type Question = {
  streamSid: string;
  text: string;
  interactionCount: number;
};

export type Answer = {
  streamSid: string;
  trackName: TrackName;
  response: string;
  isLast?: boolean;
};

export const streamInfo = defineEvent<StreamInfo>("streamInfo");

export const audioInEvent = defineEvent<AudioIn>("audioIn");

export const questionEvent = defineEvent<Question>("question");

export const answerEvent = defineEvent<Answer>("answer");

export const streamEnd = defineEvent("streamEnd");

export async function streamWorkflow() {
  try {
    let currentstreamSid: string;
    let interactionCount = 0;
    let audioQueue: {
      streamSid: string;
      trackName: TrackName;
      audio: string;
      text: string;
    }[] = [];
    let isSendingAudio = false;
    const runId = workflowInfo().runId;
    let childAgentRunId = "";
    log.info(`Workflow started with runId: ${runId}`);

    onEvent(streamInfo, async ({ streamSid }: StreamInfo) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      step<typeof functions>({
        taskQueue: `websocket`,
        scheduleToCloseTimeout: "30 minutes",
      }).listenMedia({ streamSid, trackName: "user" });

      const welcomeMessage = "Hello! My name is Pete from Apple.";
      const { audio } = await step<typeof functions>({
        taskQueue: `deepgram`,
        scheduleToCloseTimeout: "2 minutes",
      }).deepgramSpeak({
        streamSid,
        trackName: "agent",
        text: welcomeMessage,
      });

      await step<typeof functions>({
        taskQueue: `websocket`,
        scheduleToCloseTimeout: "2 minutes",
      }).sendAudio({ streamSid, audio });

      await step<typeof functions>({
        taskQueue: `websocket`,
        scheduleToCloseTimeout: "2 minutes",
      }).sendEvent({
        streamSid,
        eventName: answerEvent.name,
        data: { text: welcomeMessage },
      });

      currentstreamSid = streamSid;
      return { streamSid };
    });

    onEvent(
      audioInEvent,
      async ({ streamSid, trackName, payload }: AudioIn) => {
        log.info(`Workflow update with streamSid: ${streamSid}`);
        const { finalResult } = await step<typeof functions>({
          taskQueue: `deepgram`,
          scheduleToCloseTimeout: "2 minutes",
        }).deepgramListen({ streamSid, trackName, payload });

        interactionCount += 1;

        step<typeof functions>({
          taskQueue: `websocket`,
          scheduleToCloseTimeout: "1 minute",
        }).sendEvent({
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
                trackName: "agent",
              },
            ],
            workflowId: `${streamSid}-agentWorkflow`,
          });
          childAgentRunId = childAgent.firstExecutionRunId;
        } else {
          step<typeof functions>({
            taskQueue: `restack`,
            scheduleToCloseTimeout: "1 minute",
          }).updateAgent({
            workflowId: `${streamSid}-agentWorkflow`,
            runId: childAgentRunId,
            eventName: replyEvent.name,
            input: { streamSid, trackName, text: finalResult },
          });
        }
        return { streamSid };
      }
    );

    onEvent(
      answerEvent,
      async ({ streamSid, trackName, response, isLast }: Answer) => {
        const { audio } = await step<typeof functions>({
          taskQueue: `deepgram`,
          scheduleToCloseTimeout: "2 minutes",
        }).deepgramSpeak({
          streamSid,
          trackName,
          text: response,
        });

        audioQueue.push({ streamSid, trackName, audio, text: response });

        if (!isSendingAudio && isLast) {
          isSendingAudio = true;

          while (audioQueue.length > 0) {
            const { streamSid, audio } = audioQueue.shift()!;

            await step<typeof functions>({
              taskQueue: `websocket`,
              scheduleToCloseTimeout: "2 minutes",
            }).sendAudio({ streamSid, audio });
          }

          await step<typeof functions>({
            taskQueue: `websocket`,
            scheduleToCloseTimeout: "1 minute",
          }).sendEvent({
            streamSid,
            eventName: answerEvent.name,
            data: { text: response },
          });

          isSendingAudio = false;
        }

        return { streamSid };
      }
    );

    let ended = false;
    onEvent(streamEnd, async () => {
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
