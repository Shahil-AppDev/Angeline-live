import { LLMRequest, LLMResponse } from '@angeline-live/shared';
export declare class OpenRouterClient {
    private client;
    private apiKey;
    private defaultModel;
    constructor(apiKey: string, defaultModel?: string);
    generate(request: LLMRequest): Promise<LLMResponse>;
    testConnection(): Promise<boolean>;
}
