import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import { io, Socket } from 'socket.io-client';

export interface OBSCommand {
  type: 'SET_TEXT' | 'SET_IMAGE' | 'SET_SCENE' | 'PLAY_MEDIA' | 'SHOW_SOURCE' | 'HIDE_SOURCE' | 'SET_SOURCE_SETTINGS';
  sourceName: string;
  data?: {
    text?: string;
    imagePath?: string;
    sceneName?: string;
    mediaPath?: string;
    visible?: boolean;
    settings?: Record<string, unknown>;
  };
}

export interface TikFinityEvent {
  type: 'CHAT_MESSAGE' | 'GIFT' | 'FOLLOW' | 'SHARE' | 'LIKE' | 'JOIN';
  timestamp: number;
  userId: string;
  username: string;
  nickname: string;
  message?: string;
  giftId?: number;
  giftName?: string;
  giftCount?: number;
  diamondCost?: number;
}

export class PCBridgeClient extends EventEmitter {
  private socket: Socket | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 2000;

  constructor(
    private url: string,
    private token: string
  ) {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[PCBridge] Connecting to ${this.url}...`);

        const authToken = jwt.sign({ service: 'live-core' }, this.token);

        this.socket = io(this.url, {
          auth: { token: authToken },
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
        });

        this.socket.on('connect', () => {
          console.log('[PCBridge] Connected successfully');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.socket.on('tikfinity:event', (event: TikFinityEvent) => {
          console.log(`[PCBridge] TikFinity event: ${event.type} from ${event.username}`);
          this.emit('tikfinity:event', event);
        });

        this.socket.on('obs:command:success', (data) => {
          console.log('[PCBridge] OBS command success:', data.command.type);
          this.emit('obs:success', data);
        });

        this.socket.on('obs:command:error', (data) => {
          console.error('[PCBridge] OBS command error:', data.error);
          this.emit('obs:error', data);
        });

        this.socket.on('obs:disconnected', () => {
          console.warn('[PCBridge] OBS disconnected');
          this.emit('obs:disconnected');
        });

        this.socket.on('tikfinity:error', (data) => {
          console.error('[PCBridge] TikFinity error:', data.message);
          this.emit('tikfinity:error', data);
        });

        this.socket.on('disconnect', (reason) => {
          console.warn(`[PCBridge] Disconnected: ${reason}`);
          this.connected = false;
          this.emit('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
          console.error('[PCBridge] Connection error:', error.message);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[PCBridge] Max reconnect attempts reached');
            this.emit('maxReconnectReached');
            reject(error);
          }
        });
      } catch (error) {
        console.error('[PCBridge] Connection failed:', error);
        reject(error);
      }
    });
  }

  async sendOBSCommand(command: OBSCommand): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error('PCBridge not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('OBS command timeout'));
      }, 5000);

      this.socket!.emit('obs:command', command);

      const successHandler = (data: any) => {
        if (data.command.type === command.type && data.command.sourceName === command.sourceName) {
          clearTimeout(timeout);
          this.socket!.off('obs:command:success', successHandler);
          this.socket!.off('obs:command:error', errorHandler);
          resolve();
        }
      };

      const errorHandler = (data: any) => {
        if (data.command.type === command.type && data.command.sourceName === command.sourceName) {
          clearTimeout(timeout);
          this.socket!.off('obs:command:success', successHandler);
          this.socket!.off('obs:command:error', errorHandler);
          reject(new Error(data.error));
        }
      };

      this.socket!.on('obs:command:success', successHandler);
      this.socket!.on('obs:command:error', errorHandler);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('[PCBridge] Disconnected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
