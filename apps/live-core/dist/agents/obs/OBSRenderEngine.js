"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSRenderEngine = void 0;
const events_1 = require("events");
class OBSRenderEngine extends events_1.EventEmitter {
    constructor(obsController) {
        super();
        this.obsController = obsController;
    }
    async renderReading(username, question, cards, response) {
        console.log('🎬 Rendering reading on OBS...');
        try {
            await this.obsController.setPreset('reading_active');
            await this.obsController.updateText('USERNAME_TEXT', `@${username}`);
            await this.obsController.updateText('QUESTION_TEXT', question);
            await this.obsController.revealCards(cards[0].image_path, cards[1].image_path, cards[2].image_path);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.obsController.updateText('ANSWER_TEXT', response);
            console.log('✅ Reading rendered on OBS');
            this.emit('reading_rendered', { username, question, cards, response });
        }
        catch (error) {
            console.error('❌ OBS rendering failed:', error.message);
            throw error;
        }
    }
    async clearReading() {
        console.log('🧹 Clearing OBS reading...');
        try {
            await this.obsController.setPreset('idle');
            console.log('✅ OBS cleared');
        }
        catch (error) {
            console.error('❌ OBS clear failed:', error.message);
        }
    }
    async testConnection() {
        return this.obsController.isConnected();
    }
}
exports.OBSRenderEngine = OBSRenderEngine;
