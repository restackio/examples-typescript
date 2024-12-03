import { step, condition } from "@restackio/ai/workflow";
import { onEvent } from "@restackio/ai/event";
import * as functions from "../functions";
import { endConnectionEvent, MessageCreatedEvent, messageCreatedEvent, EndConnectionEvent } from "../events";

interface Input {
  channelId: string,
  botId: string, 
  messageHandler: Function
}

export async function humanLoopDiscordWorkflow(input: Input) {
  let endWorkflow = false;
  const botTag = `<@${input.botId}>`;

  onEvent(endConnectionEvent, async (event: EndConnectionEvent) => {
    endWorkflow = event.end;
    return event.end;
  });

  onEvent(messageCreatedEvent, async (event: MessageCreatedEvent) => {
    return await step<typeof functions>({}).postReplyToMessage({
      messageText: event.content.replace(botTag, '').split('').reverse().join(''),
      channelId: input.channelId,
      messageId: event.id
    });
  });

  await step<typeof functions>({}).postMessageToChannel({
    messageText: `Message this channel and tag ${botTag} for backwards messages. Message "${botTag} STOP" to end the loop`,
    channelId: input.channelId,
  });

  await condition(() => endWorkflow)

  return await step<typeof functions>({}).postMessageToChannel({
    messageText: `Goodbye!`,
    channelId: input.channelId,
  });
}
