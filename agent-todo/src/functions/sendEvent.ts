import { client } from "../client";
import { log } from "@restackio/ai/function";

export type SendEventInput = {
  agentId: string;
  runId: string;
  eventName: string;
  eventInput?: Record<string, any>;
};

export async function sendEvent(input: SendEventInput): Promise<void> {
  try {
    await client.sendAgentEvent({
      event: {
        name: input.eventName,
        input: input.eventInput,
      },
      agent: {
        agentId: input.agentId,
        runId: input.runId,
      },
    });
  } catch (error) {
    log.error("Error sending agent event", { error, input });
    throw error;
  }
}