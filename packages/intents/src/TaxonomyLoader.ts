import { IntentAnalysisResult, IntentAxis, IntentLevel } from '@angeline-live/shared';
import * as fs from 'fs';

interface TaxonomyConfig {
  version: string;
  hierarchy: {
    H0: any;
    H1: any;
    H2: {
      axes: Record<string, any>;
    };
  };
  fallback: {
    default_oracle: string;
    default_intent: string;
  };
}

export class TaxonomyLoader {
  private taxonomy: TaxonomyConfig;

  constructor(taxonomyPath: string) {
    this.taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
  }

  analyzeIntent(message: string): IntentAnalysisResult {
    const lowerMessage = message.toLowerCase();

    const h0Result = this.checkH0(lowerMessage);
    if (h0Result) return h0Result;

    const h3Result = this.checkH3(lowerMessage);
    if (h3Result) return h3Result;

    const h2Result = this.checkH2(lowerMessage);
    if (h2Result) return h2Result;

    return this.getFallbackIntent(lowerMessage);
  }

  private checkH0(message: string): IntentAnalysisResult | null {
    const h0Intents = this.taxonomy.hierarchy.H0.intents;

    for (const intent of h0Intents) {
      const matchedKeywords = intent.keywords.filter((kw: string) =>
        message.includes(kw.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        return {
          level: IntentLevel.H0,
          intentId: intent.id,
          confidence: matchedKeywords.length / intent.keywords.length,
          keywords: matchedKeywords,
          rawMessage: message
        };
      }
    }

    return null;
  }

  private checkH2(message: string): IntentAnalysisResult | null {
    const axes = this.taxonomy.hierarchy.H2.axes;

    for (const [axisName, axisData] of Object.entries(axes)) {
      const matchedKeywords = axisData.keywords.filter((kw: string) =>
        message.includes(kw.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        return {
          level: IntentLevel.H2,
          intentId: `H2_${axisName}`,
          axis: axisName as IntentAxis,
          confidence: matchedKeywords.length / axisData.keywords.length,
          keywords: matchedKeywords,
          rawMessage: message
        };
      }
    }

    return null;
  }

  private checkH3(message: string): IntentAnalysisResult | null {
    const axes = this.taxonomy.hierarchy.H2.axes;

    for (const [axisName, axisData] of Object.entries(axes)) {
      if (!axisData.H3_intents) continue;

      for (const intent of axisData.H3_intents) {
        const matchedKeywords = intent.keywords.filter((kw: string) =>
          message.includes(kw.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
          return {
            level: IntentLevel.H3,
            intentId: intent.id,
            axis: axisName as IntentAxis,
            confidence: matchedKeywords.length / intent.keywords.length,
            keywords: matchedKeywords,
            rawMessage: message
          };
        }
      }
    }

    return null;
  }

  private getFallbackIntent(message: string): IntentAnalysisResult {
    return {
      level: IntentLevel.H1,
      intentId: this.taxonomy.fallback.default_intent,
      confidence: 0.5,
      keywords: [],
      rawMessage: message
    };
  }

  getOracleForIntent(intentResult: IntentAnalysisResult): string {
    if (intentResult.level === IntentLevel.H3) {
      const axes = this.taxonomy.hierarchy.H2.axes;
      const axisData = axes[intentResult.axis!];
      
      if (axisData && axisData.H3_intents) {
        const intent = axisData.H3_intents.find((i: any) => i.id === intentResult.intentId);
        if (intent && intent.oracle) {
          return intent.oracle;
        }
      }
    }

    if (intentResult.level === IntentLevel.H2 && intentResult.axis) {
      const axes = this.taxonomy.hierarchy.H2.axes;
      const axisData = axes[intentResult.axis];
      
      if (axisData && axisData.oracle_mapping) {
        return axisData.oracle_mapping.primary;
      }
    }

    return this.taxonomy.fallback.default_oracle;
  }
}
