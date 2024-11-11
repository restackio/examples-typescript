export type GeminiChatInput = {
    userContent: string;
    systemContent?: string;
    model?: string;
    apiKey?: string;
    params?: {
      temperature?: number;
      topP?: number;
      topK?: number;
      candidateCount?: number;
      maxOutputTokens?: number;
      stopSequences?: string[];
    };
  };
