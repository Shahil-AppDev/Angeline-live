"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
class SceneManager {
    constructor(obsController) {
        this.currentScene = 'idle';
        this.obsController = obsController;
    }
    async switchToIdle() {
        if (this.currentScene === 'idle')
            return;
        await this.obsController.setPreset('idle');
        this.currentScene = 'idle';
        console.log('🎬 Switched to IDLE scene');
    }
    async switchToReading() {
        if (this.currentScene === 'reading_active')
            return;
        await this.obsController.setPreset('reading_active');
        this.currentScene = 'reading_active';
        console.log('🎬 Switched to READING scene');
    }
    getCurrentScene() {
        return this.currentScene;
    }
}
exports.SceneManager = SceneManager;
