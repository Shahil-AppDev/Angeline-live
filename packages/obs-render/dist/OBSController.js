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
exports.OBSController = void 0;
const fs = __importStar(require("fs"));
const obs_websocket_js_1 = __importDefault(require("obs-websocket-js"));
class OBSController {
    constructor(config, sourcesMapPath) {
        this.connected = false;
        this.obs = new obs_websocket_js_1.default();
        this.config = config;
        this.sourcesMap = JSON.parse(fs.readFileSync(sourcesMapPath, 'utf-8'));
    }
    async connect() {
        try {
            await this.obs.connect(`ws://${this.config.host}:${this.config.port}`, this.config.password);
            this.connected = true;
            console.log('✅ Connected to OBS WebSocket');
        }
        catch (error) {
            console.error('❌ Failed to connect to OBS:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.obs.disconnect();
            this.connected = false;
            console.log('🔌 Disconnected from OBS');
        }
    }
    isConnected() {
        return this.connected;
    }
    async updateSource(update) {
        if (!this.connected) {
            throw new Error('OBS not connected');
        }
        const sceneName = this.sourcesMap.obs_config.scene_name;
        if (update.settings) {
            await this.obs.call('SetInputSettings', {
                inputName: update.sourceName,
                inputSettings: update.settings
            });
        }
        if (update.visible !== undefined) {
            await this.obs.call('SetSceneItemEnabled', {
                sceneName,
                sceneItemId: await this.getSceneItemId(sceneName, update.sourceName),
                sceneItemEnabled: update.visible
            });
        }
        if (update.position) {
            await this.obs.call('SetSceneItemTransform', {
                sceneName,
                sceneItemId: await this.getSceneItemId(sceneName, update.sourceName),
                sceneItemTransform: {
                    positionX: update.position.x,
                    positionY: update.position.y,
                    scaleX: update.position.width / 100,
                    scaleY: update.position.height / 100
                }
            });
        }
    }
    async updateCardImage(cardSlot, imagePath) {
        await this.updateSource({
            sourceName: cardSlot,
            settings: {
                file: imagePath
            },
            visible: true
        });
    }
    async updateText(sourceName, text) {
        await this.updateSource({
            sourceName,
            settings: {
                text
            },
            visible: true
        });
    }
    async playSound(sourceName, audioPath) {
        await this.updateSource({
            sourceName,
            settings: {
                local_file: audioPath
            }
        });
        await this.obs.call('TriggerMediaInputAction', {
            inputName: sourceName,
            mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART'
        });
    }
    async setPreset(presetName) {
        const preset = this.sourcesMap.presets[presetName];
        if (!preset) {
            throw new Error(`Preset ${presetName} not found`);
        }
        const sceneName = this.sourcesMap.obs_config.scene_name;
        for (const [sourceName, visible] of Object.entries(preset.sources_visibility)) {
            try {
                await this.obs.call('SetSceneItemEnabled', {
                    sceneName,
                    sceneItemId: await this.getSceneItemId(sceneName, sourceName),
                    sceneItemEnabled: visible
                });
            }
            catch (error) {
                console.warn(`Failed to set visibility for ${sourceName}:`, error);
            }
        }
    }
    async revealCards(card1Path, card2Path, card3Path) {
        await this.playSound('SFX_SHUFFLE', this.getShuffleSound());
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.updateCardImage('CARD1', card1Path);
        await this.playSound('SFX_FLIP', this.getFlipSound());
        await new Promise(resolve => setTimeout(resolve, 300));
        await this.updateCardImage('CARD2', card2Path);
        await this.playSound('SFX_FLIP', this.getFlipSound());
        await new Promise(resolve => setTimeout(resolve, 300));
        await this.updateCardImage('CARD3', card3Path);
        await this.playSound('SFX_FLIP', this.getFlipSound());
    }
    async getSceneItemId(sceneName, sourceName) {
        const response = await this.obs.call('GetSceneItemId', {
            sceneName,
            sourceName
        });
        return response.sceneItemId;
    }
    getShuffleSound() {
        return '';
    }
    getFlipSound() {
        return '';
    }
    async showReadingOverlay(payload) {
        if (!this.connected) {
            throw new Error('OBS not connected');
        }
        console.log(`[OBS] Showing reading overlay for ${payload.username}`);
        await this.setPreset('reading_active');
        await this.updateText('TXT_USERNAME', payload.username);
        await this.updateText('TXT_QUESTION', payload.question);
        await this.updateText('TXT_RESPONSE', payload.response);
        if (payload.cards.length >= 3) {
            await this.revealCards(payload.cards[0].image_path, payload.cards[1].image_path, payload.cards[2].image_path);
        }
        console.log('[OBS] Reading overlay displayed');
    }
    async resetToIdle() {
        if (!this.connected) {
            throw new Error('OBS not connected');
        }
        console.log('[OBS] Resetting to idle state');
        await this.setPreset('idle');
        await this.updateText('TXT_USERNAME', '');
        await this.updateText('TXT_QUESTION', '');
        await this.updateText('TXT_RESPONSE', '');
        const sceneName = this.sourcesMap.obs_config.scene_name;
        for (const cardSlot of ['CARD1', 'CARD2', 'CARD3']) {
            try {
                await this.obs.call('SetSceneItemEnabled', {
                    sceneName,
                    sceneItemId: await this.getSceneItemId(sceneName, cardSlot),
                    sceneItemEnabled: false
                });
            }
            catch (error) {
                console.warn(`Failed to hide ${cardSlot}:`, error);
            }
        }
        console.log('[OBS] Reset to idle complete');
    }
    async getStatus() {
        if (!this.connected) {
            return { connected: false, streaming: false, recording: false };
        }
        try {
            const streamStatus = await this.obs.call('GetStreamStatus');
            const recordStatus = await this.obs.call('GetRecordStatus');
            return {
                connected: true,
                streaming: streamStatus.outputActive,
                recording: recordStatus.outputActive
            };
        }
        catch (error) {
            return { connected: false, streaming: false, recording: false };
        }
    }
}
exports.OBSController = OBSController;
