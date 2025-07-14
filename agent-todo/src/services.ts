import {
  llmChat,
  createTodo,
  getTools,
  getRandom,
  getResult,
  sendEvent,
} from "./functions";
import { client } from "./client";

async function services() {
  const agentsPath = require.resolve("./agents");
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      client.startService({
        agentsPath: agentsPath,
        functions: { llmChat, createTodo, getTools, sendEvent },
      }),
      client.startService({
        workflowsPath: workflowsPath,
        taskQueue: "todo-workflows",
        functions: { getRandom, getResult },
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
