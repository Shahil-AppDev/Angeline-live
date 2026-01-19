"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseComposer = void 0;
const events_1 = require("events");
class ResponseComposer extends events_1.EventEmitter {
    constructor(llmClient) {
        super();
        this.llmClient = llmClient;
    }
    async compose(systemPrompt, userPrompt) {
        console.log('🤖 Generating response with LLM...');
        const request = {
            prompt: userPrompt,
            systemPrompt,
            temperature: 0.8,
            maxTokens: 300
        };
        try {
            const response = await this.llmClient.generate(request);
            console.log(`✅ Response generated (${response.tokens} tokens)`);
            this.emit('response_generated', {
                response: response.content,
                tokens: response.tokens
            });
            return response.content;
        }
        catch (error) {
            console.error('❌ LLM generation failed:', error.message);
            throw error;
        }
    }
    async testLLM() {
        return await this.llmClient.testConnection();
    }
}
exports.ResponseComposer = ResponseComposer;
