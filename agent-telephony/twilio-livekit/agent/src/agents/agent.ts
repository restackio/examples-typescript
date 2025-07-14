import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  agentInfo,
  AgentError,
  childStart,
  uuid,
  sleep,
  shouldContinueAsNew,
  agentContinueAsNew,
} from "@restackio/ai/agent";
import * as functions from "../functions";
import { logicWorkflow } from "../workflows/logic";


export type EndEvent = {
  end: boolean;
};

export type CallEvent = {
  phoneNumber: string;
};

export type SayEvent = {
  text: string;
};

export type ContextEvent = {
  context: string;
};

export type PipelineMetricsEvent = {
  metrics: any,
  latencies: string
};

export const messagesEvent = defineEvent<functions.Message[]>("messages");
export const endEvent = defineEvent("end");
export const callEvent = defineEvent<{ phoneNumber: string; sipCallId: string }>("call");
export const sayEvent = defineEvent<SayEvent>("say");
export const pipelineMetricsEvent = defineEvent<PipelineMetricsEvent>("pipeline_metrics");
export const contextEvent = defineEvent<ContextEvent>("context");

type agentTwilioOutput = {
  recordingUrl?: string;
  livekitRoomId?: string;
  messages: functions.Message[];
  context: string;
};

type agentTwilioInput = {
  phoneNumber?: string;
}

export async function agentTwilio({ phoneNumber }: agentTwilioInput): Promise<agentTwilioOutput | undefined> {
  let endReceived = false;
  let messages: functions.Message[] = [];
  let context: string = "";
  let roomId: string = "";
  let roomName: string = "";
  

  onEvent(messagesEvent, async ({ messages}: { messages: functions.Message[] }) => {
    try {

    await childStart({
      child: logicWorkflow,
      childId:  `${uuid()}-logic`,
      input: {messages, roomName, context },
      taskQueue: "logic-workflow",
    })

    const fastResponse = await step<typeof functions>({}).llmTalk({
      messages,
      context,
      mode: "default",
      stream: true
    });

    messages.push(fastResponse);

    return messages;
    } catch (error) {
      log.error("error", { error });
      throw AgentError.nonRetryable("Error messagesEvent:", null, {error});
    }
  });

  onEvent(callEvent, async ({ phoneNumber }: CallEvent) => {
    try {
      const agentName = agentInfo().workflowType
      const agentId = agentInfo().workflowId
      const runId = agentInfo().runId
  
      const trunk = await step<typeof functions>({}).livekitOutboundTrunk();
  
      const sipTrunkId = trunk.sipTrunkId
  
      const call = await step<typeof functions>({}).livekitCall({sipTrunkId, phoneNumber, roomId, agentName, agentId, runId});
  
      return {
        phoneNumber,
        sipCallId: call.sipCallId
      }
    } catch (error) {
      log.error("error", { error });
      throw AgentError.nonRetryable("Error callEvent: ", null, {error});
    }   
  });

  onEvent(contextEvent, async ({ context }: { context: string }) => {
    log.info("contextEvent", { context });
    context = context;
    return { context };
  });

  onEvent(sayEvent, async ({ text }: { text: string }) => {
    log.info("sayEvent", { text });
    await step<typeof functions>({}).livekitSendData({roomName, text});
    return { text };
  });

  onEvent(endEvent, async () => {
    await step<typeof functions>({}).livekitSendData({roomName, text: "Thank you for calling restack. Goodbye!"});
    await sleep(8000);
    await step<typeof functions>({}).livekitDeleteRoom();
    endReceived = true;
  });

  onEvent(pipelineMetricsEvent, async ({metrics, latencies}: PipelineMetricsEvent) => {
    log.info("pipelineMetricsEvent", { metrics, latencies });
    return { metrics, latencies };
  });

  const room = await step<typeof functions>({}).livekitCreateRoom();

  roomId = room.sid;
  roomName = room.name;

  await step<typeof functions>({}).livekitToken({roomName});

  const {recordingUrl} = await step<typeof functions>({}).livekitRecording({roomName});

  await step<typeof functions>({}).livekitDispatch({roomName});

  if (phoneNumber) {
      const agentName = agentInfo().workflowType
      const agentId = agentInfo().workflowId
      const runId = agentInfo().runId
  
      const trunk = await step<typeof functions>({}).livekitOutboundTrunk();
  
      const sipTrunkId = trunk.sipTrunkId
  
      await step<typeof functions>({}).livekitCall({sipTrunkId, phoneNumber, roomId, agentName, agentId, runId});
  }
  
  // We use the `condition` function to wait for the event goodbyeReceived to return `True` or the agent should continue as new.
  await condition(() => endReceived || shouldContinueAsNew());
  
  if (endReceived) {
    log.info("end condition met");
    return {
      recordingUrl,
      livekitRoomId: roomId,
      messages,
      context
    };
  }

  await agentContinueAsNew();
}
