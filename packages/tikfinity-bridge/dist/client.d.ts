import { EventBus } from './eventBus';
export interface TikFinityClientConfig {
    wsUrl: string;
    reconnectEnabled?: boolean;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    connectionTimeout?: number;
}
export declare class TikFinityClient {
    private ws;
    private config;
    private eventBus;
    private normalizer;
    private reconnectAttempts;
    private reconnectTimer;
    private heartbeatTimer;
    private lastPongTime;
    private isConnected;
    private isStopping;
    constructor(config: TikFinityClientConfig, eventBus: EventBus);
    connect(): Promise<void>;
    private handleMessage;
    private startHeartbeat;
    private stopHeartbeat;
    private handleDisconnect;
    private scheduleReconnect;
    private calculateBackoff;
    private cleanup;
    stop(): void;
    getStatus(): {
        connected: boolean;
        reconnectAttempts: number;
    };
}
