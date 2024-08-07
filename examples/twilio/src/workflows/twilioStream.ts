import {
  step,
  log,
  workflowInfo,
  defineUpdate,
  onUpdate,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as streams from "../streams";

export type TrackName = "user" | "agent" | "testUser";

type StreamInfo = {
  streamSid: string;
};

export type Question = {
  streamSid: string;
  text: string;
  interactionCount: number;
};

const streamInfo = defineUpdate<StreamInfo>("streamInfo");
const question = defineUpdate<Question>("question");
const streamEnd = defineUpdate("streamEnd");

export async function twilioStreamWorkflow() {
  let currentstreamSid: string;
  const runId = workflowInfo().runId;
  log.info(`Workflow started with runId: ${runId}`);

  onUpdate(streamInfo, async ({ streamSid }: StreamInfo) => {
    log.info(`Workflow update with streamSid: ${streamSid}`);
    step<typeof streams>({
      podName: `deepgram`,
      scheduleToCloseTimeout: "30 minutes",
    }).streamAudioToText({ streamSid, trackName: "user" });
    step<typeof streams>({
      podName: `openai`,
      scheduleToCloseTimeout: "30 minutes",
    }).streamQuestion({ streamSid });
    step<typeof streams>({
      podName: `deepgram`,
      scheduleToCloseTimeout: "30 minutes",
    }).streamTextToAudio({ streamSid, trackName: "agent" });
    currentstreamSid = streamSid;
    return { streamSid };
  });

  onUpdate(
    question,
    async ({ streamSid, text, interactionCount }: Question) => {
      log.info(`Workflow update with question: ${streamSid}`);
      await step<typeof streams>({
        podName: `openai`,
        scheduleToCloseTimeout: "2 minutes",
      }).questionAnswer({ streamSid, text, interactionCount });
      return { streamSid, text, interactionCount };
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
