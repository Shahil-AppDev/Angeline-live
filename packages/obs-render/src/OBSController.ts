import { OBSSourceUpdate } from '@angeline-live/shared';
import * as fs from 'fs';
import OBSWebSocket from 'obs-websocket-js';

interface OBSConfig {
  host: string;
  port: number;
  password: string;
}

export class OBSController {
  private obs: OBSWebSocket;
  private config: OBSConfig;
  private connected: boolean = false;
  private sourcesMap: any;

  constructor(config: OBSConfig, sourcesMapPath: string) {
    this.obs = new OBSWebSocket();
    this.config = config;
    this.sourcesMap = JSON.parse(fs.readFileSync(sourcesMapPath, 'utf-8'));
  }

  async connect(): Promise<void> {
    try {
      await this.obs.connect(`ws://${this.config.host}:${this.config.port}`, this.config.password);
      this.connected = true;
      console.log('✅ Connected to OBS WebSocket');
    } catch (error) {
      console.error('❌ Failed to connect to OBS:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.obs.disconnect();
      this.connected = false;
      console.log('🔌 Disconnected from OBS');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async updateSource(update: OBSSourceUpdate): Promise<void> {
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

  async updateCardImage(cardSlot: 'CARD1' | 'CARD2' | 'CARD3', imagePath: string): Promise<void> {
    await this.updateSource({
      sourceName: cardSlot,
      settings: {
        file: imagePath
      },
      visible: true
    });
  }

  async updateText(sourceName: string, text: string): Promise<void> {
    await this.updateSource({
      sourceName,
      settings: {
        text
      },
      visible: true
    });
  }

  async playSound(sourceName: string, audioPath: string): Promise<void> {
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

  async setPreset(presetName: 'idle' | 'reading_active'): Promise<void> {
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
          sceneItemEnabled: visible as boolean
        });
      } catch (error) {
        console.warn(`Failed to set visibility for ${sourceName}:`, error);
      }
    }
  }

  async revealCards(card1Path: string, card2Path: string, card3Path: string): Promise<void> {
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

  private async getSceneItemId(sceneName: string, sourceName: string): Promise<number> {
    const response = await this.obs.call('GetSceneItemId', {
      sceneName,
      sourceName
    });
    return response.sceneItemId;
  }

  private getShuffleSound(): string {
    return '';
  }

  private getFlipSound(): string {
    return '';
  }

  async showReadingOverlay(payload: {
    username: string;
    question: string;
    cards: Array<{ image_path: string }>;
    response: string;
  }): Promise<void> {
    if (!this.connected) {
      throw new Error('OBS not connected');
    }

    console.log(`[OBS] Showing reading overlay for ${payload.username}`);

    await this.setPreset('reading_active');

    await this.updateText('TXT_USERNAME', payload.username);
    await this.updateText('TXT_QUESTION', payload.question);
    await this.updateText('TXT_RESPONSE', payload.response);

    if (payload.cards.length >= 3) {
      await this.revealCards(
        payload.cards[0].image_path,
        payload.cards[1].image_path,
        payload.cards[2].image_path
      );
    }

    console.log('[OBS] Reading overlay displayed');
  }

  async resetToIdle(): Promise<void> {
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
      } catch (error) {
        console.warn(`Failed to hide ${cardSlot}:`, error);
      }
    }

    console.log('[OBS] Reset to idle complete');
  }

  async getStatus(): Promise<{ connected: boolean; streaming: boolean; recording: boolean }> {
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
    } catch (error) {
      return { connected: false, streaming: false, recording: false };
    }
  }
}
