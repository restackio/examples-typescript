const DISCORD_API_VERSION = '10';
const DISCORD_BASE_URL = `https://discord.com/api/v${DISCORD_API_VERSION}`;
export class DiscordClient {
    private botToken: string;
    constructor(
        botToken: string = process.env.DISCORD_BOT_TOKEN ?? ""
    ){
        this.botToken = botToken;
    }

    public postMessage(message: string, channelId: string) {
        const messagesUrl = `/channels/${channelId}/messages`;
        const url = DISCORD_BASE_URL + messagesUrl;
        const body = {
            'content': message
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${this.botToken}`
        }
        const options = {
            'method': 'POST',
            'body': JSON.stringify(body),
            'headers': headers
        }
        return fetch(url, options)
            .then(response => response.json());
    }

    public postMessageToReply(message: string, 
        channelId: string, messageId: string) {
        const messagesUrl = `/channels/${channelId}/messages`;
        const url = DISCORD_BASE_URL + messagesUrl;
        const body = {
            'content': message,
            'message_reference': {
                'message_id': messageId
            }
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${this.botToken}`
        }
        const options = {
            'method': 'POST',
            'body': JSON.stringify(body),
            'headers': headers
        }
        return fetch(url, options)
            .then(response => response.json());
    }

    public getMessagesAfterId(afterMessageId: string, channelId: string) {
        const messagesUrl = `/channels/${channelId}/messages`;
        const queryParams = new URLSearchParams({
            'after': afterMessageId
        })
        const url = DISCORD_BASE_URL + messagesUrl 
            + '?' + queryParams.toString();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${this.botToken}`
        }
        const options = {
            'method': 'GET',
            'headers': headers
        }
        return fetch(url, options)
            .then(response => response.json());
    }
}