"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikFinityClient = void 0;
const ws_1 = __importDefault(require("ws"));
const normalizer_1 = require("./normalizer");
class TikFinityClient {
    constructor(config, eventBus) {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.lastPongTime = 0;
        this.isConnected = false;
        this.isStopping = false;
        this.config = {
            wsUrl: config.wsUrl,
            reconnectEnabled: config.reconnectEnabled ?? true,
            maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
            heartbeatInterval: config.heartbeatInterval ?? 30000,
            connectionTimeout: config.connectionTimeout ?? 10000
        };
        this.eventBus = eventBus;
        this.normalizer = new normalizer_1.EventNormalizer();
    }
    async connect() {
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
                this.ws = new ws_1.default(this.config.wsUrl);
                this.ws.on('open', () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.lastPongTime = Date.now();
                    console.log('[TikFinity] ✅ Connected successfully');
                    this.startHeartbeat();
                    resolve();
                });
                this.ws.on('message', (data) => {
                    this.handleMessage(data);
                });
                this.ws.on('pong', () => {
                    this.lastPongTime = Date.now();
                    console.debug('[TikFinity] Pong received');
                });
                this.ws.on('error', (error) => {
                    clearTimeout(timeout);
                    console.error('[TikFinity] WebSocket error:', error.message);
                    if (!this.isConnected) {
                        reject(error);
                    }
                });
                this.ws.on('close', (code, reason) => {
                    clearTimeout(timeout);
                    const reasonStr = reason.toString();
                    console.log(`[TikFinity] Connection closed (code: ${code}, reason: ${reasonStr})`);
                    this.handleDisconnect();
                });
            }
            catch (error) {
                clearTimeout(timeout);
                console.error('[TikFinity] Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }
    handleMessage(data) {
        try {
            const raw = JSON.parse(data.toString());
            console.debug('[TikFinity] Raw event received:', raw.event);
            const normalized = this.normalizer.mapRawEvent(raw);
            if (normalized) {
                console.log(`[TikFinity] 📨 ${normalized.type} from ${normalized.username}`);
                this.eventBus.publish(normalized);
            }
        }
        catch (error) {
            console.error('[TikFinity] Error parsing message:', error);
        }
    }
    startHeartbeat() {
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
            }
            catch (error) {
                console.error('[TikFinity] Error sending ping:', error);
            }
        }, this.config.heartbeatInterval);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    handleDisconnect() {
        this.isConnected = false;
        this.stopHeartbeat();
        this.cleanup();
        if (!this.isStopping && this.config.reconnectEnabled) {
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
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
            }
            catch (error) {
                console.error('[TikFinity] Reconnect failed:', error);
            }
        }, delay);
    }
    calculateBackoff(attempt) {
        const baseDelay = 1000;
        const maxDelay = 30000;
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        const jitter = Math.random() * 1000;
        return exponentialDelay + jitter;
    }
    cleanup() {
        if (this.ws) {
            try {
                this.ws.removeAllListeners();
                if (this.ws.readyState === ws_1.default.OPEN || this.ws.readyState === ws_1.default.CONNECTING) {
                    this.ws.close();
                }
            }
            catch (error) {
                console.error('[TikFinity] Error during cleanup:', error);
            }
            this.ws = null;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    stop() {
        console.log('[TikFinity] Stopping client...');
        this.isStopping = true;
        this.stopHeartbeat();
        this.cleanup();
        this.isConnected = false;
        this.reconnectAttempts = 0;
    }
    getStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}
exports.TikFinityClient = TikFinityClient;
