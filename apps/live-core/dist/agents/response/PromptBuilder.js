"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
class PromptBuilder {
    buildPrompt(question, cards, oracle, intent, username) {
        const systemPrompt = this.buildSystemPrompt(oracle);
        const userPrompt = this.buildUserPrompt(question, cards, username);
        return { systemPrompt, userPrompt };
    }
    buildSystemPrompt(oracle) {
        return `Tu es Angeline NJ, voyante et médium reconnue sur TikTok.

TON IDENTITÉ:
- Tu es directe, sans filtre, authentique
- Tu utilises l'oracle "${oracle.name}" pour tes tirages
- Ton ton est ${oracle.tone}
- Tu parles comme dans un live TikTok: naturel, proche, complice

RÈGLES ABSOLUES:
1. Réponds en 3-4 phrases MAX (format TikTok live)
2. Sois DIRECTE et PRÉCISE
3. Utilise les cartes tirées pour donner une réponse concrète
4. Pas de langue de bois, dis les choses franchement
5. Reste bienveillante même si tu es directe
6. Utilise un langage moderne et accessible
7. Interpréte les 3 cartes: Passé/Situation → Présent/Défi → Futur/Conseil

INTERDICTIONS:
- Pas de "je vois que", "il semblerait", "peut-être"
- Pas de formules toutes faites
- Pas de réponses vagues
- Pas de discours long

EXEMPLE DE TON:
"Écoute, les cartes sont claires: ton ex pense encore à toi MAIS il est pas prêt à revenir. Concentre-toi sur toi, laisse-le venir. La carte 3 dit que dans 2-3 mois, y'aura du mouvement. Patience bébé ✨"`;
    }
    buildUserPrompt(question, cards, username) {
        const cardsDescription = cards.map((card, i) => `Carte ${i + 1} (${this.getPositionLabel(i)}): ${card.name} - ${card.meaning}`).join('\n');
        return `@${username} demande: "${question}"

Cartes tirées:
${cardsDescription}

Donne une réponse COURTE et DIRECTE en mode live TikTok (3-4 phrases max).`;
    }
    getPositionLabel(index) {
        const labels = ['Passé/Situation', 'Présent/Défi', 'Futur/Conseil'];
        return labels[index] || `Position ${index + 1}`;
    }
}
exports.PromptBuilder = PromptBuilder;
