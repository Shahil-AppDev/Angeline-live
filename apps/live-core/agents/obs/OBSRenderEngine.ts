import { OBSController } from '@angeline-live/obs-render';
import { Card } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class OBSRenderEngine extends EventEmitter {
  private obsController: OBSController;

  constructor(obsController: OBSController) {
    super();
    this.obsController = obsController;
  }

  async renderReading(username: string, question: string, cards: Card[], response: string): Promise<void> {
    console.log('🎬 Rendering reading on OBS...');

    try {
      await this.obsController.setPreset('reading_active');

      await this.obsController.updateText('USERNAME_TEXT', `@${username}`);
      await this.obsController.updateText('QUESTION_TEXT', question);

      await this.obsController.revealCards(
        cards[0].image_path,
        cards[1].image_path,
        cards[2].image_path
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.obsController.updateText('ANSWER_TEXT', response);

      console.log('✅ Reading rendered on OBS');

      this.emit('reading_rendered', { username, question, cards, response });
    } catch (error: any) {
      console.error('❌ OBS rendering failed:', error.message);
      throw error;
    }
  }

  async clearReading(): Promise<void> {
    console.log('🧹 Clearing OBS reading...');

    try {
      await this.obsController.setPreset('idle');
      console.log('✅ OBS cleared');
    } catch (error: any) {
      console.error('❌ OBS clear failed:', error.message);
    }
  }

  async testConnection(): Promise<boolean> {
    return this.obsController.isConnected();
  }
}
