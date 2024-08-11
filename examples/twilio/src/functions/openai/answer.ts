import { currentWorkflow, log } from "@restackio/restack-sdk-ts/function";
import { OpenaiChat } from "./chat";
import { answerEvent, Question } from "../../threads/stream";
import Restack from "@restackio/restack-sdk-ts";

type AnswerOutput = {
  streamSid: string;
  completeResponse: string;
  interactionCount: number;
  toolsCalled: string[];
};

export async function openaiAnswer({
  streamSid,
  text,
  interactionCount,
}: Question): Promise<AnswerOutput> {
  return new Promise((resolve) => {
    const openaiChat = new OpenaiChat();

    openaiChat.setCallSid({ callSid: streamSid });

    openaiChat.completion({
      text,
      interactionCount,
    });

    openaiChat.on("gptreply", async (gptReply, interactionCount) => {
      const restack = new Restack();
      const { workflowId, runId } = currentWorkflow().workflowExecution;
      const input = {
        streamSid,
        trackName: "agent",
        gptReply,
        interactionCount,
      };
      restack.update({
        workflowId,
        runId,
        updateName: answerEvent.name,
        input,
      });
      log.info(`Interaction ${interactionCount}: OpenAI:`, { input });
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
