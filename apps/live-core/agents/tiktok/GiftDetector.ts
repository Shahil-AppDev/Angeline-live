import { TikTokMessage } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class GiftDetector extends EventEmitter {
  private isActive: boolean = false;
  private giftCount: number = 0;

  constructor() {
    super();
  }

  start(): void {
    this.isActive = true;
    this.giftCount = 0;
    console.log('✅ GiftDetector started');
  }

  stop(): void {
    this.isActive = false;
    console.log('🛑 GiftDetector stopped');
  }

  handleGift(message: TikTokMessage): void {
    if (!this.isActive || !message.isGift) return;

    this.giftCount++;
    console.log(`🎁 [${message.username}] sent ${message.giftName} (Total: ${this.giftCount})`);
    
    this.emit('gift_received', {
      username: message.username,
      giftName: message.giftName,
      timestamp: message.timestamp
    });
  }

  getStats(): { totalGifts: number } {
    return { totalGifts: this.giftCount };
  }

  reset(): void {
    this.giftCount = 0;
  }
}
