import Restack from "@restackio/restack-sdk-ts";
import {
  StartVoiceAgent,
  TwilioCall,
  OpenaiToWebsocket,
  DeepgramTextToSpeechToWebsocket,
  DeepgramSpeechToTextToWebsocket,
} from "./functions";

async function main() {
  const workflowsPath = require.resolve("./workflows");

  try {
    const restack = new Restack();

    await Promise.all([
      restack.pod({
        name: "restack",
        workflowsPath,
        functions: { StartVoiceAgent },
      }),
      restack.pod({
        name: "twilio",
        workflowsPath,
        functions: { TwilioCall },
      }),
      restack.pod({
        name: "openai",
        workflowsPath,
        functions: { OpenaiToWebsocket },
      }),
      restack.pod({
        name: "deepgram",
        workflowsPath,
        functions: {
          DeepgramTextToSpeechToWebsocket,
          DeepgramSpeechToTextToWebsocket,
        },
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
