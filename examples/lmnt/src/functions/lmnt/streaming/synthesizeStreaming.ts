import { lmntClient } from '../utils/client';
import { SynthesizeStreamingOptions, SynthesizeResponse } from '../utils/types';

export async function lmntSynthesizeStreaming(voice: string, options: SynthesizeStreamingOptions = {}): Promise<SynthesizeResponse> {
    const speech = await lmntClient();
    const defaultOptions: SynthesizeStreamingOptions = {
        format: 'mp3',
        language: 'en',
        sample_rate: 24000,
        speed: 1.0,
        return_extras: false,
    };
    const finalOptions = { ...defaultOptions, ...options };
    return speech.synthesizeStreaming(voice, finalOptions);
}