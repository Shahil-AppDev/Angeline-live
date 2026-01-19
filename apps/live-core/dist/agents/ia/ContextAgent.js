"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAgent = void 0;
class ContextAgent {
    constructor() {
        this.contexts = new Map();
        this.maxContextAge = 5 * 60 * 1000;
        this.maxMessagesPerUser = 5;
    }
    addMessage(message) {
        const context = this.contexts.get(message.username) || {
            username: message.username,
            messages: [],
            lastInteraction: Date.now()
        };
        context.messages.push(message);
        context.lastInteraction = Date.now();
        if (context.messages.length > this.maxMessagesPerUser) {
            context.messages.shift();
        }
        this.contexts.set(message.username, context);
        this.cleanOldContexts();
    }
    getContext(username) {
        return this.contexts.get(username);
    }
    getRecentMessages(username, count = 3) {
        const context = this.contexts.get(username);
        if (!context)
            return [];
        return context.messages.slice(-count);
    }
    hasRecentInteraction(username) {
        const context = this.contexts.get(username);
        if (!context)
            return false;
        return (Date.now() - context.lastInteraction) < this.maxContextAge;
    }
    getLastMessageFromUser(userId) {
        // Chercher le dernier message de l'utilisateur par userId
        for (const [, context] of this.contexts.entries()) {
            const lastMessage = context.messages[context.messages.length - 1];
            if (lastMessage && lastMessage.userId === userId) {
                return lastMessage;
            }
        }
        return null;
    }
    cleanOldContexts() {
        const now = Date.now();
        const toDelete = [];
        for (const [username, context] of this.contexts.entries()) {
            if (now - context.lastInteraction > this.maxContextAge) {
                toDelete.push(username);
            }
        }
        toDelete.forEach(username => this.contexts.delete(username));
        if (toDelete.length > 0) {
            console.log(`🧹 Cleaned ${toDelete.length} old contexts`);
        }
    }
    clear() {
        this.contexts.clear();
    }
    getStats() {
        let totalMessages = 0;
        for (const context of this.contexts.values()) {
            totalMessages += context.messages.length;
        }
        return {
            totalUsers: this.contexts.size,
            totalMessages
        };
    }
}
exports.ContextAgent = ContextAgent;
