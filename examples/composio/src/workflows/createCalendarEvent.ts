import { step } from "@restackio/ai/workflow";
import * as composioFunctions from "@restackio/integrations-composio/functions";
import { composioTaskQueue } from "@restackio/integrations-composio/taskQueue";

export async function createCalendarEventWorkflow({
  entityId,
  calendarInstruction,
}: {
  entityId: string;
  calendarInstruction: string;
}) {
  await step<typeof composioFunctions>({
    taskQueue: composioTaskQueue,
  }).createCalendarEvent({
    entityId,
    calendarInstruction,
  });

  return true;
}
