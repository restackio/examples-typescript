import {
  step,
  log,
  workflowInfo,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";
import { defineEvent, onEvent } from "@restackio/restack-sdk-ts/event";

export type ToolCall = {
  index: number;
  function: {
    name: string;
    arguments:
      | functions.OrderInput
      | functions.InventoryInput
      | functions.PriceInput;
  };
  id?: string;
};

export type Reply = {
  streamSid: string;
  text: string;
};

export const toolCallEvent = defineEvent<ToolCall>("toolCall");
export const replyEvent = defineEvent<Reply>("reply");
export const agentEnd = defineEvent("agentEnd");

export async function agentWorkflow({
  streamSid,
  message,
}: {
  streamSid: string;
  message: string;
}) {
  try {
    const parentWorkflow = workflowInfo().parent;
    if (!parentWorkflow) throw "no parent Workflow";

    let openaiChatMessages: any[] = [];

    const tools = await step<typeof functions>({
      taskQueue: "erp",
    }).erpTools();

    const initialMessages = await step<typeof functions>({
      taskQueue: "openai",
    }).openaiChat({
      streamSid,
      text: message,
      tools,
      workflowToUpdate: parentWorkflow,
    });

    if (initialMessages?.messages) {
      openaiChatMessages = initialMessages.messages;
    }

    onEvent(replyEvent, async ({ streamSid, text }: Reply) => {
      const replyMessage = await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChat({
        streamSid,
        text,
        tools,
        previousMessages: openaiChatMessages,
        workflowToUpdate: parentWorkflow,
      });

      if (replyMessage?.messages) {
        openaiChatMessages = replyMessage.messages;
      }

      return { text };
    });

    onEvent(toolCallEvent, async ({ function: toolFunction }: ToolCall) => {
      log.info("toolCallEvent", { toolFunction });

      async function callERPFunction(toolFunction: ToolCall["function"]) {
        const erpStep = step<typeof functions>({
          taskQueue: "erp",
        });

        switch (toolFunction.name) {
          case "checkPrice":
            return erpStep.checkPrice({ ...toolFunction.arguments });
          case "checkInventory":
            return erpStep.checkInventory({ ...toolFunction.arguments });
          case "placeOrder":
            return erpStep.placeOrder({
              ...(toolFunction.arguments as functions.OrderInput),
            });
          default:
            throw new Error(`Unknown function name: ${toolFunction.name}`);
        }
      }

      const toolResult = await callERPFunction(toolFunction);

      openaiChatMessages.push({
        content: JSON.stringify(toolResult),
        role: "function",
        name: toolFunction.name,
      });

      const toolMessage = await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChat({
        streamSid,
        previousMessages: openaiChatMessages,
        workflowToUpdate: parentWorkflow,
      });

      if (toolMessage?.messages) {
        openaiChatMessages = toolMessage.messages;
      }

      return { function: toolFunction };
    });

    let ended = false;
    onEvent(agentEnd, async () => {
      log.info(`agentEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in agentWorkflow", { error });
    throw error;
  }
}
