import { lmntClient } from '../utils/client'
import { FetchVoicesOptions, FetchVoicesResponse } from '../utils/types';

export async function lmntFetchVoices(options: FetchVoicesOptions): Promise<FetchVoicesResponse> {
    const speech = await lmntClient();
    const voices = await speech.fetchVoices({ options });
    return voices;
}
