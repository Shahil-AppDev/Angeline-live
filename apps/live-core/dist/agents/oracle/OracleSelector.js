"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleSelector = void 0;
const events_1 = require("events");
class OracleSelector extends events_1.EventEmitter {
    constructor(oracleManager) {
        super();
        this.forceMode = false;
        this.oracleManager = oracleManager;
    }
    selectOracle(intent, suggestedOracleId) {
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
    setForceMode(enabled, oracleId) {
        this.forceMode = enabled;
        this.forcedOracleId = oracleId;
        if (enabled && oracleId) {
            console.log(`🔒 Force mode enabled: ${oracleId}`);
        }
        else {
            console.log(`🔓 Force mode disabled`);
        }
    }
    getAvailableOracles() {
        return this.oracleManager.getAllOracles();
    }
    validateOracle(oracleId) {
        return this.oracleManager.validateOracleAssets(oracleId);
    }
}
exports.OracleSelector = OracleSelector;
