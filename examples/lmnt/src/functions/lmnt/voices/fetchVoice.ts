import { lmntClient } from '../utils/client'

export async function lmntFetchVoice(voice: string) {
    const speech = await lmntClient();
    return speech.fetchVoice(voice);
}
