import { TikTokMessage } from '@angeline-live/shared';
import { NormalizedEvent, TikFinityBridge } from '@angeline-live/tikfinity-bridge';

export interface TikFinityBootstrapConfig {
  enabled: boolean;
  wsUrl: string;
  simulate: boolean;
  simulateFile?: string;
  reconnectEnabled?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class TikFinityBootstrap {
  private bridge: TikFinityBridge | null = null;
  private config: TikFinityBootstrapConfig;
  private messageHandler: ((msg: TikTokMessage) => void) | null = null;

  constructor(config: TikFinityBootstrapConfig) {
    this.config = config;
  }

  async start(onMessage: (msg: TikTokMessage) => void): Promise<void> {
    if (!this.config.enabled) {
      console.log('[TikFinity Bootstrap] Disabled via config');
      return;
    }

    this.messageHandler = onMessage;

    console.log('[TikFinity Bootstrap] Starting bridge...');
    
    this.bridge = new TikFinityBridge({
      wsUrl: this.config.wsUrl,
      simulate: this.config.simulate,
      simulateFile: this.config.simulateFile,
      reconnectEnabled: this.config.reconnectEnabled,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
      heartbeatInterval: this.config.heartbeatInterval
    });

    const eventBus = this.bridge.getEventBus();

    eventBus.subscribe('CHAT_MESSAGE', (event: NormalizedEvent) => {
      if (event.type === 'CHAT_MESSAGE') {
        const tikTokMsg: TikTokMessage = {
          username: event.username,
          message: event.message,
          userId: event.userId,
          timestamp: event.timestamp,
          isGift: false,
          isFollow: false
        };
        this.messageHandler?.(tikTokMsg);
      }
    });

    eventBus.subscribe('GIFT', (event: NormalizedEvent) => {
      if (event.type === 'GIFT') {
        const tikTokMsg: TikTokMessage = {
          username: event.username,
          message: `Sent ${event.giftName} x${event.count}`,
          userId: event.userId,
          timestamp: event.timestamp,
          isGift: true,
          giftId: event.giftId,
          giftName: event.giftName,
          repeatCount: event.count,
          isFollow: false
        };
        this.messageHandler?.(tikTokMsg);
      }
    });

    eventBus.subscribe('FOLLOW', (event: NormalizedEvent) => {
      if (event.type === 'FOLLOW') {
        const tikTokMsg: TikTokMessage = {
          username: event.username,
          message: 'Started following',
          userId: event.userId,
          timestamp: event.timestamp,
          isGift: false,
          isFollow: true
        };
        this.messageHandler?.(tikTokMsg);
      }
    });

    await this.bridge.start();
    console.log('[TikFinity Bootstrap] Bridge started successfully');
  }

  stop(): void {
    if (this.bridge) {
      console.log('[TikFinity Bootstrap] Stopping bridge...');
      this.bridge.stop();
      this.bridge = null;
    }
  }

  getStatus(): any {
    if (!this.config.enabled) {
      return { enabled: false };
    }
    return {
      enabled: true,
      ...this.bridge?.getStatus()
    };
  }
}
