"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleAgent = void 0;
class StyleAgent {
    constructor() {
        this.maxLength = 280;
    }
    applyStyle(response, username) {
        let styled = response.trim();
        styled = this.ensureMaxLength(styled);
        styled = this.addPersonalization(styled, username);
        styled = this.cleanupFormatting(styled);
        return styled;
    }
    ensureMaxLength(text) {
        if (text.length <= this.maxLength) {
            return text;
        }
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        let result = '';
        for (const sentence of sentences) {
            const withSentence = result + sentence.trim() + '. ';
            if (withSentence.length > this.maxLength) {
                break;
            }
            result = withSentence;
        }
        return result.trim() || text.substring(0, this.maxLength - 3) + '...';
    }
    addPersonalization(text, username) {
        if (!text.toLowerCase().includes(username.toLowerCase()) &&
            !text.startsWith('@')) {
            return `@${username} ${text}`;
        }
        return text;
    }
    cleanupFormatting(text) {
        text = text.replace(/\*\*/g, '');
        text = text.replace(/\*/g, '');
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/\s{2,}/g, ' ');
        return text.trim();
    }
    validateResponse(response) {
        if (!response || response.trim().length === 0) {
            return { valid: false, reason: 'Empty response' };
        }
        if (response.length < 10) {
            return { valid: false, reason: 'Response too short' };
        }
        if (response.length > 500) {
            return { valid: false, reason: 'Response too long' };
        }
        return { valid: true };
    }
}
exports.StyleAgent = StyleAgent;
