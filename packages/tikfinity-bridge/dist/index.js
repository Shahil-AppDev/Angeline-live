"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikFinityBridge = void 0;
__exportStar(require("./client"), exports);
__exportStar(require("./eventBus"), exports);
__exportStar(require("./normalizer"), exports);
__exportStar(require("./simulate"), exports);
const client_1 = require("./client");
const eventBus_1 = require("./eventBus");
const simulate_1 = require("./simulate");
class TikFinityBridge {
    constructor(config) {
        this.client = null;
        this.simulator = null;
        this.config = config;
        this.eventBus = new eventBus_1.EventBus();
    }
    async start() {
        if (this.config.simulate) {
            if (!this.config.simulateFile) {
                throw new Error('[Bridge] Simulate mode requires simulateFile path');
            }
            console.log('[Bridge] Starting in SIMULATE mode');
            this.simulator = new simulate_1.EventSimulator({ filePath: this.config.simulateFile }, this.eventBus);
            await this.simulator.start();
        }
        else {
            console.log('[Bridge] Starting in LIVE mode');
            const clientConfig = {
                wsUrl: this.config.wsUrl,
                reconnectEnabled: this.config.reconnectEnabled,
                maxReconnectAttempts: this.config.maxReconnectAttempts,
                heartbeatInterval: this.config.heartbeatInterval
            };
            this.client = new client_1.TikFinityClient(clientConfig, this.eventBus);
            await this.client.connect();
        }
    }
    stop() {
        if (this.client) {
            this.client.stop();
            this.client = null;
        }
        if (this.simulator) {
            this.simulator.stop();
            this.simulator = null;
        }
    }
    getEventBus() {
        return this.eventBus;
    }
    getStatus() {
        if (this.client) {
            return { mode: 'LIVE', ...this.client.getStatus() };
        }
        if (this.simulator) {
            return { mode: 'SIMULATE', ...this.simulator.getStatus() };
        }
        return { mode: 'STOPPED' };
    }
}
exports.TikFinityBridge = TikFinityBridge;
