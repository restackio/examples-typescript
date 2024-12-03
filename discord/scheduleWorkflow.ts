import { client } from "./src/client";
import { endConnectionEvent, messageCreatedEvent } from "./src/events";
import { DiscordGatewayClient } from "./src/utils/client";

interface Input {
  channelId: string,
  botId: string
}

interface Author {
  id: string
}

interface Message {
  content: string, 
  id: string
  author: Author
}

async function scheduleWorkflow(input: Input) {
  try {
    console.log(WebSocket);
    const workflowId = `${Date.now()}-HumanLoopWorkflow`;
    const runId = await client.scheduleWorkflow({
      workflowName: "humanLoopDiscordWorkflow",
      workflowId,
      input
    });
    
    let endGateWayConnection = false;
    function handleMessageEvent(message: Message) {
      const botId = process.env.DISCORD_BOT_ID ?? "";
      const botTag = `<@${botId}>`;
      if (message.content.replace(botTag, '').trim() === 'STOP') {
        endGateWayConnection = true;
        client.sendWorkflowEvent({
          workflow: {
            workflowId,
            runId
          },
          event: {
            name: endConnectionEvent.name,
            input: { end: true }
          },
        });
      } else if (message.content.length > 0
        && message.author.id != botId) {
        client.sendWorkflowEvent({
          workflow: {
            workflowId,
            runId,
          },
          event: {
            name: messageCreatedEvent.name,
            input: { 
              content: message.content,
              id: message.id
            }
          },
        });
      }
    }
    const discordGatewayClient = new DiscordGatewayClient(handleMessageEvent);
    await new Promise(f => setTimeout(f, 1000));
    discordGatewayClient.identify(3585, process.env.DISCORD_BOT_TOKEN ?? "");
    while (!endGateWayConnection) {
      await new Promise(f => setTimeout(f, 1000));
      discordGatewayClient.sendHeartbeat();
    }
    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling workflow:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow({
  channelId: process.env.DISCORD_CHANNEL_ID ?? "",
  botId: process.env.DISCORD_BOT_ID ?? ""
});
