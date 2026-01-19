import { IntentAnalysisResult } from '@angeline-live/shared';
export declare class TaxonomyLoader {
    private taxonomy;
    constructor(taxonomyPath: string);
    analyzeIntent(message: string): IntentAnalysisResult;
    private checkH0;
    private checkH2;
    private checkH3;
    private getFallbackIntent;
    getOracleForIntent(intentResult: IntentAnalysisResult): string;
}
