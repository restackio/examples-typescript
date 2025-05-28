import { lmntClient } from '../utils/client'
import { CreateVoiceOptions, CreateVoiceResponse } from '../utils/types'

export async function lmntCreateVoice({name, enhance, filenames, options}: {name: string, enhance: boolean, filenames: string[], options?: CreateVoiceOptions}): Promise<CreateVoiceResponse> {
    const speech = await lmntClient();
    return speech.createVoice(name, enhance, filenames, options);
}