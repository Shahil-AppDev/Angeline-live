import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private client: AxiosInstance;
  private cacheDir: string;
  private defaultVoiceId: string;

  constructor(apiKey: string, cacheDir: string = './cache/tts', defaultVoiceId: string = 'C7VHv0h3cGzIczU4biXw') {
    this.apiKey = apiKey;
    this.cacheDir = cacheDir;
    this.defaultVoiceId = defaultVoiceId;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheKey(text: string, voiceId: string, modelId: string): string {
    const hash = crypto.createHash('md5').update(`${text}_${voiceId}_${modelId}`).digest('hex');
    return path.join(this.cacheDir, `${hash}.mp3`);
  }

  async textToSpeech(text: string, options: TTSOptions = {}): Promise<Buffer> {
    const voiceId = options.voiceId || this.defaultVoiceId;
    const modelId = options.modelId || 'eleven_multilingual_v2';
    const outputFormat = options.outputFormat || 'mp3_44100_128';

    const cacheFile = this.getCacheKey(text, voiceId, modelId);

    if (fs.existsSync(cacheFile)) {
      console.log(`[ElevenLabs] Cache hit: ${path.basename(cacheFile)}`);
      return fs.readFileSync(cacheFile);
    }

    console.log(`[ElevenLabs] Generating audio for: "${text.substring(0, 50)}..."`);

    const voiceSettings: VoiceSettings = options.voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };

    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: voiceSettings
        },
        {
          headers: {
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);

      fs.writeFileSync(cacheFile, audioBuffer);
      console.log(`[ElevenLabs] Audio cached: ${path.basename(cacheFile)}`);

      return audioBuffer;

    } catch (error: any) {
      if (error.response) {
        throw new Error(`ElevenLabs API error: ${error.response.status} - ${error.response.data}`);
      }
      throw error;
    }
  }

  async getVoices(): Promise<any> {
    try {
      const response = await this.client.get('/voices');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch voices: ${error.message}`);
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const response = await this.client.get('/user');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
      console.log(`[ElevenLabs] Cache cleared: ${files.length} files deleted`);
    }
  }

  getCacheStats(): { count: number; totalSize: number } {
    if (!fs.existsSync(this.cacheDir)) {
      return { count: 0, totalSize: 0 };
    }

    const files = fs.readdirSync(this.cacheDir);
    let totalSize = 0;

    files.forEach(file => {
      const stats = fs.statSync(path.join(this.cacheDir, file));
      totalSize += stats.size;
    });

    return {
      count: files.length,
      totalSize
    };
  }
}
