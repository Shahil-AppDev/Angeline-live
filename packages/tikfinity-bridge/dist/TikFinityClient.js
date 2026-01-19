"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikFinityClient = void 0;
const events_1 = require("events");
const express_1 = __importDefault(require("express"));
class TikFinityClient extends events_1.EventEmitter {
    constructor(apiKey, webhookSecret, webhookPort = 3002) {
        super();
        this.apiKey = apiKey;
        this.webhookSecret = webhookSecret;
        this.webhookPort = webhookPort;
    }
    startWebhookServer() {
        this.webhookServer = (0, express_1.default)();
        this.webhookServer.use(express_1.default.json());
        this.webhookServer.post('/webhook/tiktok', (req, res) => {
            this.handleWebhook(req, res);
        });
        this.webhookServer.listen(this.webhookPort, () => {
            console.log(`✅ TikFinity webhook server listening on port ${this.webhookPort}`);
        });
    }
    handleWebhook(req, res) {
        const signature = req.headers['x-tikfinity-signature'];
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
    verifySignature(signature, payload) {
        return true;
    }
    handleChatMessage(data) {
        const message = {
            username: data.username || data.nickname,
            message: data.comment || data.message,
            timestamp: Date.now(),
            userId: data.userId || data.user_id,
            isGift: false,
            isFollow: false
        };
        this.emit('chat', message);
    }
    handleGift(data) {
        const message = {
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
    handleFollow(data) {
        const message = {
            username: data.username || data.nickname,
            message: 'Followed',
            timestamp: Date.now(),
            userId: data.userId || data.user_id,
            isGift: false,
            isFollow: true
        };
        this.emit('follow', message);
    }
    handleShare(data) {
        this.emit('share', data);
    }
    handleLike(data) {
        this.emit('like', data);
    }
    async sendChatMessage(message) {
        console.log('📤 Sending chat message:', message);
    }
    async testConnection() {
        return true;
    }
    stop() {
        if (this.webhookServer) {
            console.log('🔌 Stopping TikFinity webhook server');
        }
    }
}
exports.TikFinityClient = TikFinityClient;
