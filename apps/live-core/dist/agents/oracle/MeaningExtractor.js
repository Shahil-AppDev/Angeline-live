"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeaningExtractor = void 0;
class MeaningExtractor {
    extractMeanings(cards) {
        const meanings = cards.map((card, index) => {
            const position = this.getPositionLabel(index);
            return `${position}: ${card.name} - ${card.meaning}`;
        });
        return meanings.join('\n');
    }
    getPositionLabel(index) {
        const labels = ['Passé/Situation', 'Présent/Défi', 'Futur/Conseil'];
        return labels[index] || `Position ${index + 1}`;
    }
    buildReadingContext(cards, question) {
        return `
Question: ${question}

Tirage de 3 cartes:
${this.extractMeanings(cards)}

Interprétation globale:
Les cartes révèlent un message cohérent qui répond à la question posée.
    `.trim();
    }
    summarizeReading(cards) {
        return `Tirage: ${cards.map(c => c.name).join(' → ')}`;
    }
}
exports.MeaningExtractor = MeaningExtractor;
