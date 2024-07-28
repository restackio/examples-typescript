import Restack from "restack-sdk-ts";
import { stream } from "./functions";

async function main() {
  const workflowsPath = require.resolve("./workflows");

  function calculateRpmToSecond(openaiRpm: number): number {
    // RPD limit https://platform.openai.com/account/limits
    const secondsInAMinute: number = 60;
    return openaiRpm / secondsInAMinute;
  }

  try {
    // start all your tools

    const restack = new Restack();

    await Promise.all([
      restack.tool({
        name: "restack",
        workflowsPath,
      }),
      restack.tool({
        name: "openai",
        functions: { stream },
        streaming: true,

        // rate limit allows you to control the number of requests per second for all your function associated to this tool

        rateLimit: calculateRpmToSecond(5000),
      }),
    ]);

    console.log("Tools started successfully.");
  } catch (e) {
    console.error("Failed to start tools:", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
