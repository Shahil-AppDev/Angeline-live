"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowAgent = void 0;
const events_1 = require("events");
class FollowAgent extends events_1.EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.followCount = 0;
    }
    start() {
        this.isActive = true;
        this.followCount = 0;
        console.log('✅ FollowAgent started');
    }
    stop() {
        this.isActive = false;
        console.log('🛑 FollowAgent stopped');
    }
    handleFollow(message) {
        if (!this.isActive || !message.isFollow)
            return;
        this.followCount++;
        console.log(`👤 [${message.username}] followed! (Total: ${this.followCount})`);
        this.emit('new_follow', {
            username: message.username,
            timestamp: message.timestamp
        });
    }
    getStats() {
        return { totalFollows: this.followCount };
    }
    reset() {
        this.followCount = 0;
    }
}
exports.FollowAgent = FollowAgent;
