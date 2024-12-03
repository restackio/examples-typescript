import { log } from "@restackio/ai/function";
import { DiscordClient } from "../utils/client";

export async function postMessageToChannel({
    messageText,
    channelId,
    botToken
}: {
    messageText: string,
    channelId: string,
    botToken?: string
}){
    try {
        const client = new DiscordClient(botToken);
        return client.postMessage(messageText, channelId);
    } catch (error) {
        log.error("Discord integration error", { error });
        throw new Error(`Discord integration error ${error}`);
    }
}

export async function postReplyToMessage({
    messageText,
    channelId,
    messageId,
    botToken
}: {
    messageText: string,
    channelId: string,
    messageId: string
    botToken?: string
}){
    try {
        const client = new DiscordClient(botToken);
        return client.postMessageToReply(messageText, channelId, messageId);
    } catch (error) {
        log.error("Discord integration error", { error });
        throw new Error(`Discord integration error ${error}`);
    }
}