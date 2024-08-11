import OpenAI from "openai";
import "dotenv/config";
import { agentPrompt } from "./prompt";
import { currentWorkflow, log } from "@restackio/restack-sdk-ts/function";
import Restack from "@restackio/restack-sdk-ts";
import { Answer, answerEvent, TrackName } from "../../threads/stream";
import { ChatCompletionChunk } from "openai/resources/chat/completions.mjs";
import { toolCallEvent } from "../../threads/agent";
import { aggregateStreamChunks } from "./utils/aggregateStream";
import { mergeToolCalls } from "./utils/mergeToolCalls";

export async function openaiChat({
  streamSid,
  trackName,
  text,
  previousMessages,
  tools,
  workflowToUpdate,
}: {
  streamSid: string;
  trackName: TrackName;
  text: string;
  previousMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  workflowToUpdate?: {
    workflowId: string;
    runId: string;
  };
}) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const restack = new Restack();
  const { workflowId, runId } = currentWorkflow().workflowExecution;

  let messages = previousMessages ?? [];
  if (!previousMessages) {
    messages = [...agentPrompt];
  }

  messages.push({
    role: "user",
    content: text,
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools,
    stream: true,
    user: streamSid,
  });

  let finishReason: ChatCompletionChunk.Choice["finish_reason"];
  let response: ChatCompletionChunk.Choice.Delta["content"] = "";

  const [stream1, stream2] = stream.tee();
  const readableStream = stream1.toReadableStream();
  const aggregatedStream = await aggregateStreamChunks(readableStream);

  for await (const chunk of stream2) {
    let content = chunk.choices[0]?.delta?.content || "";
    finishReason = chunk.choices[0].finish_reason;

    if (finishReason === "tool_calls") {
      const { toolCalls } = mergeToolCalls(aggregatedStream);

      await Promise.all(
        toolCalls.map((toolCall) => {
          log.info("Tool Call", { toolCall });

          const toolAnswer = `Sure, give me a minute to ${toolCall?.function?.name}...`;
          const toolMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
            {
              content: toolAnswer,
              role: "assistant",
            };
          messages.push(toolMessage);
          const inputAnswer: Answer = {
            streamSid,
            response: toolAnswer,
            isLast: true,
            trackName: "agent",
          };
          log.info("inputAnswer", { inputAnswer });
          if (workflowToUpdate) {
            restack.update({
              workflowId: workflowToUpdate.workflowId,
              runId: workflowToUpdate.runId,
              updateName: answerEvent.name,
              input: inputAnswer,
            });
          }

          log.info("functionArguments", {
            functionArguments: toolCall.function?.arguments,
          });
          const functionArguments = JSON.parse(
            toolCall.function?.arguments ?? ""
          );

          restack.update({
            workflowId,
            runId,
            updateName: toolCallEvent.name,
            input: {
              ...toolCall,
              function: {
                name: toolCall.function?.name,
                arguments: functionArguments,
              },
            },
          });
        })
      );
      return {
        streamSid,
        trackName,
        messages,
      };
    } else {
      response += content;
      if (content.trim().slice(-1) === "•" || finishReason === "stop") {
        if (response.length) {
          const input: Answer = {
            streamSid,
            response: response,
            isLast: finishReason === "stop",
            trackName: "agent",
          };
          log.info("input", { input });
          if (workflowToUpdate) {
            restack.update({
              workflowId: workflowToUpdate.workflowId,
              runId: workflowToUpdate.runId,
              updateName: answerEvent.name,
              input,
            });
          }
        }
      }

      if (finishReason === "stop") {
        const newMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
          content: response,
          role: "assistant",
        };

        messages.push(newMessage);

        return {
          streamSid,
          trackName,
          messages,
        };
      }
    }
  }
}
