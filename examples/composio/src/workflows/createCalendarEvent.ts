import { step, log } from "@restackio/ai/workflow";
import * as composioFunctions from "@restackio/integrations-composio/functions";
import { composioTaskQueue } from "@restackio/integrations-composio/taskQueue";

export async function createCalendarEventWorkflow({
  entityId,
  calendarInstruction,
}: {
  entityId: string;
  calendarInstruction: string;
}) {
  const connection = await step<typeof composioFunctions>({
    taskQueue: composioTaskQueue,
  }).initiateConnection({
    entityId,
    appName: "googlecalendar",
  });

  if (!connection.authenticated) {
    log.info(
      `Follow the link to authenticate with google calendar ${connection.redirectUrl}`
    );
    return connection;
  }

  await step<typeof composioFunctions>({
    taskQueue: composioTaskQueue,
  }).createCalendarEvent({
    entityId,
    calendarInstruction,
  });

  return true;
}
