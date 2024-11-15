import OpenAI from "openai/index";
import { ChatCompletionChunk } from "openai/resources/chat/completions";

import Restack from "@restackio/ai";
import { currentWorkflow, log } from "@restackio/ai/function";

import { StreamEvent, ToolCallEvent } from "../types/events";

import { aggregateStreamChunks } from "../utils/aggregateStream";
import { mergeToolCalls } from "../utils/mergeToolCalls";
import { openaiClient } from "../utils/client";
import { openaiCost, Price } from "../utils/cost";
import { SendWorkflowEvent } from "@restackio/ai/event";
import { ChatModel } from "openai/resources/index";

export async function openaiChatCompletionsStream({
  model = "gpt-4o-mini",
  userName,
  newMessage,
  assistantName,
  messages = [],
  tools,
  toolEvent,
  streamAtCharacter,
  streamEvent,
  apiKey,
  price,
}: {
  model?: ChatModel;
  userName?: string;
  newMessage?: string;
  assistantName?: string;
  messages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  toolEvent?: {
    workflowEventName: string;
    workflow?: SendWorkflowEvent["workflow"];
  };
  streamAtCharacter?: string;
  streamEvent?: {
    workflowEventName: string;
    workflow?: SendWorkflowEvent["workflow"];
  };
  apiKey?: string;
  price?: Price;
}) {
  const restack = new Restack();
  const workflow = currentWorkflow().workflowExecution;

  log.debug("workflow", { workflow });

  if (newMessage) {
    messages.push({
      role: "user",
      name: userName,
      content: newMessage,
    });
  }

  const openai = openaiClient({ apiKey });
  const chatStream = await openai.chat.completions.create({
    model: model,
    messages,
    tools,
    stream: true,
    stream_options: {
      include_usage: true,
    },
  });

  const [stream, streamEnd] = chatStream.tee();
  const readableStream = streamEnd.toReadableStream() as unknown as ReadableStream<any>;
  const aggregatedStream = await aggregateStreamChunks(readableStream);

  let finishReason: ChatCompletionChunk.Choice["finish_reason"];
  let response: ChatCompletionChunk.Choice.Delta["content"] = "";
  let tokensCountInput = 0;
  let tokensCountOutput = 0;

  for await (const chunk of stream) {
    let content = chunk.choices[0]?.delta?.content || "";
    finishReason = chunk.choices[0]?.finish_reason;
    tokensCountInput += chunk.usage?.prompt_tokens ?? 0;
    tokensCountOutput += chunk.usage?.completion_tokens ?? 0;

    if (finishReason === "tool_calls") {
      const { toolCalls } = mergeToolCalls(aggregatedStream);
      await Promise.all(
        toolCalls.map((toolCall) => {
          if (toolEvent) {
            const functionArguments = JSON.parse(
              toolCall.function?.arguments ?? ""
            );

            const input: ToolCallEvent = {
              ...toolCall,
              function: {
                name: toolCall.function?.name ?? "",
                input: functionArguments,
              },
              assistantName,
            };

            if (toolEvent) {
              const workflowEvent = {
                event: {
                  name: toolEvent.workflowEventName,
                  input,
                },
                workflow: {
                  ...workflow,
                  ...toolEvent.workflow,
                },
              };
              log.debug("toolEvent sendWorkflowEvent", { workflowEvent });

              restack.sendWorkflowEvent(workflowEvent);
            }
          }
        })
      );
      return {
        result: {
          messages,
          toolCalls,
        },
        cost:
          price &&
          openaiCost({
            price,
            tokensCount: {
              input: tokensCountInput,
              output: tokensCountOutput,
            },
          }),
      };
    } else {
      response += content;
      if (
        content.trim().slice(-1) === streamAtCharacter ||
        finishReason === "stop"
      ) {
        if (response.length) {
          const input: StreamEvent = {
            chunkId: chunk.id,
            response,
            assistantName,
            isLast: finishReason === "stop",
          };
          if (streamEvent) {
            const workflowEvent = {
              event: {
                name: streamEvent.workflowEventName,
                input,
              },
              workflow: {
                ...workflow,
                ...streamEvent.workflow,
              },
            };
            log.debug("streamEvent sendWorkflowEvent", { workflowEvent });
            restack.sendWorkflowEvent(workflowEvent);
          }
        }
      }

      if (finishReason === "stop") {
        const newMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
          content: response,
          role: "assistant",
          name: assistantName,
        };

        messages.push(newMessage);

        return {
          result: {
            messages,
          },
          cost:
            price &&
            openaiCost({
              price,
              tokensCount: {
                input: tokensCountInput,
                output: tokensCountOutput,
              },
            }),
        };
      }
    }
  }
}
