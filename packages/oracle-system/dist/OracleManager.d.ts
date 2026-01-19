import { OracleConfig } from '@angeline-live/shared';
export declare class OracleManager {
    private oracles;
    private assetsBasePath;
    constructor(oraclesConfigPath: string, assetsBasePath: string);
    private loadOraclesConfig;
    getOracle(oracleId: string): OracleConfig | undefined;
    getAllOracles(): OracleConfig[];
    getOraclesByTheme(theme: string): OracleConfig[];
    getCardPath(oracleId: string, cardNumber: number, type?: 'image' | 'video'): string;
    getBackCardPath(oracleId: string): string;
    getAvailableCards(oracleId: string): number[];
    validateOracleAssets(oracleId: string): {
        valid: boolean;
        missing: string[];
    };
}
