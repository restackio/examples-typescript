import { client } from "./src/client";

async function triggerWorkflow() {

    const workflowId = `${Date.now()}-helloWorkflow`;
    const runId = await client.scheduleWorkflow({
        workflowName: "greetingWorkflow",
        workflowId,
    });

    const result = await client.getWorkflowResult({ workflowId, runId });
    process.exit(0); // Exit the process successfully

};

triggerWorkflow();