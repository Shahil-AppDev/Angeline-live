import { OracleManager } from '@angeline-live/oracle-system';
import { IntentAnalysisResult, OracleConfig } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class OracleSelector extends EventEmitter {
  private oracleManager: OracleManager;
  private forceMode: boolean = false;
  private forcedOracleId?: string;

  constructor(oracleManager: OracleManager) {
    super();
    this.oracleManager = oracleManager;
  }

  selectOracle(intent: IntentAnalysisResult, suggestedOracleId?: string): OracleConfig {
    if (this.forceMode && this.forcedOracleId) {
      const oracle = this.oracleManager.getOracle(this.forcedOracleId);
      if (oracle) {
        console.log(`🔒 Force mode: Using ${oracle.name}`);
        return oracle;
      }
    }

    let oracleId = suggestedOracleId;

    if (!oracleId) {
      oracleId = 'ORACLE_STANDARD';
    }

    let oracle = this.oracleManager.getOracle(oracleId);

    if (!oracle) {
      console.warn(`⚠️ Oracle ${oracleId} not found, using fallback`);
      oracle = this.oracleManager.getOracle('ORACLE_STANDARD');
    }

    if (!oracle) {
      throw new Error('No oracle available');
    }

    console.log(`🔮 Selected oracle: ${oracle.name} (${oracle.id})`);

    this.emit('oracle_selected', {
      intent,
      oracle
    });

    return oracle;
  }

  setForceMode(enabled: boolean, oracleId?: string): void {
    this.forceMode = enabled;
    this.forcedOracleId = oracleId;

    if (enabled && oracleId) {
      console.log(`🔒 Force mode enabled: ${oracleId}`);
    } else {
      console.log(`🔓 Force mode disabled`);
    }
  }

  getAvailableOracles(): OracleConfig[] {
    return this.oracleManager.getAllOracles();
  }

  validateOracle(oracleId: string): { valid: boolean; missing: string[] } {
    return this.oracleManager.validateOracleAssets(oracleId);
  }
}
