export interface SynthesizeOptions {
    format?: 'aac' | 'mp3' | 'wav' | string; // default: "mp3"
    language?: string; // default: "en"
    conversational?: boolean;
    length?: number; // maximum 300.0 (5 minutes)
    return_durations?: boolean; // default: false
    return_seed?: boolean; // default: false
    sample_rate?: number; // default: 24000
    seed?: number;
    speed?: number; // default: 1.0
};

export interface SynthesizeStreamingOptions extends SynthesizeOptions {
    return_extras?: boolean;
};

export interface SynthesizeResponse {
    audio_url: string;
    durations: Array<{
        text: string;
        start: number;
        duration: number;
    }>;
    seed: number;
    success: boolean;
};

export interface FetchVoicesOptions {
    starred?: boolean;
    owner?: 'system' | 'me' | 'all';
}

export interface CreateVoiceOptions {
    type?: 'instant' | 'professional';
    gender?: 'male' | 'female' | 'nonbinary';
    description?: string;
}

export interface CreateVoiceResponse {
    id: string;
    name: string;
    state: string;
    owner: string;
    starred: boolean;
    description?: string;
    type?: 'instant' | 'professional';
    gender?: 'male' | 'female' | 'nonbinary';
}

export interface UpdateVoiceOptions {
    name?: string;
    starred?: boolean;
    gender?: 'male' | 'female' | 'nonbinary';
    description?: string;
};

export interface FetchVoicesResponse {
    voices: Array<{
        id: string;
        name: string;
        state: string;
        owner: string;
        type: string;
        starred: boolean;
        gender: string;
        description: string;
    }>;
}