import Restack from "@restackio/restack-sdk-ts";
import { twilioCall } from "./functions";
import {
  streamAudioToText,
  streamTextToAudio,
  streamQuestion,
  questionAnswer,
} from "./streams";

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
        name: "openai",
        workflowsPath,
        functions: { streamQuestion, questionAnswer },
        rateLimit: 10000,
      }),
      restack.pod({
        name: "deepgram",
        workflowsPath,
        functions: {
          streamAudioToText,
          streamTextToAudio,
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
