import { EventEmitter } from 'events';
import OBSWebSocket from 'obs-websocket-js';
import { OBSCommand } from '../types';
import { logger } from '../utils/logger';

export class OBSService extends EventEmitter {
  private obs: OBSWebSocket;
  private connected = false;
  private lastCommandTime = 0;
  private commandQueue: OBSCommand[] = [];
  private processing = false;
  private version?: string;

  constructor(
    private url: string,
    private password: string,
    private commandRateLimit: number
  ) {
    super();
    this.obs = new OBSWebSocket();
  }

  async connect(): Promise<void> {
    try {
      logger.info(`[OBS] Connecting to ${this.url}...`);
      const { obsWebSocketVersion, negotiatedRpcVersion } = await this.obs.connect(this.url, this.password);
      
      this.version = obsWebSocketVersion;
      this.connected = true;
      
      logger.info(`[OBS] Connected successfully (v${obsWebSocketVersion}, RPC v${negotiatedRpcVersion})`);
      
      this.obs.on('ConnectionClosed', () => {
        logger.warn('[OBS] Connection closed');
        this.connected = false;
        this.emit('disconnected');
      });

      this.obs.on('ConnectionError', (error) => {
        logger.error('[OBS] Connection error:', error);
        this.connected = false;
      });
    } catch (error) {
      logger.error('[OBS] Connection failed:', error);
      throw error;
    }
  }

  async executeCommand(command: OBSCommand): Promise<void> {
    this.commandQueue.push(command);
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.commandQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;

      if (timeSinceLastCommand < this.commandRateLimit) {
        await this.sleep(this.commandRateLimit - timeSinceLastCommand);
      }

      const command = this.commandQueue.shift();
      if (command) {
        await this.executeCommandInternal(command);
        this.lastCommandTime = Date.now();
      }
    }

    this.processing = false;
  }

  private async executeCommandInternal(command: OBSCommand): Promise<void> {
    if (!this.connected) {
      logger.warn('[OBS] Not connected, skipping command:', command.type);
      return;
    }

    try {
      logger.debug(`[OBS] Executing command: ${command.type} on ${command.sourceName}`);

      switch (command.type) {
        case 'SET_TEXT':
          await this.obs.call('SetInputSettings', {
            inputName: command.sourceName,
            inputSettings: { text: command.data?.text || '' },
          });
          break;

        case 'SET_IMAGE':
          await this.obs.call('SetInputSettings', {
            inputName: command.sourceName,
            inputSettings: { file: command.data?.imagePath || '' },
          });
          break;

        case 'SET_SCENE':
          await this.obs.call('SetCurrentProgramScene', {
            sceneName: command.data?.sceneName || '',
          });
          break;

        case 'PLAY_MEDIA':
          await this.obs.call('SetInputSettings', {
            inputName: command.sourceName,
            inputSettings: { local_file: command.data?.mediaPath || '' },
          });
          await this.obs.call('TriggerMediaInputAction', {
            inputName: command.sourceName,
            mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART',
          });
          break;

        case 'SHOW_SOURCE':
          await this.obs.call('SetSceneItemEnabled', {
            sceneName: await this.getCurrentScene(),
            sceneItemId: await this.getSceneItemId(command.sourceName),
            sceneItemEnabled: true,
          });
          break;

        case 'HIDE_SOURCE':
          await this.obs.call('SetSceneItemEnabled', {
            sceneName: await this.getCurrentScene(),
            sceneItemId: await this.getSceneItemId(command.sourceName),
            sceneItemEnabled: false,
          });
          break;

        case 'SET_SOURCE_SETTINGS':
          await this.obs.call('SetInputSettings', {
            inputName: command.sourceName,
            inputSettings: command.data?.settings || {},
          });
          break;

        default:
          logger.warn(`[OBS] Unknown command type: ${command.type}`);
      }
    } catch (error) {
      logger.error(`[OBS] Error executing command ${command.type}:`, error);
      throw error;
    }
  }

  private async getCurrentScene(): Promise<string> {
    const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
    return currentProgramSceneName;
  }

  private async getSceneItemId(sourceName: string): Promise<number> {
    const sceneName = await this.getCurrentScene();
    const { sceneItems } = await this.obs.call('GetSceneItemList', { sceneName });
    const item = sceneItems.find((item: any) => item.sourceName === sourceName);
    
    if (!item) {
      throw new Error(`Source "${sourceName}" not found in scene "${sceneName}"`);
    }
    
    return item.sceneItemId;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  disconnect(): void {
    if (this.connected) {
      this.obs.disconnect();
      this.connected = false;
      logger.info('[OBS] Disconnected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus() {
    return {
      connected: this.connected,
      lastCommand: this.lastCommandTime || undefined,
      version: this.version,
      queueLength: this.commandQueue.length,
    };
  }
}
