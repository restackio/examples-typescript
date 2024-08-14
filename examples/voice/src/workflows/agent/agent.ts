import {
  step,
  log,
  workflowInfo,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../../functions";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import { agentEnd, Reply, replyEvent, ToolCall, toolCallEvent } from "./events";

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

    // Get tools definition and start conversation.

    const tools = await step<typeof functions>({
      taskQueue: "erp",
    }).erpGetTools();

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

    // On user reply, send it to AI chat with previous messages to continue conversation.

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

    // When AI answer is a tool call, execute function and push results to conversation.

    onEvent(toolCallEvent, async ({ function: toolFunction }: ToolCall) => {
      log.info("toolCallEvent", { toolFunction });

      async function callERPFunction(toolFunction: ToolCall["function"]) {
        const erpStep = step<typeof functions>({
          taskQueue: "erp",
        });

        switch (toolFunction.name) {
          case "checkPrice":
            return erpStep.erpCheckPrice({ ...toolFunction.arguments });
          case "checkInventory":
            return erpStep.erpCheckInventory({ ...toolFunction.arguments });
          case "placeOrder":
            return erpStep.erpPlaceOrder({
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

    // Terminate AI agent workflow.

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
