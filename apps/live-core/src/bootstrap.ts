import path from 'path';
import { OBSRenderer } from '../../../packages/obs-render/src/OBSRenderer';
import { ManifestValidator } from '../../../packages/oracle-system/src/ManifestValidator';
import { config, isProductionMode } from './config';
import { PCBridgeClient } from './services/PCBridgeClient';

export class LiveCoreBootstrap {
  private pcBridgeClient: PCBridgeClient | null = null;
  private obsRenderer: OBSRenderer | null = null;

  async initialize(): Promise<void> {
    console.log(`[Bootstrap] Initializing Live Core in ${config.mode} mode...`);

    // 1. Valider les manifests oracle
    await this.validateOracleManifests();

    // 2. Initialiser la connexion selon le mode
    if (isProductionMode()) {
      await this.initializeProductionMode();
    } else {
      await this.initializeDevelopmentMode();
    }

    console.log('[Bootstrap] Live Core initialized successfully');
  }

  private async validateOracleManifests(): Promise<void> {
    console.log('[Bootstrap] Validating oracle manifests...');

    const basePath = path.resolve(__dirname, '../../../');
    const oraclesConfigPath = path.join(basePath, config.paths.oraclesConfig);

    const validator = new ManifestValidator(basePath);

    try {
      validator.validateOrThrow(oraclesConfigPath);
      console.log('[Bootstrap] ✅ All oracle manifests are valid');
    } catch (error) {
      console.error('[Bootstrap] ❌ Oracle manifest validation failed');
      throw error;
    }
  }

  private async initializeProductionMode(): Promise<void> {
    console.log('[Bootstrap] Initializing PRODUCTION mode (PC Bridge)...');

    if (!config.pcBridge.url || !config.pcBridge.token) {
      throw new Error('PC_BRIDGE_URL and PC_BRIDGE_TOKEN must be set in production mode');
    }

    // Créer le client PC Bridge
    this.pcBridgeClient = new PCBridgeClient(
      config.pcBridge.url,
      config.pcBridge.token
    );

    // Connecter au PC Bridge
    await this.pcBridgeClient.connect();

    // Initialiser OBSRenderer avec le PC Bridge
    const sourcesMapPath = path.resolve(__dirname, '../../../', config.paths.sourcesMap);
    const sourcesMap = require(sourcesMapPath);
    
    this.obsRenderer = new OBSRenderer(sourcesMap);
    this.obsRenderer.setPCBridge(this.pcBridgeClient);

    // Écouter les événements TikFinity
    this.pcBridgeClient.on('tikfinity:event', (event) => {
      console.log(`[Bootstrap] TikFinity event: ${event.type} from ${event.username}`);
      // TODO: Traiter l'événement (détection commandes, tirages, etc.)
    });

    console.log('[Bootstrap] ✅ Production mode initialized (connected to PC Bridge)');
  }

  private async initializeDevelopmentMode(): Promise<void> {
    console.log('[Bootstrap] Initializing DEVELOPMENT mode (direct connections)...');

    // En mode dev, connexions directes à OBS et TikFinity
    // TODO: Implémenter connexions directes si nécessaire
    console.log('[Bootstrap] ⚠️  Development mode: direct connections not yet implemented');
    console.log('[Bootstrap] ℹ️  Use MODE=production with PC Bridge for full functionality');
  }

  getPCBridgeClient(): PCBridgeClient | null {
    return this.pcBridgeClient;
  }

  getOBSRenderer(): OBSRenderer | null {
    return this.obsRenderer;
  }

  async shutdown(): Promise<void> {
    console.log('[Bootstrap] Shutting down Live Core...');

    if (this.pcBridgeClient) {
      this.pcBridgeClient.disconnect();
    }

    console.log('[Bootstrap] Live Core shut down');
  }
}
