import { EventEmitter } from 'events';

export class SafetyGuard extends EventEmitter {
  private blockedWords: string[] = [
    'insulte',
    'spam',
    'arnaque',
    'scam'
  ];

  private blockedUsers: Set<string> = new Set();

  constructor() {
    super();
  }

  isSafe(message: string, username: string): { safe: boolean; reason?: string } {
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

  blockUser(username: string): void {
    this.blockedUsers.add(username);
    console.log(`🚫 User blocked: ${username}`);
  }

  unblockUser(username: string): void {
    this.blockedUsers.delete(username);
    console.log(`✅ User unblocked: ${username}`);
  }

  addBlockedWord(word: string): void {
    this.blockedWords.push(word.toLowerCase());
  }

  getBlockedUsers(): string[] {
    return Array.from(this.blockedUsers);
  }
}
