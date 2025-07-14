import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  shouldContinueAsNew,
  agentContinueAsNew,
} from "@restackio/ai/agent";
import * as functions from "../functions";

export type EndEvent = {
  end: boolean;
};

export const messagesEvent = defineEvent<functions.Message[]>("messages");
export const endEvent = defineEvent("end");

type AgentChatOutput = {
  messages: functions.Message[];
};

export async function agentChat(): Promise<AgentChatOutput | undefined> {
  let endReceived = false;
  let messages: functions.Message[] = [];

  onEvent(messagesEvent, async ({ messages }: { messages: functions.Message[] }) => {
    const result = await step<typeof functions>({}).llmChat({
      messages,
    });
    messages.push(result);
    return messages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  // We use the `condition` function to wait for the event goodbyeReceived to return `True` or the agent should continue as new.
  await condition(() => endReceived || shouldContinueAsNew());

  if (endReceived) {
    log.info("end condition met");
    return { messages };
  }

  await agentContinueAsNew();
}
