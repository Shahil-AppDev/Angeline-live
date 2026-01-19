export class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;
  private minDelay: number;

  constructor(minDelayMs: number = 500) {
    this.minDelay = minDelayMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
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

  getQueueLength(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }
}
