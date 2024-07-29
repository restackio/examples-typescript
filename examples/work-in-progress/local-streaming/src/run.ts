import Restack from "restack-sdk-ts-local";
import { stream } from "./functions";

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
      restack.pod({
        name: "restack",
        workflowsPath,
      }),
      restack.pod({
        name: "openai",
        functions: { stream },
        streaming: true,

        // rate limit allows you to control the number of requests per second for all your function associated to this tool

        rateLimit: calculateRpmToSecond(5000),
      }),
    ]);

    console.log("Started successfully.");
  } catch (e) {
    console.error("Failed to start:", e);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});
