import { Card, IOBSClient, OBSCommand, ReadingPayload, RevealTiming } from './types';

export class OBSRenderer {
  private pcBridge: IOBSClient | null = null;
  private sourcesMap: any;

  constructor(sourcesMap: any) {
    this.sourcesMap = sourcesMap;
  }

  setPCBridge(pcBridge: IOBSClient): void {
    this.pcBridge = pcBridge;
  }

  private async sendCommand(command: OBSCommand): Promise<void> {
    if (!this.pcBridge) {
      throw new Error('PCBridge not initialized');
    }
    await this.pcBridge.sendOBSCommand(command);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  /**
   * Affiche l'overlay de lecture avec username et question
   */
  async showReadingOverlay(payload: ReadingPayload): Promise<void> {
    console.log(`[OBSRenderer] Showing reading overlay for ${payload.username}`);

    // Changer vers la scène READING_ACTIVE
    await this.sendCommand({
      type: 'SET_SCENE',
      sourceName: '',
      data: { sceneName: 'READING_ACTIVE' },
    });

    // Afficher le nom d'utilisateur
    await this.sendCommand({
      type: 'SET_TEXT',
      sourceName: 'TXT_USERNAME',
      data: { text: `@${payload.username}` },
    });

    await this.sendCommand({
      type: 'SHOW_SOURCE',
      sourceName: 'TXT_USERNAME',
    });

    // Afficher la question
    await this.sendCommand({
      type: 'SET_TEXT',
      sourceName: 'TXT_QUESTION',
      data: { text: payload.question || 'Tirage Oracle Mystica' },
    });

    await this.sendCommand({
      type: 'SHOW_SOURCE',
      sourceName: 'TXT_QUESTION',
    });

    console.log('[OBSRenderer] Reading overlay displayed');
  }

  /**
   * Révèle les cartes séquentiellement avec animations et sons
   */
  async revealCardsSequential(
    cards: Card[],
    timings: RevealTiming = {
      delayBeforeReveal: 500,
      delayBetweenCards: 1200,
      cardAnimationDuration: 800,
    }
  ): Promise<void> {
    console.log(`[OBSRenderer] Revealing ${cards.length} cards sequentially...`);

    // Attendre avant de commencer
    await this.sleep(timings.delayBeforeReveal);

    // Jouer le son de mélange
    await this.sendCommand({
      type: 'PLAY_MEDIA',
      sourceName: 'SFX_SHUFFLE',
    });

    await this.sleep(800);

    // Révéler chaque carte
    for (let i = 0; i < cards.length && i < 3; i++) {
      const card = cards[i];
      const sourceName = `CARD_${i + 1}`;

      console.log(`[OBSRenderer] Revealing card ${i + 1}: ${card.name}`);

      // Jouer le son de retournement
      await this.sendCommand({
        type: 'PLAY_MEDIA',
        sourceName: 'SFX_FLIP',
      });

      // Attendre un peu pour la synchronisation audio
      await this.sleep(100);

      // Définir l'image de la carte
      await this.sendCommand({
        type: 'SET_IMAGE',
        sourceName,
        data: { imagePath: card.imagePath },
      });

      // Afficher la carte
      await this.sendCommand({
        type: 'SHOW_SOURCE',
        sourceName,
      });

      // Attendre la durée de l'animation
      await this.sleep(timings.cardAnimationDuration);

      // Attendre avant la prochaine carte
      if (i < cards.length - 1) {
        await this.sleep(timings.delayBetweenCards - timings.cardAnimationDuration);
      }
    }

    // Effet final après toutes les cartes
    await this.sendCommand({
      type: 'PLAY_MEDIA',
      sourceName: 'SFX_POOF',
    });

    // Afficher brièvement l'effet fumée
    await this.sendCommand({
      type: 'SHOW_SOURCE',
      sourceName: 'FX_SMOKE',
    });

    await this.sleep(1500);

    await this.sendCommand({
      type: 'HIDE_SOURCE',
      sourceName: 'FX_SMOKE',
    });

    console.log('[OBSRenderer] All cards revealed');
  }

  /**
   * Affiche la réponse de l'IA
   */
  async showResponse(response: string): Promise<void> {
    console.log('[OBSRenderer] Showing AI response...');

    await this.sendCommand({
      type: 'SET_TEXT',
      sourceName: 'TXT_RESPONSE',
      data: { text: response },
    });

    await this.sendCommand({
      type: 'SHOW_SOURCE',
      sourceName: 'TXT_RESPONSE',
    });

    console.log('[OBSRenderer] Response displayed');
  }

  /**
   * Workflow complet de tirage
   */
  async performCompleteReading(payload: ReadingPayload): Promise<void> {
    console.log('[OBSRenderer] Starting complete reading workflow...');

    // 1. Afficher l'overlay (username + question)
    await this.showReadingOverlay(payload);

    // 2. Révéler les cartes séquentiellement
    await this.revealCardsSequential(payload.cards);

    // 3. Attendre un peu avant d'afficher la réponse
    await this.sleep(1000);

    // 4. Afficher la réponse
    await this.showResponse(payload.response);

    console.log('[OBSRenderer] Complete reading workflow finished');
  }

  /**
   * Masque une source spécifique
   */
  async hideSource(sourceName: string): Promise<void> {
    await this.sendCommand({
      type: 'HIDE_SOURCE',
      sourceName,
    });
  }

  /**
   * Affiche une source spécifique
   */
  async showSource(sourceName: string): Promise<void> {
    await this.sendCommand({
      type: 'SHOW_SOURCE',
      sourceName,
    });
  }

  /**
   * Change de scène
   */
  async setScene(sceneName: string): Promise<void> {
    await this.sendCommand({
      type: 'SET_SCENE',
      sourceName: '',
      data: { sceneName },
    });
  }
}
