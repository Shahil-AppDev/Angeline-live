import { Card } from '@angeline-live/shared';
import * as path from 'path';
import { OracleTrainingLoader } from './OracleTrainingLoader';

export class MeaningExtractor {
  private trainingLoader: OracleTrainingLoader;

  constructor(assetsPath?: string) {
    const rootPath = assetsPath || path.resolve(__dirname, '../../../../assets');
    this.trainingLoader = new OracleTrainingLoader(rootPath);
  }

  extractMeanings(cards: Card[]): string {
    const meanings = cards.map((card, index) => {
      const position = this.getPositionLabel(index);
      const positionGuidance = this.getPositionGuidance(index);
      return `${position}: ${card.name}\n${positionGuidance}\nSignification: ${card.meaning}`;
    });

    return meanings.join('\n\n');
  }

  private getPositionLabel(index: number): string {
    const labels = ['CARTE 1 - PASSÉ/CONTEXTE', 'CARTE 2 - PRÉSENT/DÉFI', 'CARTE 3 - FUTUR/CONSEIL'];
    return labels[index] || `Position ${index + 1}`;
  }

  private getPositionGuidance(index: number): string {
    if (!this.trainingLoader.isTrainingAvailable()) {
      return '';
    }

    const guidelines = this.trainingLoader.getCardPositionGuidelines();
    const guidanceMap = [guidelines.position1, guidelines.position2, guidelines.position3];
    return guidanceMap[index] || '';
  }

  buildReadingContext(cards: Card[], question: string, intentAxis?: string): string {
    const hasTraining = this.trainingLoader.isTrainingAvailable();
    
    let context = `Question posée: "${question}"`;
    
    if (intentAxis) {
      context += `\nAxe thématique: ${intentAxis}`;
    }

    context += `\n\n=== TIRAGE DE 3 CARTES ===\n\n${this.extractMeanings(cards)}`;

    if (hasTraining) {
      context += `\n\n=== PRINCIPES D'INTERPRÉTATION ===\n${this.trainingLoader.getOraclePrinciples()}`;
      context += `\n\n=== STRUCTURE DE RÉPONSE ===\n${this.trainingLoader.getResponseTemplate()}`;
    }

    context += `\n\n=== CONSIGNES ===
- Interpréter les 3 cartes comme un message cohérent et fluide
- Utiliser le ton Angeline NJ: mystique, direct, bienveillant
- Maximum 8 phrases courtes
- Tutoiement obligatoire
- Toujours positif et empowering
- Adapter le message à la question posée`;

    return context.trim();
  }

  summarizeReading(cards: Card[]): string {
    return `Tirage: ${cards.map(c => c.name).join(' → ')}`;
  }

  getEnrichedSystemPrompt(): string {
    if (this.trainingLoader.isTrainingAvailable()) {
      return this.trainingLoader.generateEnrichedSystemPrompt();
    }

    return `Tu es Angeline NJ, médium et experte en oracles.
Interprète les 3 cartes tirées de manière cohérente et fluide.
Ton: mystique, direct, bienveillant. Tutoiement. Maximum 8 phrases courtes.`;
  }

  getExamplePhrases() {
    if (this.trainingLoader.isTrainingAvailable()) {
      return this.trainingLoader.getExamplePhrases();
    }
    return null;
  }
}
