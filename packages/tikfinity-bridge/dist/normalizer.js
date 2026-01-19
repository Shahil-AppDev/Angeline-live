"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventNormalizer = void 0;
class EventNormalizer {
    mapRawEvent(raw) {
        if (!raw || !raw.event) {
            console.debug('[Normalizer] Invalid raw event - missing event type', raw);
            return null;
        }
        try {
            switch (raw.event) {
                case 'chat':
                    return this.normalizeChatMessage(raw.data);
                case 'gift':
                    return this.normalizeGift(raw.data);
                case 'follow':
                    return this.normalizeFollow(raw.data);
                default:
                    console.debug(`[Normalizer] Unknown event type: ${raw.event}`);
                    return null;
            }
        }
        catch (error) {
            console.error('[Normalizer] Error mapping event:', error, raw);
            return null;
        }
    }
    normalizeChatMessage(data) {
        if (!data)
            return null;
        const userId = data.userId || data.uniqueId || data.user_id || 'unknown';
        const username = data.uniqueId || data.nickname || data.username || 'Unknown';
        const message = data.comment || data.message || '';
        if (!message.trim()) {
            console.debug('[Normalizer] Empty chat message, skipping');
            return null;
        }
        return {
            type: 'CHAT_MESSAGE',
            userId,
            username,
            message,
            timestamp: Date.now()
        };
    }
    normalizeGift(data) {
        if (!data)
            return null;
        const userId = data.userId || data.uniqueId || data.user_id || 'unknown';
        const username = data.uniqueId || data.nickname || data.username || 'Unknown';
        const giftId = data.giftId || data.gift_id || 0;
        const giftName = data.giftName || data.gift_name || 'Unknown Gift';
        const coins = data.diamondCount || data.coins || data.diamond_count || 0;
        const count = data.repeatCount || data.count || data.repeat_count || 1;
        return {
            type: 'GIFT',
            userId,
            username,
            giftId,
            giftName,
            coins,
            count,
            timestamp: Date.now()
        };
    }
    normalizeFollow(data) {
        if (!data)
            return null;
        const userId = data.userId || data.uniqueId || data.user_id || 'unknown';
        const username = data.uniqueId || data.nickname || data.username || 'Unknown';
        return {
            type: 'FOLLOW',
            userId,
            username,
            timestamp: Date.now()
        };
    }
}
exports.EventNormalizer = EventNormalizer;
