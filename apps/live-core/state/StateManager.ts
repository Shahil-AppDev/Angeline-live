import { LiveState } from '@angeline-live/shared';
import * as fs from 'fs';

export class StateManager {
  private state: LiveState;
  private stateFilePath?: string;

  constructor(stateFilePath?: string) {
    this.stateFilePath = stateFilePath;
    
    this.state = {
      isActive: false,
      mode: 'AUTO',
      stats: {
        totalReadings: 0,
        totalMessages: 0,
        totalGifts: 0,
        totalFollows: 0
      }
    };

    if (stateFilePath && fs.existsSync(stateFilePath)) {
      this.loadState();
    }
  }

  getState(): LiveState {
    return { ...this.state };
  }

  updateState(updates: Partial<LiveState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  private loadState(): void {
    if (!this.stateFilePath) return;

    try {
      const data = fs.readFileSync(this.stateFilePath, 'utf-8');
      this.state = JSON.parse(data);
      console.log('✅ State loaded from file');
    } catch (error) {
      console.warn('⚠️ Failed to load state, using default');
    }
  }

  private saveState(): void {
    if (!this.stateFilePath) return;

    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('❌ Failed to save state:', error);
    }
  }

  reset(): void {
    this.state = {
      isActive: false,
      mode: 'AUTO',
      stats: {
        totalReadings: 0,
        totalMessages: 0,
        totalGifts: 0,
        totalFollows: 0
      }
    };
    this.saveState();
  }
}
