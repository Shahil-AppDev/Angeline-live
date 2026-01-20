import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { OBSService } from './services/OBSService';
import { TikFinityService } from './services/TikFinityService';
import { BridgeConfig, HealthStatus, OBSCommand } from './types';
import { logger } from './utils/logger';

dotenv.config();

const config: BridgeConfig = {
  tikfinityUrl: process.env.TIKFINITY_URL || 'ws://localhost:21213',
  obsUrl: process.env.OBS_URL || 'ws://127.0.0.1:4455',
  obsPassword: process.env.OBS_PASSWORD || '',
  serverPort: parseInt(process.env.SERVER_PORT || '8080', 10),
  authToken: process.env.AUTH_TOKEN || '',
  reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL || '2000', 10),
  maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '10', 10),
  heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10),
  obsCommandRateLimit: parseInt(process.env.OBS_COMMAND_RATE_LIMIT || '100', 10),
};

class PCBridge {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private tikfinity: TikFinityService;
  private obs: OBSService;
  private startTime: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.tikfinity = new TikFinityService(
      config.tikfinityUrl,
      config.maxReconnectAttempts,
      config.reconnectInterval,
      config.heartbeatInterval
    );

    this.obs = new OBSService(
      config.obsUrl,
      config.obsPassword,
      config.obsCommandRateLimit
    );

    this.startTime = Date.now();
    this.setupExpress();
    this.setupSocketIO();
    this.setupEventHandlers();
  }

  private setupExpress(): void {
    this.app.use(express.json());

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: Date.now() - this.startTime,
        tikfinity: this.tikfinity.isConnected(),
        obs: this.obs.isConnected(),
      });
    });

    this.app.get('/status', (req, res) => {
      const status: HealthStatus = {
        tikfinity: this.tikfinity.getStatus(),
        obs: this.obs.getStatus(),
        server: {
          uptime: Date.now() - this.startTime,
          connectedClients: this.io.sockets.sockets.size,
        },
      };
      res.json(status);
    });
  }

  private setupSocketIO(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!config.authToken) {
        logger.warn('[Server] No auth token configured, allowing connection');
        return next();
      }

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        jwt.verify(token, config.authToken);
        next();
      } catch (error) {
        logger.error('[Server] Authentication failed:', error);
        next(new Error('Invalid authentication token'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`[Server] Client connected: ${socket.id}`);

      socket.on('obs:command', async (command: OBSCommand) => {
        try {
          await this.obs.executeCommand(command);
          socket.emit('obs:command:success', { command });
        } catch (error) {
          logger.error('[Server] OBS command error:', error);
          socket.emit('obs:command:error', { command, error: (error as Error).message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`[Server] Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupEventHandlers(): void {
    this.tikfinity.on('event', (event) => {
      logger.debug(`[Bridge] Relaying TikFinity event: ${event.type}`);
      this.io.emit('tikfinity:event', event);
    });

    this.tikfinity.on('maxReconnectReached', () => {
      logger.error('[Bridge] TikFinity max reconnect attempts reached');
      this.io.emit('tikfinity:error', { message: 'Max reconnect attempts reached' });
    });

    this.obs.on('disconnected', () => {
      logger.warn('[Bridge] OBS disconnected');
      this.io.emit('obs:disconnected');
    });
  }

  async start(): Promise<void> {
    try {
      logger.info('[Bridge] Starting PC Bridge...');

      logger.info('[Bridge] Connecting to OBS...');
      await this.obs.connect();

      logger.info('[Bridge] Connecting to TikFinity...');
      await this.tikfinity.connect();

      this.httpServer.listen(config.serverPort, () => {
        logger.info(`[Bridge] Server listening on port ${config.serverPort}`);
        logger.info('[Bridge] PC Bridge started successfully');
      });
    } catch (error) {
      logger.error('[Bridge] Failed to start:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('[Bridge] Stopping PC Bridge...');
    this.tikfinity.disconnect();
    this.obs.disconnect();
    this.io.close();
    this.httpServer.close();
    logger.info('[Bridge] PC Bridge stopped');
  }
}

const bridge = new PCBridge();

bridge.start().catch((error) => {
  logger.error('[Bridge] Fatal error:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('[Bridge] Received SIGINT, shutting down...');
  await bridge.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('[Bridge] Received SIGTERM, shutting down...');
  await bridge.stop();
  process.exit(0);
});
