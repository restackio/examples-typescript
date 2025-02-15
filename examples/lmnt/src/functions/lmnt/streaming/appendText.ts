import { lmntClient } from '../utils/client';

export async function lmntAppendText(connection: string, text: string) {
    const speech = await lmntClient();
    return speech.appendText(connection, text);
}
