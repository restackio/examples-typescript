import OpenAI from "openai";
import { ChatCompletionChunk } from "openai/resources/chat/completions.mjs";

export function mergeToolCalls(aggregatedStream: ChatCompletionChunk[]) {
  const toolCalls: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[] =
    [];

  aggregatedStream.forEach((chunk) => {
    chunk.choices.forEach((choice) => {
      if (choice.delta.tool_calls) {
        choice.delta.tool_calls.forEach((toolCall) => {
          const lastToolCall = toolCalls[toolCalls.length - 1];
          if (toolCall.id) {
            toolCalls.push({
              ...toolCall,
              function: { ...toolCall.function, arguments: "" },
            });
          } else if (
            lastToolCall &&
            lastToolCall.function &&
            toolCall.function?.arguments
          ) {
            lastToolCall.function.arguments += toolCall.function.arguments;
          }
        });
      }
    });
  });

  // // Parse the arguments to ensure they are valid JSON
  // toolCalls.forEach((toolCall) => {
  //   if (toolCall.function && toolCall.function.arguments) {
  //     try {
  //       toolCall.function.arguments = JSON.parse(toolCall.function.arguments);
  //     } catch (e) {
  //       log.error("Invalid JSON string:", toolCall.function.arguments);
  //     }
  //   }
  // });

  return { toolCalls };
}
