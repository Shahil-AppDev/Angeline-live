import { NormalizedEvent } from './eventBus';
export declare class EventNormalizer {
    mapRawEvent(raw: any): NormalizedEvent | null;
    private normalizeChatMessage;
    private normalizeGift;
    private normalizeFollow;
}
