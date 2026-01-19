"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenRouterClient {
    constructor(apiKey, defaultModel = 'anthropic/claude-3.5-sonnet') {
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.client = axios_1.default.create({
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://live.angeline-nj.xyz',
                'X-Title': 'Angeline NJ Live',
                'Content-Type': 'application/json'
            }
        });
    }
    async generate(request) {
        try {
            const messages = [];
            if (request.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: request.systemPrompt
                });
            }
            messages.push({
                role: 'user',
                content: request.prompt
            });
            const response = await this.client.post('/chat/completions', {
                model: request.model || this.defaultModel,
                messages,
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 500
            });
            const choice = response.data.choices[0];
            return {
                content: choice.message.content,
                tokens: response.data.usage.total_tokens,
                model: response.data.model,
                finishReason: choice.finish_reason
            };
        }
        catch (error) {
            console.error('OpenRouter API Error:', error.response?.data || error.message);
            throw new Error(`LLM generation failed: ${error.message}`);
        }
    }
    async testConnection() {
        try {
            await this.generate({
                prompt: 'Test',
                maxTokens: 10
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.OpenRouterClient = OpenRouterClient;
