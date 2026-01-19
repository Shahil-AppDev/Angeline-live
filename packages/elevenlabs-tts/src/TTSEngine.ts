import { EventEmitter } from 'events';
import { AudioPlayer, PlaybackOptions } from './AudioPlayer';
import { ElevenLabsClient, TTSOptions } from './ElevenLabsClient';

export interface TTSConfig {
  apiKey: string;
  cacheDir?: string;
  defaultVoiceId?: string;
  autoPlay?: boolean;
  volume?: number;
}

export class TTSEngine extends EventEmitter {
  private client: ElevenLabsClient;
  private player: AudioPlayer;
  private autoPlay: boolean;
  private volume: number;

  constructor(config: TTSConfig) {
    super();
    
    this.client = new ElevenLabsClient(
      config.apiKey,
      config.cacheDir || './cache/tts',
      config.defaultVoiceId
    );
    
    this.player = new AudioPlayer();
    this.autoPlay = config.autoPlay !== false;
    this.volume = config.volume || 80;
  }

  async speak(text: string, options: TTSOptions & PlaybackOptions = {}): Promise<Buffer> {
    try {
      this.emit('tts_started', { text });

      const audioBuffer = await this.client.textToSpeech(text, options);

      this.emit('tts_generated', { text, size: audioBuffer.length });

      if (this.autoPlay) {
        const playbackOptions: PlaybackOptions = {
          volume: options.volume || this.volume,
          blocking: options.blocking !== false
        };

        await this.player.play(audioBuffer, playbackOptions);
        this.emit('tts_played', { text });
      }

      return audioBuffer;

    } catch (error: any) {
      this.emit('tts_error', { text, error: error.message });
      throw error;
    }
  }

  async speakChunks(chunks: string[], options: TTSOptions & PlaybackOptions = {}): Promise<void> {
    for (const chunk of chunks) {
      if (chunk.trim()) {
        await this.speak(chunk, { ...options, blocking: true });
      }
    }
  }

  async stop(): Promise<void> {
    await this.player.stop();
    this.emit('tts_stopped');
  }

  isPlaying(): boolean {
    return this.player.getIsPlaying();
  }

  async getVoices(): Promise<any> {
    return await this.client.getVoices();
  }

  async getUserInfo(): Promise<any> {
    return await this.client.getUserInfo();
  }

  getCacheStats(): { count: number; totalSize: number; totalSizeMB: number } {
    const stats = this.client.getCacheStats();
    return {
      ...stats,
      totalSizeMB: parseFloat((stats.totalSize / (1024 * 1024)).toFixed(2))
    };
  }

  clearCache(): void {
    this.client.clearCache();
    this.emit('cache_cleared');
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
  }

  setAutoPlay(enabled: boolean): void {
    this.autoPlay = enabled;
  }
}
