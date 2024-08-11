import {
  step,
  defineUpdate,
  log,
  workflowInfo,
  condition,
  onUpdate,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../functions";
import { TrackName } from "./stream";

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
  trackName: TrackName;
  text: string;
};

export const toolCallEvent = defineUpdate<ToolCall>("toolCall");
export const replyEvent = defineUpdate<Reply>("reply");
export const agentEnd = defineUpdate("agentEnd");

export async function agentThread({
  streamSid,
  trackName,
  message,
}: {
  streamSid: string;
  trackName: TrackName;
  message: string;
}) {
  async function callOpenAIChat(params: {
    streamSid: string;
    trackName: TrackName;
    text: string;
    tools?: any;
    previousMessages?: any[];
    workflowToUpdate: { workflowId: string; runId: string };
  }) {
    return step<typeof functions>({
      podName: `openai`,
      scheduleToCloseTimeout: "2 minutes",
    }).openaiChat(params);
  }

  async function callERPFunction(toolFunction: ToolCall["function"]) {
    const erpStep = step<typeof functions>({
      podName: `erp`,
      scheduleToCloseTimeout: "2 minutes",
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

  try {
    const parentWorkflow = workflowInfo().parent;
    if (!parentWorkflow) throw "no parent Workflow";

    let openaiChatMessages: any[] = [];

    const tools = await step<typeof functions>({
      podName: `erp`,
      scheduleToCloseTimeout: "2 minutes",
    }).erpTools();

    const initialMessage = await callOpenAIChat({
      streamSid,
      trackName,
      text: message,
      tools,
      workflowToUpdate: {
        workflowId: parentWorkflow.workflowId,
        runId: parentWorkflow.runId,
      },
    });

    if (initialMessage?.messages) {
      openaiChatMessages = initialMessage.messages;
    }

    onUpdate(toolCallEvent, async ({ function: toolFunction }: ToolCall) => {
      log.info("toolCallEvent", { toolFunction });

      const toolResult = await callERPFunction(toolFunction);

      openaiChatMessages.push({
        content: JSON.stringify(toolResult),
        role: "function",
        name: toolFunction.name,
      });

      const toolMessage = await callOpenAIChat({
        streamSid,
        trackName,
        text: "",
        previousMessages: openaiChatMessages,
        workflowToUpdate: {
          workflowId: parentWorkflow.workflowId,
          runId: parentWorkflow.runId,
        },
      });

      if (toolMessage?.messages) {
        openaiChatMessages = toolMessage.messages;
      }

      return { function: toolFunction };
    });

    onUpdate(replyEvent, async ({ streamSid, trackName, text }: Reply) => {
      const replyMessage = await callOpenAIChat({
        streamSid,
        trackName,
        text,
        tools,
        previousMessages: openaiChatMessages,
        workflowToUpdate: {
          workflowId: parentWorkflow.workflowId,
          runId: parentWorkflow.runId,
        },
      });

      if (replyMessage?.messages) {
        openaiChatMessages = replyMessage.messages;
      }

      return { text };
    });

    let ended = false;
    onUpdate(agentEnd, async () => {
      log.info(`agentEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in agentThread", { error });
    throw error;
  }
}
