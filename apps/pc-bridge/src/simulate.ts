import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { SimulateEvent } from './types';
import { logger } from './utils/logger';

const SIMULATE_FILE = process.env.SIMULATE_FILE || './data/events.jsonl';
const SERVER_PORT = parseInt(process.env.SIMULATE_PORT || '21213', 10);

class TikFinitySimulator {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private events: SimulateEvent[] = [];

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer);
    this.loadEvents();
  }

  private loadEvents(): void {
    try {
      const content = fs.readFileSync(SIMULATE_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      this.events = lines.map(line => JSON.parse(line) as SimulateEvent);
      logger.info(`[Simulator] Loaded ${this.events.length} events from ${SIMULATE_FILE}`);
    } catch (error) {
      logger.error('[Simulator] Failed to load events:', error);
      this.events = this.generateSampleEvents();
      logger.info('[Simulator] Using sample events');
    }
  }

  private generateSampleEvents(): SimulateEvent[] {
    return [
      {
        delay: 1000,
        event: {
          type: 'CHAT_MESSAGE',
          timestamp: Date.now(),
          user: { id: '1', username: 'user1', nickname: 'Alice' },
          data: { message: '!oracle' },
        },
      },
      {
        delay: 3000,
        event: {
          type: 'CHAT_MESSAGE',
          timestamp: Date.now(),
          user: { id: '2', username: 'user2', nickname: 'Bob' },
          data: { message: 'Quelle est ma destinée amoureuse ?' },
        },
      },
      {
        delay: 5000,
        event: {
          type: 'GIFT',
          timestamp: Date.now(),
          user: { id: '3', username: 'user3', nickname: 'Charlie' },
          data: { giftId: 5655, giftName: 'Rose', giftCount: 1, diamondCost: 1 },
        },
      },
      {
        delay: 8000,
        event: {
          type: 'FOLLOW',
          timestamp: Date.now(),
          user: { id: '4', username: 'user4', nickname: 'Diana' },
        },
      },
    ];
  }

  start(): void {
    this.io.on('connection', (socket) => {
      logger.info(`[Simulator] Client connected: ${socket.id}`);

      socket.on('ping', () => {
        socket.emit('pong');
      });

      this.playEvents(socket);

      socket.on('disconnect', () => {
        logger.info(`[Simulator] Client disconnected: ${socket.id}`);
      });
    });

    this.httpServer.listen(SERVER_PORT, () => {
      logger.info(`[Simulator] TikFinity simulator listening on ws://localhost:${SERVER_PORT}`);
      logger.info(`[Simulator] Ready to simulate ${this.events.length} events`);
    });
  }

  private async playEvents(socket: any): Promise<void> {
    for (const { delay, event } of this.events) {
      await this.sleep(delay);
      logger.info(`[Simulator] Sending event: ${event.type} from ${event.user.nickname}`);
      socket.emit('message', JSON.stringify(event));
    }
    logger.info('[Simulator] All events sent');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const simulator = new TikFinitySimulator();
simulator.start();
