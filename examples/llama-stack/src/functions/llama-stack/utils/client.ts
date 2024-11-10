import LlamaStackClient from 'llama-stack-client';

export async function lamaStackClient(): Promise<LlamaStackClient> {
    const client = new LlamaStackClient({
        baseURL: 'http://localhost:5001', 
    });

    return client;
}