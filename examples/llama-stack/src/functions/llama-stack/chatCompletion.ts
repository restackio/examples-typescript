import { lamaStackClient } from './utils/client';

export async function llamaStackChatCompletion({ model, messages }: { model: string; messages: any[] }) {
    const client = await lamaStackClient();

    const session = await client.inference.chatCompletion({
        model,
        messages,
    });
    return session;
}