import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { NormalizedEvent, TikFinityEvent } from '../types';
import { logger } from '../utils/logger';

export class TikFinityService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastEventTime = 0;

  constructor(
    private url: string,
    private maxReconnectAttempts: number,
    private reconnectInterval: number,
    private heartbeatInterval: number
  ) {
    super();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`[TikFinity] Connecting to ${this.url}...`);
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          logger.info('[TikFinity] Connected successfully');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          logger.warn(`[TikFinity] Connection closed (code: ${code}, reason: ${reason.toString()})`);
          this.stopHeartbeat();
          this.scheduleReconnect();
        });

        this.ws.on('error', (error: Error) => {
          logger.error('[TikFinity] WebSocket error:', error);
          reject(error);
        });
      } catch (error) {
        logger.error('[TikFinity] Connection error:', error);
        reject(error);
      }
    });
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'ping') {
        this.ws?.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      const normalized = this.normalizeEvent(message);
      if (normalized) {
        this.lastEventTime = Date.now();
        this.emit('event', normalized);
        logger.debug(`[TikFinity] Event received: ${normalized.type} from ${normalized.username}`);
      }
    } catch (error) {
      logger.error('[TikFinity] Error parsing message:', error);
    }
  }

  private normalizeEvent(event: TikFinityEvent): NormalizedEvent | null {
    if (!event.type || !event.user) {
      return null;
    }

    return {
      type: event.type,
      timestamp: event.timestamp || Date.now(),
      userId: event.user.id,
      username: event.user.username,
      nickname: event.user.nickname,
      message: event.data?.message,
      giftId: event.data?.giftId,
      giftName: event.data?.giftName,
      giftCount: event.data?.giftCount,
      diamondCost: event.data?.diamondCost,
    };
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('[TikFinity] Max reconnect attempts reached');
      this.emit('maxReconnectReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    logger.info(`[TikFinity] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        logger.error('[TikFinity] Reconnect failed:', error);
      });
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    logger.info('[TikFinity] Disconnected');
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getStatus() {
    return {
      connected: this.isConnected(),
      lastEvent: this.lastEventTime || undefined,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
