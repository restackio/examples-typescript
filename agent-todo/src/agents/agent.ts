import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  childExecute,
  shouldContinueAsNew,
  agentContinueAsNew,
} from "@restackio/ai/agent";
import * as functions from "../functions";
import { executeTodoWorkflow } from "../workflows/executeTodo";

export type EndEvent = {
  end: boolean;
};

export const messagesEvent = defineEvent<functions.Message[]>("messages");
export const endEvent = defineEvent("end");

type agentTodoOutput = {
  messages: functions.Message[];
};

export async function agentTodo(): Promise<agentTodoOutput | undefined> {
  let endReceived = false;
  let agentMessages: functions.Message[] = [];

  const tools = await step<typeof functions>({}).getTools();

  onEvent(messagesEvent, async ({ messages }: { messages: functions.Message[] }) => {
    agentMessages.push(...messages);

    const result = await step<typeof functions>({}).llmChat({
      messages: agentMessages,
      tools,
    });

    agentMessages.push(result);

    if (result.tool_calls) {
      log.info("result.tool_calls", { result });
      for (const toolCall of result.tool_calls) {
        switch (toolCall.function.name) {
          case "createTodo":
            log.info("createTodo", { toolCall });
            const toolResult = await step<typeof functions>({}).createTodo(
              JSON.parse(toolCall.function.arguments)
            );

            agentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: toolResult,
            });

            const toolChatResult = await step<typeof functions>({}).llmChat({
              messages: agentMessages,
              tools,
            });

            agentMessages.push(toolChatResult);

            break;
          case "executeTodoWorkflow":
            log.info("executeTodoWorkflow", { toolCall });
            const workflowId = `executeTodoWorkflow-${new Date().getTime()}`;
            const workflowResult = await childExecute({
              child: executeTodoWorkflow,
              childId: workflowId,
              input: JSON.parse(toolCall.function.arguments),
              taskQueue: "todo-workflows",
            });

            agentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(workflowResult),
            });

            const toolWorkflowResult = await step<typeof functions>({}).llmChat(
              {
                messages: agentMessages,
                tools,
              }
            );

            agentMessages.push(toolWorkflowResult);

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
