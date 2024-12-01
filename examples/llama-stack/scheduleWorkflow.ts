import { client } from "./src/client";

export type InputSchedule = {
  name: string;
};

async function scheduleWorkflow(input: InputSchedule) {
  try {
    const workflowId = `${Date.now()}-helloWorkflow`;
    const runId = await client.scheduleWorkflow({
      workflowName: "helloWorkflow",
      workflowId,
      input,
    });

    const result = await client.getWorkflowResult({ workflowId, runId });

    console.log("Workflow result:", result);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow({
  name: "John",
});
