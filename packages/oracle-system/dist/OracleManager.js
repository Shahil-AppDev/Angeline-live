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
exports.OracleManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class OracleManager {
    constructor(oraclesConfigPath, assetsBasePath) {
        this.oracles = new Map();
        this.assetsBasePath = assetsBasePath;
        this.loadOraclesConfig(oraclesConfigPath);
    }
    loadOraclesConfig(configPath) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        for (const [key, oracleConfig] of Object.entries(config.oracles)) {
            this.oracles.set(key, oracleConfig);
        }
    }
    getOracle(oracleId) {
        return this.oracles.get(oracleId);
    }
    getAllOracles() {
        return Array.from(this.oracles.values());
    }
    getOraclesByTheme(theme) {
        return Array.from(this.oracles.values()).filter(oracle => oracle.themes.includes(theme) || oracle.themes.includes('ALL'));
    }
    getCardPath(oracleId, cardNumber, type = 'image') {
        const oracle = this.getOracle(oracleId);
        if (!oracle) {
            throw new Error(`Oracle ${oracleId} not found`);
        }
        const fileName = oracle.card_format.naming_convention.replace('{number}', cardNumber.toString().padStart(2, '0'));
        const subPath = type === 'image' ? 'cards/images' : 'cards/videos';
        return path.join(this.assetsBasePath, oracle.assets_path, subPath, fileName);
    }
    getBackCardPath(oracleId) {
        const oracle = this.getOracle(oracleId);
        if (!oracle) {
            throw new Error(`Oracle ${oracleId} not found`);
        }
        return path.join(this.assetsBasePath, oracle.assets_path, 'backs', 'back.png');
    }
    getAvailableCards(oracleId) {
        const oracle = this.getOracle(oracleId);
        if (!oracle) {
            throw new Error(`Oracle ${oracleId} not found`);
        }
        const cardsPath = path.join(this.assetsBasePath, oracle.assets_path, 'cards/images');
        if (!fs.existsSync(cardsPath)) {
            return [];
        }
        const files = fs.readdirSync(cardsPath);
        const cardNumbers = [];
        files.forEach(file => {
            const match = file.match(/card_(\d+)\./);
            if (match) {
                cardNumbers.push(parseInt(match[1], 10));
            }
        });
        return cardNumbers.sort((a, b) => a - b);
    }
    validateOracleAssets(oracleId) {
        const oracle = this.getOracle(oracleId);
        if (!oracle) {
            return { valid: false, missing: [`Oracle ${oracleId} not found in config`] };
        }
        const missing = [];
        const oraclePath = path.join(this.assetsBasePath, oracle.assets_path);
        if (!fs.existsSync(oraclePath)) {
            missing.push(`Oracle directory: ${oraclePath}`);
            return { valid: false, missing };
        }
        const requiredDirs = ['cards/images', 'backs'];
        requiredDirs.forEach(dir => {
            const dirPath = path.join(oraclePath, dir);
            if (!fs.existsSync(dirPath)) {
                missing.push(`Directory: ${dirPath}`);
            }
        });
        const availableCards = this.getAvailableCards(oracleId);
        if (availableCards.length === 0) {
            missing.push(`No cards found in ${path.join(oraclePath, 'cards/images')}`);
        }
        return {
            valid: missing.length === 0,
            missing
        };
    }
}
exports.OracleManager = OracleManager;
