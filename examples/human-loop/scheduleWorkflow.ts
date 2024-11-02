import { client } from "./src/client";

import { endEvent, feedbackEvent } from "./src/events";

async function scheduleWorkflow() {
  try {
    const workflowId = `${Date.now()}-HumanLoopWorkflow`;
    const runId = await client.scheduleWorkflow({
      workflowName: "humanLoopWorkflow",
      workflowId,
    });

    const feedback = await client.sendWorkflowEvent({
      workflow: {
        workflowId,
        runId,
      },
      event: {
        name: feedbackEvent.name,
        input: { feedback: "Hello, how are you?" },
      },
    });

    console.log("Feedback:", feedback);

    const end = await client.sendWorkflowEvent({
      workflow: {
        workflowId,
        runId,
      },
      event: { name: endEvent.name, input: { end: true } },
    });

    console.log("End:", end);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
