import { EventEmitter } from 'events';
export declare class TikFinityClient extends EventEmitter {
    private apiKey;
    private webhookSecret;
    private webhookServer?;
    private webhookPort;
    constructor(apiKey: string, webhookSecret: string, webhookPort?: number);
    startWebhookServer(): void;
    private handleWebhook;
    private verifySignature;
    private handleChatMessage;
    private handleGift;
    private handleFollow;
    private handleShare;
    private handleLike;
    sendChatMessage(message: string): Promise<void>;
    testConnection(): Promise<boolean>;
    stop(): void;
}
