import { lmntClient } from '../utils/client'

export async function lmntDeleteVoice(voice: string) {
    const speech = await lmntClient();
    return speech.deleteVoice(voice);
}
