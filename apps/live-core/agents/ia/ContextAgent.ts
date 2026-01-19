import { TikTokMessage } from '@angeline-live/shared';

interface ConversationContext {
  username: string;
  messages: TikTokMessage[];
  lastInteraction: number;
}

export class ContextAgent {
  private contexts: Map<string, ConversationContext> = new Map();
  private maxContextAge: number = 5 * 60 * 1000;
  private maxMessagesPerUser: number = 5;

  addMessage(message: TikTokMessage): void {
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

  getContext(username: string): ConversationContext | undefined {
    return this.contexts.get(username);
  }

  getRecentMessages(username: string, count: number = 3): TikTokMessage[] {
    const context = this.contexts.get(username);
    if (!context) return [];

    return context.messages.slice(-count);
  }

  hasRecentInteraction(username: string): boolean {
    const context = this.contexts.get(username);
    if (!context) return false;

    return (Date.now() - context.lastInteraction) < this.maxContextAge;
  }

  getLastMessageFromUser(userId: string): TikTokMessage | null {
    // Chercher le dernier message de l'utilisateur par userId
    for (const [, context] of this.contexts.entries()) {
      const lastMessage = context.messages[context.messages.length - 1];
      if (lastMessage && lastMessage.userId === userId) {
        return lastMessage;
      }
    }
    return null;
  }

  private cleanOldContexts(): void {
    const now = Date.now();
    const toDelete: string[] = [];

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

  clear(): void {
    this.contexts.clear();
  }

  getStats(): { totalUsers: number; totalMessages: number } {
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
