import { log } from "@restackio/ai/function";
import { DiscordClient } from "../utils/client";

export async function getMessagesAfterId({
    afterMessageId,
    channelId,
    botToken
}: {
    afterMessageId: string,
    channelId: string,
    botToken?: string
}){
    try {
        const client = new DiscordClient(botToken);
        return client.getMessagesAfterId(afterMessageId, channelId);
    } catch (error) {
        log.error("Discord integration error", { error });
        throw new Error(`Discord integration error ${error}`);
    }
}