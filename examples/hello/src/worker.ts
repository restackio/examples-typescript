import Restack from "@restackio/restack-sdk-ts";
import { greet, goodbye } from "./functions";

async function main() {
  const workflowsPath = require.resolve("./workflows");

  function calculateRpmToSecond(openaiRpm: number): number {
    // RPD limit https://platform.openai.com/account/limits
    const secondsInAMinute: number = 60;
    return openaiRpm / secondsInAMinute;
  }

  try {
    const restack = new Restack();

    await Promise.all([
      restack.startWorker({
        taskQueue: "restack",
        workflowsPath,
        functions: { goodbye },
      }),

      // Create a separate pod for all openAI functions and rate limit them

      restack.startWorker({
        taskQueue: "openai",
        functions: { greet },
        // rate limit allows you to control the number of requests per second for all your function associated to this tool

        rateLimit: calculateRpmToSecond(5000),
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
