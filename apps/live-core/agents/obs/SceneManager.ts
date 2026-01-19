import { OBSController } from '@angeline-live/obs-render';

export class SceneManager {
  private obsController: OBSController;
  private currentScene: 'idle' | 'reading_active' = 'idle';

  constructor(obsController: OBSController) {
    this.obsController = obsController;
  }

  async switchToIdle(): Promise<void> {
    if (this.currentScene === 'idle') return;

    await this.obsController.setPreset('idle');
    this.currentScene = 'idle';
    console.log('🎬 Switched to IDLE scene');
  }

  async switchToReading(): Promise<void> {
    if (this.currentScene === 'reading_active') return;

    await this.obsController.setPreset('reading_active');
    this.currentScene = 'reading_active';
    console.log('🎬 Switched to READING scene');
  }

  getCurrentScene(): 'idle' | 'reading_active' {
    return this.currentScene;
  }
}
