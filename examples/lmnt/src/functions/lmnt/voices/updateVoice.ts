import { lmntClient } from '../utils/client'
import { UpdateVoiceOptions } from '../utils/types';

export async function lmntUpdateVoice({voice, options}: {voice: string, options: UpdateVoiceOptions}) {
    const speech = await lmntClient();
    return speech.updateVoice(voice, options);
}
