import {
  step,
  log,
  workflowInfo,
  defineUpdate,
  onUpdate,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as streams from "../streams";
import * as functions from "../functions";
import { GptReply } from "../functions/openai/chat";

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
  gptReply: GptReply;
  interactionCount: number;
};

const streamInfo = defineUpdate<StreamInfo>("streamInfo");

export const audioInEvent = defineUpdate<AudioIn>("audioIn");

export const questionEvent = defineUpdate<Question>("question");

export const answerEvent = defineUpdate<Answer>("answer");

export const streamEnd = defineUpdate("streamEnd");

export async function twilioStreamWorkflow() {
  let currentstreamSid: string;
  let interactionCount = 0;
  const runId = workflowInfo().runId;
  log.info(`Workflow started with runId: ${runId}`);

  onUpdate(streamInfo, async ({ streamSid }: StreamInfo) => {
    log.info(`Workflow update with streamSid: ${streamSid}`);
    step<typeof streams>({
      podName: `websocket`,
      scheduleToCloseTimeout: "30 minutes",
    }).websocket({ streamSid, trackName: "user" });

    const welcomeMessage = {
      partialResponseIndex: null,
      partialResponse:
        "Hello! My name is Emilia from Apple. You are interested in Airpods, is that correct?",
    };

    const { audio } = await step<typeof functions>({
      podName: `deepgram`,
      scheduleToCloseTimeout: "2 minutes",
    }).textToAudio({
      streamSid,
      trackName: "agent",
      gptReply: welcomeMessage,
      interactionCount: 0,
    });

    await step<typeof streams>({
      podName: `websocket`,
      scheduleToCloseTimeout: "1 minute",
    }).sendAudio({ streamSid, trackName: "agent", audio });

    await step<typeof streams>({
      podName: `websocket`,
      scheduleToCloseTimeout: "2 minutes",
    }).sendEvent({
      streamSid,
      eventName: answerEvent.name,
      data: { text: welcomeMessage.partialResponse },
    });

    currentstreamSid = streamSid;
    return { streamSid };
  });

  onUpdate(audioInEvent, async ({ streamSid, trackName, payload }: AudioIn) => {
    log.info(`Workflow update with streamSid: ${streamSid}`);
    const { finalResult } = await step<typeof functions>({
      podName: `deepgram`,
      scheduleToCloseTimeout: "2 minutes",
    }).transcribe({ streamSid, trackName, payload });

    interactionCount += 1;

    await step<typeof streams>({
      podName: `websocket`,
      scheduleToCloseTimeout: "1 minute",
    }).sendEvent({
      streamSid,
      eventName: questionEvent.name,
      data: { text: finalResult },
    });

    await step<typeof functions>({
      podName: `openai`,
      scheduleToCloseTimeout: "2 minutes",
    }).questionAnswer({ streamSid, text: finalResult, interactionCount });

    return { streamSid };
  });

  onUpdate(
    answerEvent,
    async ({ streamSid, trackName, gptReply, interactionCount }: Answer) => {
      log.info(`answerEvent: ${gptReply}`);
      const { audio } = await step<typeof functions>({
        podName: `deepgram`,
        scheduleToCloseTimeout: "2 minutes",
      }).textToAudio({ streamSid, trackName, gptReply, interactionCount });

      await step<typeof streams>({
        podName: `websocket`,
        scheduleToCloseTimeout: "1 minute",
      }).sendEvent({
        streamSid,
        eventName: answerEvent.name,
        data: { text: gptReply.partialResponse },
      });

      log.info("audio", { audio: audio?.length });

      if (audio) {
        await step<typeof streams>({
          podName: `websocket`,
          scheduleToCloseTimeout: "2 minutes",
        }).sendAudio({ streamSid, trackName, audio });
      }

      return { streamSid };
    }
  );

  let ended = false;
  onUpdate(streamEnd, async () => {
    log.info(`streamEnd received`);
    ended = true;
  });

  await condition(() => ended);

  return;
}
