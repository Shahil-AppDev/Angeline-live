import { OpenRouterClient } from '@angeline-live/llm';
import { LLMRequest, LLMResponse } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class ResponseComposer extends EventEmitter {
  private llmClient: OpenRouterClient;

  constructor(llmClient: OpenRouterClient) {
    super();
    this.llmClient = llmClient;
  }

  async compose(systemPrompt: string, userPrompt: string): Promise<string> {
    console.log('🤖 Generating response with LLM...');

    const request: LLMRequest = {
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.8,
      maxTokens: 300
    };

    try {
      const response: LLMResponse = await this.llmClient.generate(request);

      console.log(`✅ Response generated (${response.tokens} tokens)`);

      this.emit('response_generated', {
        response: response.content,
        tokens: response.tokens
      });

      return response.content;
    } catch (error: any) {
      console.error('❌ LLM generation failed:', error.message);
      throw error;
    }
  }

  async testLLM(): Promise<boolean> {
    return await this.llmClient.testConnection();
  }
}
