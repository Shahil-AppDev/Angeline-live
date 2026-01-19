import { TikTokMessage } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class FollowAgent extends EventEmitter {
  private isActive: boolean = false;
  private followCount: number = 0;

  constructor() {
    super();
  }

  start(): void {
    this.isActive = true;
    this.followCount = 0;
    console.log('✅ FollowAgent started');
  }

  stop(): void {
    this.isActive = false;
    console.log('🛑 FollowAgent stopped');
  }

  handleFollow(message: TikTokMessage): void {
    if (!this.isActive || !message.isFollow) return;

    this.followCount++;
    console.log(`👤 [${message.username}] followed! (Total: ${this.followCount})`);
    
    this.emit('new_follow', {
      username: message.username,
      timestamp: message.timestamp
    });
  }

  getStats(): { totalFollows: number } {
    return { totalFollows: this.followCount };
  }

  reset(): void {
    this.followCount = 0;
  }
}
