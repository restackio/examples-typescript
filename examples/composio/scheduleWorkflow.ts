import { client } from "./src/client";

export type InputSchedule = {
  entityId: string;
  calendarInstruction: string;
};

const today = new Date().toDateString();

async function scheduleWorkflow(input: InputSchedule) {
  try {
    const workflowId = `${Date.now()}-createCalendarEvent`;
    const runId = await client.scheduleWorkflow({
      workflowName: "createCalendarEventWorkflow",
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
  entityId: "jessicai",
  calendarInstruction: `Create a 1 hour meeting event at 5:30PM tomorrow. Today's date is ${today}`,
});
