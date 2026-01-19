export * from './client';
export * from './eventBus';
export * from './normalizer';
export * from './simulate';
import { EventBus } from './eventBus';
export interface TikFinityBridgeConfig {
    wsUrl: string;
    simulate?: boolean;
    simulateFile?: string;
    reconnectEnabled?: boolean;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
}
export declare class TikFinityBridge {
    private eventBus;
    private client;
    private simulator;
    private config;
    constructor(config: TikFinityBridgeConfig);
    start(): Promise<void>;
    stop(): void;
    getEventBus(): EventBus;
    getStatus(): any;
}
