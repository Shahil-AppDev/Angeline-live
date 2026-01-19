import { Card, IntentAnalysisResult, OracleConfig } from '@angeline-live/shared';
import * as path from 'path';
import { OracleTrainingLoader } from '../oracle/OracleTrainingLoader';

export class PromptBuilder {
  private trainingLoader: OracleTrainingLoader;

  constructor(assetsPath?: string) {
    const rootPath = assetsPath || path.resolve(__dirname, '../../../../assets');
    this.trainingLoader = new OracleTrainingLoader(rootPath);
  }

  buildPrompt(
    question: string,
    cards: Card[],
    oracle: OracleConfig,
    intent: IntentAnalysisResult,
    username: string
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = this.buildSystemPrompt(oracle);
    const userPrompt = this.buildUserPrompt(question, cards, username, intent);

    return { systemPrompt, userPrompt };
  }

  private buildSystemPrompt(oracle: OracleConfig): string {
    const hasTraining = this.trainingLoader.isTrainingAvailable();

    if (hasTraining) {
      return this.trainingLoader.generateEnrichedSystemPrompt();
    }

    return `Tu es Angeline NJ, voyante et médium reconnue sur TikTok.

TON IDENTITÉ:
- Tu es directe, sans filtre, authentique
- Tu utilises l'oracle "${oracle.name}" pour tes tirages
- Ton ton est ${oracle.tone}
- Tu parles comme dans un live TikTok: naturel, proche, complice

RÈGLES ABSOLUES:
1. Réponds en 6-8 phrases MAX (format TikTok live)
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

  private buildUserPrompt(question: string, cards: Card[], username: string, intent: IntentAnalysisResult): string {
    const hasTraining = this.trainingLoader.isTrainingAvailable();
    
    let prompt = `@${username} demande: "${question}"\n`;
    
    if (intent.axis) {
      prompt += `Thème: ${intent.axis}\n`;
    }

    prompt += `\n=== TIRAGE DE 3 CARTES ===\n\n`;

    cards.forEach((card, i) => {
      const positionLabel = this.getPositionLabel(i);
      prompt += `${positionLabel}: ${card.name}\n`;
      prompt += `Signification: ${card.meaning}\n`;
      
      if (card.keywords && card.keywords.length > 0) {
        prompt += `Mots-clés: ${card.keywords.join(', ')}\n`;
      }
      
      prompt += `\n`;
    });

    if (hasTraining) {
      const examples = this.trainingLoader.getExamplePhrases();
      prompt += `\n=== STRUCTURE ATTENDUE ===\n`;
      prompt += `1. Accroche mystique (ex: "${examples.openings[0]}")\n`;
      prompt += `2. Interprétation Carte 1 (Passé/Contexte) - 1-2 phrases\n`;
      prompt += `3. Interprétation Carte 2 (Présent/Défi) - 1-2 phrases\n`;
      prompt += `4. Interprétation Carte 3 (Futur/Conseil) - 1-2 phrases\n`;
      prompt += `5. Conclusion empowering (ex: "${examples.closings[0]}")\n\n`;
    }

    prompt += `Donne une réponse MYSTIQUE, DIRECTE et BIENVEILLANTE en mode live TikTok (6-8 phrases max).`;

    return prompt;
  }

  private getPositionLabel(index: number): string {
    const labels = [
      'CARTE 1 - PASSÉ/CONTEXTE (Gauche)',
      'CARTE 2 - PRÉSENT/DÉFI (Centre)',
      'CARTE 3 - FUTUR/CONSEIL (Droite)'
    ];
    return labels[index] || `Position ${index + 1}`;
  }
}
