"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyGuard = void 0;
const events_1 = require("events");
class SafetyGuard extends events_1.EventEmitter {
    constructor() {
        super();
        this.blockedWords = [
            'insulte',
            'spam',
            'arnaque',
            'scam'
        ];
        this.blockedUsers = new Set();
    }
    isSafe(message, username) {
        if (this.blockedUsers.has(username)) {
            return { safe: false, reason: 'User blocked' };
        }
        const lowerMessage = message.toLowerCase();
        for (const word of this.blockedWords) {
            if (lowerMessage.includes(word)) {
                this.emit('unsafe_content', { message, username, reason: `Blocked word: ${word}` });
                return { safe: false, reason: `Contains blocked word: ${word}` };
            }
        }
        if (message.length < 3) {
            return { safe: false, reason: 'Message too short' };
        }
        if (message.length > 500) {
            return { safe: false, reason: 'Message too long' };
        }
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        if (urlPattern.test(message)) {
            this.emit('unsafe_content', { message, username, reason: 'Contains URL' });
            return { safe: false, reason: 'Contains URL' };
        }
        return { safe: true };
    }
    blockUser(username) {
        this.blockedUsers.add(username);
        console.log(`🚫 User blocked: ${username}`);
    }
    unblockUser(username) {
        this.blockedUsers.delete(username);
        console.log(`✅ User unblocked: ${username}`);
    }
    addBlockedWord(word) {
        this.blockedWords.push(word.toLowerCase());
    }
    getBlockedUsers() {
        return Array.from(this.blockedUsers);
    }
}
exports.SafetyGuard = SafetyGuard;
