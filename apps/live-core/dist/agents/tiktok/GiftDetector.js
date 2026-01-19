"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftDetector = void 0;
const events_1 = require("events");
class GiftDetector extends events_1.EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.giftCount = 0;
    }
    start() {
        this.isActive = true;
        this.giftCount = 0;
        console.log('✅ GiftDetector started');
    }
    stop() {
        this.isActive = false;
        console.log('🛑 GiftDetector stopped');
    }
    handleGift(message) {
        if (!this.isActive || !message.isGift)
            return;
        this.giftCount++;
        console.log(`🎁 [${message.username}] sent ${message.giftName} (Total: ${this.giftCount})`);
        this.emit('gift_received', {
            username: message.username,
            giftName: message.giftName,
            timestamp: message.timestamp
        });
    }
    getStats() {
        return { totalGifts: this.giftCount };
    }
    reset() {
        this.giftCount = 0;
    }
}
exports.GiftDetector = GiftDetector;
