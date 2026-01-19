"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikFinityBootstrap = void 0;
const tikfinity_bridge_1 = require("@angeline-live/tikfinity-bridge");
class TikFinityBootstrap {
    constructor(config) {
        this.bridge = null;
        this.messageHandler = null;
        this.config = config;
    }
    async start(onMessage) {
        if (!this.config.enabled) {
            console.log('[TikFinity Bootstrap] Disabled via config');
            return;
        }
        this.messageHandler = onMessage;
        console.log('[TikFinity Bootstrap] Starting bridge...');
        this.bridge = new tikfinity_bridge_1.TikFinityBridge({
            wsUrl: this.config.wsUrl,
            simulate: this.config.simulate,
            simulateFile: this.config.simulateFile,
            reconnectEnabled: this.config.reconnectEnabled,
            maxReconnectAttempts: this.config.maxReconnectAttempts,
            heartbeatInterval: this.config.heartbeatInterval
        });
        const eventBus = this.bridge.getEventBus();
        eventBus.subscribe('CHAT_MESSAGE', (event) => {
            if (event.type === 'CHAT_MESSAGE') {
                const tikTokMsg = {
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
        eventBus.subscribe('GIFT', (event) => {
            if (event.type === 'GIFT') {
                const tikTokMsg = {
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
        eventBus.subscribe('FOLLOW', (event) => {
            if (event.type === 'FOLLOW') {
                const tikTokMsg = {
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
    stop() {
        if (this.bridge) {
            console.log('[TikFinity Bootstrap] Stopping bridge...');
            this.bridge.stop();
            this.bridge = null;
        }
    }
    getStatus() {
        if (!this.config.enabled) {
            return { enabled: false };
        }
        return {
            enabled: true,
            ...this.bridge?.getStatus()
        };
    }
}
exports.TikFinityBootstrap = TikFinityBootstrap;
