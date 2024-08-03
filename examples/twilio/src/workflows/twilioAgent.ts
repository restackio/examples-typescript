import {
  sleep,
  step,
  log,
  workflowInfo,
  defineUpdate,
  setHandler,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";

type Transcription = {
  text: string;
  interactionCount: number;
};

type Media = {
  media: any;
  marksLength: number;
};

type Script = {
  gptReply: any;
  interactionCount: number;
};

const streamSid = defineUpdate<string, [string]>("streamSid");

const transcription = defineUpdate<Transcription, [Transcription]>(
  "transcription"
);
// const media = defineUpdate<Media, [Media]>("media");
const script = defineUpdate<Script, [Script]>("script");

const endSignal = defineUpdate("endSignal");

export async function twilioAgentWorkflow() {
  let twilioStreamSid: string;
  const runId = workflowInfo().runId;
  log.info(`Workflow started with runId: ${runId}`);

  setHandler(streamSid, async (streamSid: string) => {
    log.info(`Workflow update with streamSid: ${streamSid}`);
    const ws = step<typeof functions>({
      podName: `restack`,
      scheduleToCloseTimeout: "30 minutes",
    }).StartVoiceAgent({ streamSid });
    log.info(`ws: ${ws}`);
    twilioStreamSid = streamSid;
    return streamSid;
  });

  setHandler(
    transcription,
    async ({ text, interactionCount }: Transcription) => {
      log.info(`Received transcription: ${text}`);
      await step<typeof functions>({
        podName: `openai`,
        scheduleToCloseTimeout: "1 minute",
      }).OpenaiToWebsocket({
        text,
        interactionCount,
        streamSid: twilioStreamSid,
      });
      return { text, interactionCount };
    }
  );

  // setHandler(media, async ({ media, marksLength }: Media) => {
  //   log.info(`Received media: ${media} at ${marksLength}`);
  //   await step<typeof functions>({
  //     podName: `deepgram`,
  //     scheduleToCloseTimeout: "1 minute",
  //   }).DeepgramSpeechToTextToWebsocket({
  //     media,
  //     marksLength,
  //     streamSid: twilioStreamSid,
  //   });
  //   return { media, marksLength };
  // });

  setHandler(script, async ({ gptReply, interactionCount }: Script) => {
    log.info(`Received script: ${gptReply} at ${interactionCount}`);
    await step<typeof functions>({
      podName: `deepgram`,
      scheduleToCloseTimeout: "1 minute",
    }).DeepgramTextToSpeechToWebsocket({
      gptReply,
      interactionCount,
      streamSid: twilioStreamSid,
    });
    return { gptReply, interactionCount };
  });

  // Handle end signal
  let ended = false;
  setHandler(endSignal, async () => {
    log.info(`endSignal received`);
    ended = true;
  });

  // Keep the workflow running until it receives the end signal
  while (!ended) {
    await sleep(600000); // Sleep for 10 minutes
  }

  console.log(`Workflow ending with runId: ${runId}`);
}
