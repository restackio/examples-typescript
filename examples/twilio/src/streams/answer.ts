import { log } from "@restackio/restack-sdk-ts/function";
import { webSocketConnect } from "./connect";
import { OpenaiChat } from "../functions/openai/chat";
import { Question } from "../workflows/twilioStream";

type AnswerOutput = {
  streamSid: string;
  completeResponse: string;
  interactionCount: number;
  toolsCalled: string[];
};

export async function questionAnswer({
  streamSid,
  text,
  interactionCount,
}: Question): Promise<AnswerOutput> {
  const ws = await webSocketConnect();

  return new Promise((resolve) => {
    const openaiChat = new OpenaiChat();

    openaiChat.setCallSid({ callSid: streamSid });

    openaiChat.completion({
      text,
      interactionCount,
    });

    openaiChat.on("gptreply", async (gptReply, interactionCount) => {
      const event = {
        streamSid,
        event: "answer",
        data: {
          gptReply,
          interactionCount,
          trackName: "agent",
        },
      };
      ws.send(JSON.stringify(event));
      log.info(`Interaction ${interactionCount}: OpenAI:`, event);
    });

    openaiChat.on(
      "end",
      async ({ completeResponse, interactionCount, toolsCalled }) => {
        resolve({
          streamSid,
          completeResponse,
          interactionCount,
          toolsCalled,
        });
      }
    );
  });
}
