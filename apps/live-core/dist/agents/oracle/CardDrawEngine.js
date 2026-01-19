"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardDrawEngine = void 0;
const events_1 = require("events");
class CardDrawEngine extends events_1.EventEmitter {
    constructor(oracleManager) {
        super();
        this.oracleManager = oracleManager;
    }
    drawCards(oracle, count = 3) {
        console.log(`🎴 Drawing ${count} cards from ${oracle.name}...`);
        const availableCards = this.oracleManager.getAvailableCards(oracle.id);
        if (availableCards.length === 0) {
            throw new Error(`No cards available for oracle ${oracle.id}`);
        }
        const shuffled = this.shuffle(availableCards);
        const drawnNumbers = shuffled.slice(0, count);
        const cards = drawnNumbers.map((cardNumber, index) => {
            const imagePath = this.oracleManager.getCardPath(oracle.id, cardNumber, 'image');
            return {
                id: `${oracle.id}_${cardNumber}`,
                number: cardNumber,
                name: `Card ${cardNumber}`,
                meaning: `Signification de la carte ${cardNumber}`,
                keywords: [],
                image_path: imagePath,
                video_path: undefined
            };
        });
        console.log(`✅ Drew cards: ${cards.map(c => c.number).join(', ')}`);
        this.emit('cards_drawn', {
            oracle,
            cards
        });
        return cards;
    }
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    getCardMeaning(card, reversed = false) {
        return reversed && card.reversed_meaning
            ? card.reversed_meaning
            : card.meaning;
    }
}
exports.CardDrawEngine = CardDrawEngine;
