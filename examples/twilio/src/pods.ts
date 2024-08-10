import Restack from "@restackio/restack-sdk-ts";
import {
  twilioCall,
  questionAnswer,
  transcribe,
  textToAudio,
} from "./functions";
import { websocket, streamQuestion, sendAudio, sendEvent } from "./streams";

async function main() {
  const workflowsPath = require.resolve("./workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.pod({
        name: "restack",
        workflowsPath,
      }),
      restack.pod({
        name: "twilio",
        workflowsPath,
        functions: { twilioCall },
        rateLimit: 200,
      }),
      restack.pod({
        name: "websocket",
        workflowsPath,
        functions: { websocket, sendAudio, sendEvent },
      }),
      restack.pod({
        name: "openai",
        workflowsPath,
        functions: { streamQuestion, questionAnswer },
        rateLimit: 10000,
      }),
      restack.pod({
        name: "deepgram",
        workflowsPath,
        functions: {
          transcribe,
          textToAudio,
        },
        rateLimit: 1000,
      }),
    ]);

    console.log("Pods running successfully.");
  } catch (e) {
    console.error("Failed to run pod", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
