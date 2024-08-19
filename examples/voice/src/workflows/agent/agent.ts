import {
  step,
  log,
  workflowInfo,
  condition,
} from "@restackio/restack-sdk-ts/workflow";
import * as functions from "../../functions";
import { onEvent } from "@restackio/restack-sdk-ts/event";
import { agentEnd, assistantEvent, toolCallEvent } from "./events";
import { openaiTaskQueue } from "@restackio/integrations-openai/taskQueue";
import * as openaiFunctions from "@restackio/integrations-openai/functions";
import { UserEvent, userEvent } from "../stream/events";

import {
  StreamEvent,
  ToolCallEvent,
} from "@restackio/integrations-openai/types";
import { agentPrompt } from "../../functions/openai/prompt";
import { ChatCompletionAssistantMessageParam } from "openai/resources/index";

export async function agentWorkflow({
  assistantName,
  userName,
  message,
}: {
  assistantName: string;
  userName: string;
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

    const commonOpenaiOptions = {
      assistantName,
      tools,
      streamAtCharacter: "•",
      streamEvent: {
        workflowEventName: assistantEvent.name,
        workflow: parentWorkflow,
      },
      toolEvent: {
        workflowEventName: toolCallEvent.name,
      },
    };

    const { result } = await step<typeof openaiFunctions>({
      taskQueue: openaiTaskQueue,
    }).openaiChatCompletionsStream({
      userName,
      newMessage: message,
      messages: agentPrompt,
      ...commonOpenaiOptions,
    });

    if (result.messages) {
      openaiChatMessages = result.messages;
    }

    // On user event, send it to AI chat with previous messages to continue conversation.

    onEvent(userEvent, async ({ message, userName }: UserEvent) => {
      const { result } = await step<typeof openaiFunctions>({
        taskQueue: openaiTaskQueue,
      }).openaiChatCompletionsStream({
        newMessage: message,
        userName,
        messages: openaiChatMessages,
        ...commonOpenaiOptions,
      });

      if (result.messages) {
        openaiChatMessages = result.messages;
      }

      if (result.toolCalls) {
        result.toolCalls.map(async (toolCall) => {
          const toolResponse = `Sure, let me ${toolCall?.function?.name}...`;
          const toolMessage: ChatCompletionAssistantMessageParam = {
            content: toolResponse,
            role: "assistant",
          };
          openaiChatMessages.push(toolMessage);

          const input: StreamEvent = {
            response: toolResponse,
            assistantName,
            isLast: true,
          };

          log.info("toolCall ", { input });

          await step<typeof functions>({}).workflowSendEvent({
            event: {
              name: assistantEvent.name,
              input,
            },
            workflow: parentWorkflow,
          });
        });
      }

      return { message };
    });

    // When AI answer is a tool call, execute function and push results to conversation.

    onEvent(
      toolCallEvent,
      async ({ function: toolFunction }: ToolCallEvent) => {
        log.info("toolCallEvent", { toolFunction });

        async function callERPFunction(
          toolFunction: ToolCallEvent["function"]
        ) {
          const erpStep = step<typeof functions>({
            taskQueue: "erp",
          });

          switch (toolFunction.name) {
            case "checkPrice":
              return erpStep.erpCheckPrice(
                toolFunction.input as unknown as functions.PriceInput
              );
            case "checkInventory":
              return erpStep.erpCheckInventory(
                toolFunction.input as unknown as functions.InventoryInput
              );
            case "placeOrder":
              return erpStep.erpPlaceOrder(
                toolFunction.input as unknown as functions.OrderInput
              );
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

        const { result } = await step<typeof openaiFunctions>({
          taskQueue: openaiTaskQueue,
        }).openaiChatCompletionsStream({
          messages: openaiChatMessages,
          ...commonOpenaiOptions,
        });

        if (result.messages) {
          openaiChatMessages = result.messages;
        }

        return { function: toolFunction };
      }
    );

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
