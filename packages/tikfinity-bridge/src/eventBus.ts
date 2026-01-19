import { EventEmitter } from 'events';

export interface NormalizedChatMessage {
  type: 'CHAT_MESSAGE';
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface NormalizedGift {
  type: 'GIFT';
  userId: string;
  username: string;
  giftId: number;
  giftName: string;
  coins: number;
  count: number;
  timestamp: number;
}

export interface NormalizedFollow {
  type: 'FOLLOW';
  userId: string;
  username: string;
  timestamp: number;
}

export type NormalizedEvent = NormalizedChatMessage | NormalizedGift | NormalizedFollow;

export class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publish(event: NormalizedEvent): void {
    this.emit(event.type, event);
    this.emit('*', event);
  }

  subscribe(eventType: string, handler: (event: any) => void): void {
    this.on(eventType, handler);
  }

  unsubscribe(eventType: string, handler: (event: any) => void): void {
    this.off(eventType, handler);
  }

  clear(): void {
    this.removeAllListeners();
  }
}
