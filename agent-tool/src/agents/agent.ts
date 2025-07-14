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

export async function agentChatTool(): Promise<AgentChatOutput | undefined> {
  let endReceived = false;
  let agentMessages: functions.Message[] = [];

  const tools = await step<typeof functions>({}).getTools();

  onEvent(messagesEvent, async ({ messages }: { messages: functions.Message[] }) => {
    agentMessages.push(...messages);

    const result = await step<typeof functions>({}).llmChat({
      messages: agentMessages,
      tools,
    });

    agentMessages.push({ role: "assistant", content: result.content });

    if (result.tool_calls) {
      for (const toolCall of result.tool_calls) {
        switch (toolCall.function.name) {
          case "lookupSales":
            const toolResult = await step<typeof functions>({}).lookupSales(
              JSON.parse(toolCall.function.arguments)
            );

            agentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            const toolChatResult = await step<typeof functions>({}).llmChat({
              messages,
              tools,
            });

            agentMessages.push({
              role: "assistant",
              content: toolChatResult.content,
            });

            break;
          default:
            break;
        }
      }
    }
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
