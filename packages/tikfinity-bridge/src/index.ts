export * from './client';
export * from './eventBus';
export * from './normalizer';
export * from './simulate';

import { TikFinityClient, TikFinityClientConfig } from './client';
import { EventBus } from './eventBus';
import { EventSimulator } from './simulate';

export interface TikFinityBridgeConfig {
  wsUrl: string;
  simulate?: boolean;
  simulateFile?: string;
  reconnectEnabled?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class TikFinityBridge {
  private eventBus: EventBus;
  private client: TikFinityClient | null = null;
  private simulator: EventSimulator | null = null;
  private config: TikFinityBridgeConfig;

  constructor(config: TikFinityBridgeConfig) {
    this.config = config;
    this.eventBus = new EventBus();
  }

  async start(): Promise<void> {
    if (this.config.simulate) {
      if (!this.config.simulateFile) {
        throw new Error('[Bridge] Simulate mode requires simulateFile path');
      }
      console.log('[Bridge] Starting in SIMULATE mode');
      this.simulator = new EventSimulator(
        { filePath: this.config.simulateFile },
        this.eventBus
      );
      await this.simulator.start();
    } else {
      console.log('[Bridge] Starting in LIVE mode');
      const clientConfig: TikFinityClientConfig = {
        wsUrl: this.config.wsUrl,
        reconnectEnabled: this.config.reconnectEnabled,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
        heartbeatInterval: this.config.heartbeatInterval
      };
      this.client = new TikFinityClient(clientConfig, this.eventBus);
      await this.client.connect();
    }
  }

  stop(): void {
    if (this.client) {
      this.client.stop();
      this.client = null;
    }
    if (this.simulator) {
      this.simulator.stop();
      this.simulator = null;
    }
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getStatus(): any {
    if (this.client) {
      return { mode: 'LIVE', ...this.client.getStatus() };
    }
    if (this.simulator) {
      return { mode: 'SIMULATE', ...this.simulator.getStatus() };
    }
    return { mode: 'STOPPED' };
  }
}
