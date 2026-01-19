"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentAnalyzer = void 0;
const intents_1 = require("@angeline-live/intents");
const events_1 = require("events");
class IntentAnalyzer extends events_1.EventEmitter {
    constructor(taxonomyPath) {
        super();
        this.taxonomyLoader = new intents_1.TaxonomyLoader(taxonomyPath);
    }
    async analyze(message) {
        console.log(`🧠 Analyzing intent for: "${message.message}"`);
        const result = this.taxonomyLoader.analyzeIntent(message.message);
        console.log(`📊 Intent: ${result.intentId} (${result.level}) - Confidence: ${(result.confidence * 100).toFixed(0)}%`);
        this.emit('intent_analyzed', {
            message,
            intent: result
        });
        return result;
    }
    getOracleForIntent(intent) {
        return this.taxonomyLoader.getOracleForIntent(intent);
    }
}
exports.IntentAnalyzer = IntentAnalyzer;
