import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Mode de connexion
  mode: process.env.MODE || 'development',

  // PC Bridge (production)
  pcBridge: {
    url: process.env.PC_BRIDGE_URL || '',
    token: process.env.PC_BRIDGE_TOKEN || '',
  },

  // OBS (development)
  obs: {
    enabled: process.env.OBS_ENABLED === 'true',
    url: process.env.OBS_WS_URL || 'ws://127.0.0.1:4455',
    password: process.env.OBS_WS_PASSWORD || '',
  },

  // TikFinity (development)
  tikfinity: {
    enabled: process.env.TIKFINITY_ENABLED === 'true',
    url: process.env.TIKFINITY_WS_URL || 'ws://localhost:21213',
    simulate: process.env.TIKFINITY_SIMULATE === 'true',
    simulateFile: process.env.TIKFINITY_SIMULATE_FILE || './data/events.jsonl',
  },

  // DeepSeek API
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  },

  // ElevenLabs TTS
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'C7VHv0h3cGzIczU4biXw',
    volume: parseInt(process.env.ELEVENLABS_VOLUME || '80', 10),
  },

  // Paths
  paths: {
    sourcesMap: process.env.OBS_SOURCES_MAP_PATH || '../../config/sources_map.json',
    oraclesConfig: '../../config/oracles.json',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'INFO',
};

export function isProductionMode(): boolean {
  return config.mode === 'production';
}

export function isDevelopmentMode(): boolean {
  return config.mode === 'development';
}
