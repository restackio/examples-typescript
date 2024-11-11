import { client } from "./src/client";

interface TopicInput {
  topic: string;
}

async function scheduleWorkflow(input: TopicInput) {
  try {
    const workflowId = `${Date.now()}-writePostWorkflow`;
    await client.scheduleWorkflow({
      workflowName: "writePostWorkflow",
      workflowId,
      input
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow({
  topic: "On-the-job upskilling",
});
