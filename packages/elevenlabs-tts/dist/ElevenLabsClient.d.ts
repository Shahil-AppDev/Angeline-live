export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
}
export interface TTSOptions {
    voiceId?: string;
    modelId?: string;
    voiceSettings?: VoiceSettings;
    outputFormat?: string;
}
export declare class ElevenLabsClient {
    private apiKey;
    private baseUrl;
    private client;
    private cacheDir;
    private defaultVoiceId;
    constructor(apiKey: string, cacheDir?: string, defaultVoiceId?: string);
    private getCacheKey;
    textToSpeech(text: string, options?: TTSOptions): Promise<Buffer>;
    getVoices(): Promise<any>;
    getUserInfo(): Promise<any>;
    clearCache(): void;
    getCacheStats(): {
        count: number;
        totalSize: number;
    };
}
