"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyLoader = void 0;
const shared_1 = require("@angeline-live/shared");
const fs = __importStar(require("fs"));
class TaxonomyLoader {
    constructor(taxonomyPath) {
        this.taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
    }
    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        const h0Result = this.checkH0(lowerMessage);
        if (h0Result)
            return h0Result;
        const h3Result = this.checkH3(lowerMessage);
        if (h3Result)
            return h3Result;
        const h2Result = this.checkH2(lowerMessage);
        if (h2Result)
            return h2Result;
        return this.getFallbackIntent(lowerMessage);
    }
    checkH0(message) {
        const h0Intents = this.taxonomy.hierarchy.H0.intents;
        for (const intent of h0Intents) {
            const matchedKeywords = intent.keywords.filter((kw) => message.includes(kw.toLowerCase()));
            if (matchedKeywords.length > 0) {
                return {
                    level: shared_1.IntentLevel.H0,
                    intentId: intent.id,
                    confidence: matchedKeywords.length / intent.keywords.length,
                    keywords: matchedKeywords,
                    rawMessage: message
                };
            }
        }
        return null;
    }
    checkH2(message) {
        const axes = this.taxonomy.hierarchy.H2.axes;
        for (const [axisName, axisData] of Object.entries(axes)) {
            const matchedKeywords = axisData.keywords.filter((kw) => message.includes(kw.toLowerCase()));
            if (matchedKeywords.length > 0) {
                return {
                    level: shared_1.IntentLevel.H2,
                    intentId: `H2_${axisName}`,
                    axis: axisName,
                    confidence: matchedKeywords.length / axisData.keywords.length,
                    keywords: matchedKeywords,
                    rawMessage: message
                };
            }
        }
        return null;
    }
    checkH3(message) {
        const axes = this.taxonomy.hierarchy.H2.axes;
        for (const [axisName, axisData] of Object.entries(axes)) {
            if (!axisData.H3_intents)
                continue;
            for (const intent of axisData.H3_intents) {
                const matchedKeywords = intent.keywords.filter((kw) => message.includes(kw.toLowerCase()));
                if (matchedKeywords.length > 0) {
                    return {
                        level: shared_1.IntentLevel.H3,
                        intentId: intent.id,
                        axis: axisName,
                        confidence: matchedKeywords.length / intent.keywords.length,
                        keywords: matchedKeywords,
                        rawMessage: message
                    };
                }
            }
        }
        return null;
    }
    getFallbackIntent(message) {
        return {
            level: shared_1.IntentLevel.H1,
            intentId: this.taxonomy.fallback.default_intent,
            confidence: 0.5,
            keywords: [],
            rawMessage: message
        };
    }
    getOracleForIntent(intentResult) {
        if (intentResult.level === shared_1.IntentLevel.H3) {
            const axes = this.taxonomy.hierarchy.H2.axes;
            const axisData = axes[intentResult.axis];
            if (axisData && axisData.H3_intents) {
                const intent = axisData.H3_intents.find((i) => i.id === intentResult.intentId);
                if (intent && intent.oracle) {
                    return intent.oracle;
                }
            }
        }
        if (intentResult.level === shared_1.IntentLevel.H2 && intentResult.axis) {
            const axes = this.taxonomy.hierarchy.H2.axes;
            const axisData = axes[intentResult.axis];
            if (axisData && axisData.oracle_mapping) {
                return axisData.oracle_mapping.primary;
            }
        }
        return this.taxonomy.fallback.default_oracle;
    }
}
exports.TaxonomyLoader = TaxonomyLoader;
