"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ElevenLabsClient {
    constructor(apiKey, cacheDir = './cache/tts', defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL') {
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.apiKey = apiKey;
        this.cacheDir = cacheDir;
        this.defaultVoiceId = defaultVoiceId;
        this.client = axios_1.default.create({
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
    getCacheKey(text, voiceId, modelId) {
        const hash = crypto.createHash('md5').update(`${text}_${voiceId}_${modelId}`).digest('hex');
        return path.join(this.cacheDir, `${hash}.mp3`);
    }
    async textToSpeech(text, options = {}) {
        const voiceId = options.voiceId || this.defaultVoiceId;
        const modelId = options.modelId || 'eleven_multilingual_v2';
        const outputFormat = options.outputFormat || 'mp3_44100_128';
        const cacheFile = this.getCacheKey(text, voiceId, modelId);
        if (fs.existsSync(cacheFile)) {
            console.log(`[ElevenLabs] Cache hit: ${path.basename(cacheFile)}`);
            return fs.readFileSync(cacheFile);
        }
        console.log(`[ElevenLabs] Generating audio for: "${text.substring(0, 50)}..."`);
        const voiceSettings = options.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
        };
        try {
            const response = await this.client.post(`/text-to-speech/${voiceId}`, {
                text,
                model_id: modelId,
                voice_settings: voiceSettings
            }, {
                headers: {
                    'Accept': 'audio/mpeg'
                },
                responseType: 'arraybuffer'
            });
            const audioBuffer = Buffer.from(response.data);
            fs.writeFileSync(cacheFile, audioBuffer);
            console.log(`[ElevenLabs] Audio cached: ${path.basename(cacheFile)}`);
            return audioBuffer;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`ElevenLabs API error: ${error.response.status} - ${error.response.data}`);
            }
            throw error;
        }
    }
    async getVoices() {
        try {
            const response = await this.client.get('/voices');
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch voices: ${error.message}`);
        }
    }
    async getUserInfo() {
        try {
            const response = await this.client.get('/user');
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch user info: ${error.message}`);
        }
    }
    clearCache() {
        if (fs.existsSync(this.cacheDir)) {
            const files = fs.readdirSync(this.cacheDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(this.cacheDir, file));
            });
            console.log(`[ElevenLabs] Cache cleared: ${files.length} files deleted`);
        }
    }
    getCacheStats() {
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
exports.ElevenLabsClient = ElevenLabsClient;
