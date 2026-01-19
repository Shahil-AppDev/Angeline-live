import WebSocket from 'ws';
import { EventBus } from './eventBus';
import { EventNormalizer } from './normalizer';

export interface TikFinityClientConfig {
  wsUrl: string;
  reconnectEnabled?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export class TikFinityClient {
  private ws: WebSocket | null = null;
  private config: Required<TikFinityClientConfig>;
  private eventBus: EventBus;
  private normalizer: EventNormalizer;
  
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastPongTime = 0;
  private isConnected = false;
  private isStopping = false;

  constructor(config: TikFinityClientConfig, eventBus: EventBus) {
    this.config = {
      wsUrl: config.wsUrl,
      reconnectEnabled: config.reconnectEnabled ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      connectionTimeout: config.connectionTimeout ?? 10000
    };
    this.eventBus = eventBus;
    this.normalizer = new EventNormalizer();
  }

  async connect(): Promise<void> {
    if (this.ws && this.isConnected) {
      console.log('[TikFinity] Already connected');
      return;
    }

    this.isStopping = false;
    console.log(`[TikFinity] Connecting to ${this.config.wsUrl}...`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[TikFinity] Connection timeout');
          this.cleanup();
          reject(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout);

      try {
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.on('open', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.lastPongTime = Date.now();
          console.log('[TikFinity] ✅ Connected successfully');
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('pong', () => {
          this.lastPongTime = Date.now();
          console.debug('[TikFinity] Pong received');
        });

        this.ws.on('error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[TikFinity] WebSocket error:', error.message);
          if (!this.isConnected) {
            reject(error);
          }
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          clearTimeout(timeout);
          const reasonStr = reason.toString();
          console.log(`[TikFinity] Connection closed (code: ${code}, reason: ${reasonStr})`);
          this.handleDisconnect();
        });

      } catch (error) {
        clearTimeout(timeout);
        console.error('[TikFinity] Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const raw = JSON.parse(data.toString());
      console.debug('[TikFinity] Raw event received:', raw.event);

      const normalized = this.normalizer.mapRawEvent(raw);
      if (normalized) {
        console.log(`[TikFinity] 📨 ${normalized.type} from ${normalized.username}`);
        this.eventBus.publish(normalized);
      }
    } catch (error) {
      console.error('[TikFinity] Error parsing message:', error);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || !this.isConnected) {
        this.stopHeartbeat();
        return;
      }

      const timeSinceLastPong = Date.now() - this.lastPongTime;
      if (timeSinceLastPong > this.config.heartbeatInterval * 2) {
        console.warn('[TikFinity] No pong received, connection may be dead');
        this.handleDisconnect();
        return;
      }

      try {
        this.ws.ping();
        console.debug('[TikFinity] Ping sent');
      } catch (error) {
        console.error('[TikFinity] Error sending ping:', error);
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    this.stopHeartbeat();
    this.cleanup();

    if (!this.isStopping && this.config.reconnectEnabled) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[TikFinity] Max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.calculateBackoff(this.reconnectAttempts);
    
    console.log(`[TikFinity] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('[TikFinity] Reconnect failed:', error);
      }
    }, delay);
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = Math.random() * 1000;
    return exponentialDelay + jitter;
  }

  private cleanup(): void {
    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (error) {
        console.error('[TikFinity] Error during cleanup:', error);
      }
      this.ws = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  stop(): void {
    console.log('[TikFinity] Stopping client...');
    this.isStopping = true;
    this.stopHeartbeat();
    this.cleanup();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  getStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}
