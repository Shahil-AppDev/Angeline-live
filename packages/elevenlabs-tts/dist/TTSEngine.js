"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSEngine = void 0;
const events_1 = require("events");
const AudioPlayer_1 = require("./AudioPlayer");
const ElevenLabsClient_1 = require("./ElevenLabsClient");
class TTSEngine extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.client = new ElevenLabsClient_1.ElevenLabsClient(config.apiKey, config.cacheDir || './cache/tts', config.defaultVoiceId);
        this.player = new AudioPlayer_1.AudioPlayer();
        this.autoPlay = config.autoPlay !== false;
        this.volume = config.volume || 80;
    }
    async speak(text, options = {}) {
        try {
            this.emit('tts_started', { text });
            const audioBuffer = await this.client.textToSpeech(text, options);
            this.emit('tts_generated', { text, size: audioBuffer.length });
            if (this.autoPlay) {
                const playbackOptions = {
                    volume: options.volume || this.volume,
                    blocking: options.blocking !== false
                };
                await this.player.play(audioBuffer, playbackOptions);
                this.emit('tts_played', { text });
            }
            return audioBuffer;
        }
        catch (error) {
            this.emit('tts_error', { text, error: error.message });
            throw error;
        }
    }
    async speakChunks(chunks, options = {}) {
        for (const chunk of chunks) {
            if (chunk.trim()) {
                await this.speak(chunk, { ...options, blocking: true });
            }
        }
    }
    async stop() {
        await this.player.stop();
        this.emit('tts_stopped');
    }
    isPlaying() {
        return this.player.getIsPlaying();
    }
    async getVoices() {
        return await this.client.getVoices();
    }
    async getUserInfo() {
        return await this.client.getUserInfo();
    }
    getCacheStats() {
        const stats = this.client.getCacheStats();
        return {
            ...stats,
            totalSizeMB: parseFloat((stats.totalSize / (1024 * 1024)).toFixed(2))
        };
    }
    clearCache() {
        this.client.clearCache();
        this.emit('cache_cleared');
    }
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
    }
    setAutoPlay(enabled) {
        this.autoPlay = enabled;
    }
}
exports.TTSEngine = TTSEngine;
