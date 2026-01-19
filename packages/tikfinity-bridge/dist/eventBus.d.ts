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
export declare class EventBus extends EventEmitter {
    constructor();
    publish(event: NormalizedEvent): void;
    subscribe(eventType: string, handler: (event: any) => void): void;
    unsubscribe(eventType: string, handler: (event: any) => void): void;
    clear(): void;
}
