export interface Card {
  id: string;
  name: string;
  imagePath: string;
  keywords?: string[];
  metadata?: {
    keywords?: string[];
    themes?: string[];
    energy?: string;
  };
}

export interface DrawingResult {
  cards: Card[];
  keywords: string[];
  question?: string;
}

export class DrawingPipeline {
  /**
   * Tire 3 cartes uniques d'un deck
   */
  drawThreeUniqueCards(deck: Card[]): Card[] {
    if (deck.length < 3) {
      throw new Error('Deck must contain at least 3 cards');
    }

    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  /**
   * Extrait les 2 mots-clés les plus pertinents d'une carte
   */
  extractTopKeywords(card: Card, count: number = 2): string[] {
    const allKeywords: string[] = [];

    // Priorité 1: keywords directs
    if (card.keywords && card.keywords.length > 0) {
      allKeywords.push(...card.keywords);
    }

    // Priorité 2: metadata.keywords
    if (card.metadata?.keywords && card.metadata.keywords.length > 0) {
      allKeywords.push(...card.metadata.keywords);
    }

    // Priorité 3: metadata.themes
    if (card.metadata?.themes && card.metadata.themes.length > 0) {
      allKeywords.push(...card.metadata.themes);
    }

    // Priorité 4: metadata.energy
    if (card.metadata?.energy) {
      allKeywords.push(card.metadata.energy);
    }

    // Dédupliquer et prendre les N premiers
    const uniqueKeywords = [...new Set(allKeywords)];
    return uniqueKeywords.slice(0, count);
  }

  /**
   * Pipeline complet de tirage optimisé
   * 1. Tire 3 cartes uniques
   * 2. Extrait 2 mots-clés par carte (6 total)
   * 3. Retourne le résultat pour génération de réponse
   */
  performDrawing(deck: Card[], question?: string): DrawingResult {
    // 1. Tirer 3 cartes uniques
    const cards = this.drawThreeUniqueCards(deck);

    // 2. Extraire 2 mots-clés par carte
    const keywords: string[] = [];
    for (const card of cards) {
      const cardKeywords = this.extractTopKeywords(card, 2);
      keywords.push(...cardKeywords);
    }

    return {
      cards,
      keywords, // 6 mots-clés au total (2 par carte)
      question,
    };
  }

  /**
   * Génère un prompt pour l'IA basé sur le tirage
   */
  generatePrompt(result: DrawingResult, oracleName: string, style: 'guidance' | 'voyance' | 'cartomancie' = 'voyance'): string {
    const { cards, keywords, question } = result;

    const cardNames = cards.map(c => c.name).join(', ');
    const keywordsStr = keywords.join(', ');

    let prompt = `Tu es ${oracleName}, un oracle mystique.\n\n`;
    
    if (question) {
      prompt += `Question posée: "${question}"\n\n`;
    }

    prompt += `Cartes tirées: ${cardNames}\n`;
    prompt += `Mots-clés: ${keywordsStr}\n\n`;

    switch (style) {
      case 'guidance':
        prompt += `Fournis une guidance spirituelle basée sur ces mots-clés. `;
        break;
      case 'voyance':
        prompt += `Fournis une lecture de voyance basée sur ces mots-clés. `;
        break;
      case 'cartomancie':
        prompt += `Fournis une interprétation de cartomancie basée sur ces mots-clés. `;
        break;
    }

    prompt += `Ta réponse doit être claire et fluide, ni trop précise ni trop vague. `;
    prompt += `Laisse place à l'interprétation personnelle. `;
    prompt += `Fusionne les mots-clés de manière cohérente pour répondre à la question. `;
    prompt += `Maximum 150 mots.`;

    return prompt;
  }
}
