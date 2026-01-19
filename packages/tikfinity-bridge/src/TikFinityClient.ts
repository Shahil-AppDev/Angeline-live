import { TikTokMessage } from '@angeline-live/shared';
import { EventEmitter } from 'events';
import express, { Express, Request, Response } from 'express';

export class TikFinityClient extends EventEmitter {
  private apiKey: string;
  private webhookSecret: string;
  private webhookServer?: Express;
  private webhookPort: number;

  constructor(apiKey: string, webhookSecret: string, webhookPort: number = 3002) {
    super();
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.webhookPort = webhookPort;
  }

  startWebhookServer(): void {
    this.webhookServer = express();
    this.webhookServer.use(express.json());

    this.webhookServer.post('/webhook/tiktok', (req: Request, res: Response) => {
      this.handleWebhook(req, res);
    });

    this.webhookServer.listen(this.webhookPort, () => {
      console.log(`✅ TikFinity webhook server listening on port ${this.webhookPort}`);
    });
  }

  private handleWebhook(req: Request, res: Response): void {
    const signature = req.headers['x-tikfinity-signature'] as string;

    if (!this.verifySignature(signature, JSON.stringify(req.body))) {
      res.status(401).send('Invalid signature');
      return;
    }

    const event = req.body;

    switch (event.type) {
      case 'chat':
        this.handleChatMessage(event.data);
        break;
      case 'gift':
        this.handleGift(event.data);
        break;
      case 'follow':
        this.handleFollow(event.data);
        break;
      case 'share':
        this.handleShare(event.data);
        break;
      case 'like':
        this.handleLike(event.data);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }

    res.status(200).send('OK');
  }

  private verifySignature(signature: string, payload: string): boolean {
    return true;
  }

  private handleChatMessage(data: any): void {
    const message: TikTokMessage = {
      username: data.username || data.nickname,
      message: data.comment || data.message,
      timestamp: Date.now(),
      userId: data.userId || data.user_id,
      isGift: false,
      isFollow: false
    };

    this.emit('chat', message);
  }

  private handleGift(data: any): void {
    const message: TikTokMessage = {
      username: data.username || data.nickname,
      message: `Sent ${data.giftName}`,
      timestamp: Date.now(),
      userId: data.userId || data.user_id,
      isGift: true,
      giftName: data.giftName || data.gift_name,
      isFollow: false
    };

    this.emit('gift', message);
  }

  private handleFollow(data: any): void {
    const message: TikTokMessage = {
      username: data.username || data.nickname,
      message: 'Followed',
      timestamp: Date.now(),
      userId: data.userId || data.user_id,
      isGift: false,
      isFollow: true
    };

    this.emit('follow', message);
  }

  private handleShare(data: any): void {
    this.emit('share', data);
  }

  private handleLike(data: any): void {
    this.emit('like', data);
  }

  async sendChatMessage(message: string): Promise<void> {
    console.log('📤 Sending chat message:', message);
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  stop(): void {
    if (this.webhookServer) {
      console.log('🔌 Stopping TikFinity webhook server');
    }
  }
}
