import { client } from "./src/client";

export type EventInput = {
  agentId: string;
  runId: string;
};

async function eventAgent(input: EventInput) {
  try {
    await client.sendAgentEvent({
      event: {
        name: "message",
        input: { content: "Create a to do to send an email to Sam Altman" },
      },
      agent: {
        agentId: input.agentId,
        runId: input.runId,
      },
    });

    await client.sendAgentEvent({
      event: {
        name: "end",
      },
      agent: {
        agentId: input.agentId,
        runId: input.runId,
      },
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error sending event to agent:", error);
    process.exit(1); // Exit the process with an error code
  }
}

eventAgent({
  agentId: "agent-id",
  runId: "run-id",
});
