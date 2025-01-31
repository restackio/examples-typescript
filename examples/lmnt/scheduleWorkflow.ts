import { client } from "./src/client";

export type InputSchedule = {
  name: string;
};

async function scheduleWorkflow(workflowName: string, input?: InputSchedule) {
  try {
    const workflowId = `${Date.now()}-${workflowName}`;
    const runId = await client.scheduleWorkflow({
      workflowName,
      workflowId,
      input,
    });

    const result = await client.getWorkflowResult({ workflowId, runId });

    console.log("Workflow result:", result);

    process.exit(0);
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1);
  }
}

// Add logic to read workflow name from command-line arguments
const workflowName = process.argv[2]; // Get workflow name from command-line argument
const input = { name: "John" }; // Define input

if (workflowName) {
  scheduleWorkflow(workflowName, input).catch((err) => {
    console.error("Error scheduling workflow:", err);
  });
} else {
  console.error("No workflow name provided.");
  process.exit(1);
}