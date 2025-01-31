import fs from "fs";
import { lmntClient } from './utils/client'
import { SynthesizeOptions } from './utils/types';

export async function lmntSynthesize(text: string, voice: string, filename: string, options: SynthesizeOptions) {
    const speech = await lmntClient();
    const synthesis = await speech.synthesize(text, voice, options);
    fs.writeFileSync(`audio/${filename}`, synthesis.audio);
    return synthesis;
}
