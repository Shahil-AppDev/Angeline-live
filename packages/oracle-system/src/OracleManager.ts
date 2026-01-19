import { OracleConfig } from '@angeline-live/shared';
import * as fs from 'fs';
import * as path from 'path';

export class OracleManager {
  private oracles: Map<string, OracleConfig> = new Map();
  private assetsBasePath: string;

  constructor(oraclesConfigPath: string, assetsBasePath: string) {
    this.assetsBasePath = assetsBasePath;
    this.loadOraclesConfig(oraclesConfigPath);
  }

  private loadOraclesConfig(configPath: string): void {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    for (const [key, oracleConfig] of Object.entries(config.oracles)) {
      this.oracles.set(key, oracleConfig as OracleConfig);
    }
  }

  getOracle(oracleId: string): OracleConfig | undefined {
    return this.oracles.get(oracleId);
  }

  getAllOracles(): OracleConfig[] {
    return Array.from(this.oracles.values());
  }

  getOraclesByTheme(theme: string): OracleConfig[] {
    return Array.from(this.oracles.values()).filter(oracle =>
      oracle.themes.includes(theme) || oracle.themes.includes('ALL')
    );
  }

  getCardPath(oracleId: string, cardNumber: number, _type: 'image' | 'video' = 'image'): string {
    const oracle = this.getOracle(oracleId);
    if (!oracle) {
      throw new Error(`Oracle ${oracleId} not found`);
    }

    const fileName = oracle.card_format.naming_convention.replace('{number}', cardNumber.toString().padStart(3, '0'));
    
    return path.join(this.assetsBasePath, oracle.assets_path, fileName);
  }

  getBackCardPath(oracleId: string): string {
    const oracle = this.getOracle(oracleId);
    if (!oracle) {
      throw new Error(`Oracle ${oracleId} not found`);
    }

    return path.join(this.assetsBasePath, oracle.assets_path, 'backs', 'back.png');
  }

  getAvailableCards(oracleId: string): number[] {
    const oracle = this.getOracle(oracleId);
    if (!oracle) {
      throw new Error(`Oracle ${oracleId} not found`);
    }

    const cardsPath = path.join(this.assetsBasePath, oracle.assets_path);
    
    if (!fs.existsSync(cardsPath)) {
      return [];
    }

    const files = fs.readdirSync(cardsPath);
    const cardNumbers: number[] = [];
    
    const namingPattern = oracle.card_format.naming_convention.replace('{number}', '(\\d+)');
    const regex = new RegExp(namingPattern);

    files.forEach(file => {
      const match = file.match(regex);
      if (match) {
        cardNumbers.push(parseInt(match[1], 10));
      }
    });

    return cardNumbers.sort((a, b) => a - b);
  }

  validateOracleAssets(oracleId: string): { valid: boolean; missing: string[] } {
    const oracle = this.getOracle(oracleId);
    if (!oracle) {
      return { valid: false, missing: [`Oracle ${oracleId} not found in config`] };
    }

    const missing: string[] = [];
    const oraclePath = path.join(this.assetsBasePath, oracle.assets_path);

    if (!fs.existsSync(oraclePath)) {
      missing.push(`Oracle directory: ${oraclePath}`);
      return { valid: false, missing };
    }

    const availableCards = this.getAvailableCards(oracleId);
    if (availableCards.length === 0) {
      missing.push(`No cards found in ${oraclePath}`);
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }
}
