import { TaxonomyLoader } from '@angeline-live/intents';
import { IntentAnalysisResult, TikTokMessage } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class IntentAnalyzer extends EventEmitter {
  private taxonomyLoader: TaxonomyLoader;

  constructor(taxonomyPath: string) {
    super();
    this.taxonomyLoader = new TaxonomyLoader(taxonomyPath);
  }

  async analyze(message: TikTokMessage): Promise<IntentAnalysisResult> {
    console.log(`🧠 Analyzing intent for: "${message.message}"`);

    const result = this.taxonomyLoader.analyzeIntent(message.message);

    console.log(`📊 Intent: ${result.intentId} (${result.level}) - Confidence: ${(result.confidence * 100).toFixed(0)}%`);

    this.emit('intent_analyzed', {
      message,
      intent: result
    });

    return result;
  }

  getOracleForIntent(intent: IntentAnalysisResult): string {
    return this.taxonomyLoader.getOracleForIntent(intent);
  }
}
