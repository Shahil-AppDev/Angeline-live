import { EventEmitter } from 'events';
import { PlaybackOptions } from './AudioPlayer';
import { TTSOptions } from './ElevenLabsClient';
export interface TTSConfig {
    apiKey: string;
    cacheDir?: string;
    defaultVoiceId?: string;
    autoPlay?: boolean;
    volume?: number;
}
export declare class TTSEngine extends EventEmitter {
    private client;
    private player;
    private autoPlay;
    private volume;
    constructor(config: TTSConfig);
    speak(text: string, options?: TTSOptions & PlaybackOptions): Promise<Buffer>;
    speakChunks(chunks: string[], options?: TTSOptions & PlaybackOptions): Promise<void>;
    stop(): Promise<void>;
    isPlaying(): boolean;
    getVoices(): Promise<any>;
    getUserInfo(): Promise<any>;
    getCacheStats(): {
        count: number;
        totalSize: number;
        totalSizeMB: number;
    };
    clearCache(): void;
    setVolume(volume: number): void;
    setAutoPlay(enabled: boolean): void;
}
