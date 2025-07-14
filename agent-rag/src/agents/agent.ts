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

export async function agentChatRAG(): Promise<AgentChatOutput | undefined> {
  let endReceived = false;
  
  const salesData = await step<typeof functions>({}).lookupSales();

  let agentMessages: functions.Message[] = [{
    role: "system",
    content: `Your a sales assistant. Here is the sales data: ${salesData}`,
  }];

  onEvent(messagesEvent, async ({ messages }: { messages: functions.Message[] }) => {

    agentMessages.push(...messages);

    const result = await step<typeof functions>({}).llmChat({
      messages: agentMessages,
    });

    agentMessages.push({ role: "assistant", content: result });
    return agentMessages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  await condition(() => endReceived || shouldContinueAsNew());

  if (endReceived) {
    log.info("end condition met");
    return { messages: agentMessages };
  }

  await agentContinueAsNew();
}
