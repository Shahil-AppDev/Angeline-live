import { LLMRequest, LLMResponse } from '@angeline-live/shared';
import axios, { AxiosInstance } from 'axios';

export class OpenRouterClient {
  private client: AxiosInstance;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'anthropic/claude-3.5-sonnet') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;

    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://live.angeline-nj.xyz',
        'X-Title': 'Angeline NJ Live',
        'Content-Type': 'application/json'
      }
    });
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages: any[] = [];

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
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error(`LLM generation failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generate({
        prompt: 'Test',
        maxTokens: 10
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
