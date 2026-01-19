"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(minDelayMs = 500) {
        this.queue = [];
        this.isProcessing = false;
        this.minDelay = minDelayMs;
    }
    async execute(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            });
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }
    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        this.isProcessing = true;
        const task = this.queue.shift();
        if (task) {
            await task();
            await new Promise(resolve => setTimeout(resolve, this.minDelay));
        }
        this.processQueue();
    }
    getQueueLength() {
        return this.queue.length;
    }
    clear() {
        this.queue = [];
        this.isProcessing = false;
    }
}
exports.RateLimiter = RateLimiter;
