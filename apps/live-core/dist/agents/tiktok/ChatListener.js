"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatListener = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const fs = require('fs');
const path = require('path');
class ChatListener extends events_1.EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.ws = null;
        this.reconnectTimeout = null;
        this.TIKFINITY_WS_URL = 'ws://localhost:21213/';
        this.SOUNDS_DIR = path.join(__dirname, '../../../../assets/sounds');
        this.ensureSoundsDirectory();
    }
    ensureSoundsDirectory() {
        if (!fs.existsSync(this.SOUNDS_DIR)) {
            fs.mkdirSync(this.SOUNDS_DIR, { recursive: true });
            console.log(`📁 Created sounds directory: ${this.SOUNDS_DIR}`);
        }
    }
    playSound(soundName) {
        try {
            const soundFile = path.join(this.SOUNDS_DIR, `${soundName}.mp3`);
            if (fs.existsSync(soundFile)) {
                // Use a simple sound player - you'll need to install a package
                console.log(`🔊 Playing sound: ${soundName}`);
                // For now, just log - you can add actual sound player later
                // Example: require('play-sound')(soundFile);
            }
            else {
                console.warn(`⚠️ Sound file not found: ${soundFile}`);
            }
        }
        catch (error) {
            console.error(`❌ Error playing sound ${soundName}:`, error);
        }
    }
    start() {
        this.isActive = true;
        this.connectToTikFinity();
        console.log('✅ ChatListener started - Connecting to TikFinity...');
    }
    stop() {
        this.isActive = false;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        console.log('🛑 ChatListener stopped');
    }
    connectToTikFinity() {
        if (!this.isActive)
            return;
        try {
            this.ws = new ws_1.default(this.TIKFINITY_WS_URL);
            this.ws.on('open', () => {
                console.log('✅ Connected to TikFinity WebSocket');
                this.emit('connected');
            });
            this.ws.on('message', (data) => {
                try {
                    const event = JSON.parse(data.toString());
                    this.handleTikFinityEvent(event);
                }
                catch (error) {
                    console.error('❌ Failed to parse TikFinity event:', error);
                }
            });
            this.ws.on('error', (error) => {
                console.error('❌ TikFinity WebSocket error:', error.message);
                this.emit('error', error);
            });
            this.ws.on('close', () => {
                console.log('🔌 TikFinity WebSocket disconnected');
                this.ws = null;
                if (this.isActive) {
                    console.log('🔄 Reconnecting to TikFinity in 5 seconds...');
                    this.reconnectTimeout = setTimeout(() => {
                        this.connectToTikFinity();
                    }, 5000);
                }
            });
        }
        catch (error) {
            console.error('❌ Failed to connect to TikFinity:', error);
            if (this.isActive) {
                this.reconnectTimeout = setTimeout(() => {
                    this.connectToTikFinity();
                }, 5000);
            }
        }
    }
    handleTikFinityEvent(event) {
        if (!this.isActive)
            return;
        console.log(`📨 TikFinity Event: ${event.event}`, event.data);
        switch (event.event) {
            case 'chat':
                this.handleChatEvent(event.data);
                break;
            case 'gift':
                this.handleGiftEvent(event.data);
                break;
            case 'follow':
                this.handleFollowEvent(event.data);
                break;
            case 'share':
                this.handleShareEvent(event.data);
                break;
            case 'like':
                this.handleLikeEvent(event.data);
                break;
            case 'roomUser':
                this.handleRoomUserEvent(event.data);
                break;
            case 'subscribe':
                this.handleSubscribeEvent(event.data);
                break;
            default:
                console.log(`⚠️ Unknown TikFinity event: ${event.event}`);
        }
    }
    handleChatEvent(data) {
        const message = {
            username: data.uniqueId || data.nickname || 'Unknown',
            message: data.comment || '',
            userId: data.userId || data.uniqueId || '',
            timestamp: Date.now(),
            isGift: false,
            isFollow: false
        };
        console.log(`💬 [${message.username}]: ${message.message}`);
        this.emit('chat_message', message);
    }
    handleGiftEvent(data) {
        const giftMessage = {
            username: data.uniqueId || data.nickname || 'Unknown',
            message: `Sent ${data.giftName || 'a gift'} x${data.repeatCount || 1}`,
            userId: data.userId || data.uniqueId || '',
            timestamp: Date.now(),
            isGift: true,
            isFollow: false,
            giftId: data.giftId,
            giftName: data.giftName,
            repeatCount: data.repeatCount || 1,
            repeatEnd: data.repeatEnd || false
        };
        console.log(`🎁 [${giftMessage.username}]: ${giftMessage.message}`);
        // Vérifier si c'est le cadeau "Shell Energy" pour prioriser (réponse suivante)
        if (data.giftName && data.giftName.toLowerCase().includes('shell energy')) {
            console.log(`⚡ PRIORITY GIFT: Shell Energy sent by ${giftMessage.username} - Next to answer!`);
            this.playSound('shell-energy');
            this.emit('priority_gift', {
                ...giftMessage,
                priority: true,
                giftType: 'shell_energy'
            });
        }
        // Vérifier si c'est le cadeau "Heart Me" pour autoriser les questions
        else if (data.giftName && data.giftName.toLowerCase().includes('heart me')) {
            console.log(`❤️ HEART ME GIFT: ${giftMessage.username} sent Heart Me - Questions authorized!`);
            this.playSound('heart-me');
            this.emit('heart_me_gift', {
                ...giftMessage,
                priority: false,
                giftType: 'heart_me'
            });
        }
        // Vérifier si c'est le cadeau "Doughnut" pour mettre en file d'attente
        else if (data.giftName && data.giftName.toLowerCase().includes('doughnut')) {
            console.log(`🍩 DOUGHNUT GIFT: ${giftMessage.username} sent doughnut - Question queued!`);
            this.playSound('doughnut');
            this.emit('queued_gift', {
                ...giftMessage,
                priority: false,
                giftType: 'doughnut'
            });
        }
        this.emit('gift', giftMessage);
    }
    handleFollowEvent(data) {
        const followMessage = {
            username: data.uniqueId || data.nickname || 'Unknown',
            message: 'Started following',
            userId: data.userId || data.uniqueId || '',
            timestamp: Date.now(),
            isGift: false,
            isFollow: true
        };
        console.log(`👤 [${followMessage.username}]: New follower!`);
        this.emit('follow', followMessage);
    }
    handleShareEvent(data) {
        console.log(`🔗 [${data.uniqueId || 'Unknown'}]: Shared the stream`);
        this.emit('share', data);
    }
    handleLikeEvent(data) {
        console.log(`❤️ [${data.uniqueId || 'Unknown'}]: Sent ${data.likeCount || 1} likes`);
        this.emit('like', data);
    }
    handleRoomUserEvent(data) {
        console.log(`👥 Viewer count: ${data.viewerCount || 0}`);
        this.emit('roomUser', data);
    }
    handleSubscribeEvent(data) {
        console.log(`⭐ [${data.uniqueId || 'Unknown'}]: Subscribed!`);
        this.emit('subscribe', data);
    }
    handleMessage(message) {
        if (!this.isActive)
            return;
        if (message.isGift || message.isFollow) {
            return;
        }
        console.log(`💬 [${message.username}]: ${message.message}`);
        this.emit('chat_message', message);
    }
    getStatus() {
        return {
            active: this.isActive,
            connected: this.ws?.readyState === ws_1.default.OPEN
        };
    }
}
exports.ChatListener = ChatListener;
