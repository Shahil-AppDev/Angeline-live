"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCoreOrchestrator = void 0;
const elevenlabs_tts_1 = require("@angeline-live/elevenlabs-tts");
const events_1 = require("events");
const path = __importStar(require("path"));
const tikfinity_1 = require("../../src/bootstrap/tikfinity");
const process_1 = __importDefault(require("process"));
class LiveCoreOrchestrator extends events_1.EventEmitter {
    constructor(agents) {
        super();
        this.tikfinityBridge = null;
        this.ttsEngine = null;
        this.agents = agents;
        this.state = {
            isActive: false,
            mode: 'AUTO',
            stats: {
                totalReadings: 0,
                totalMessages: 0,
                totalGifts: 0,
                totalFollows: 0
            }
        };
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.agents.chatListener.on('chat_message', (msg) => {
            this.handleChatMessage(msg);
        });
        this.agents.giftDetector.on('gift_received', (data) => {
            this.state.stats.totalGifts++;
            this.agents.logger.info(`Gift received: ${data.giftName}`, 'GIFT_DETECTOR');
        });
        this.agents.followAgent.on('new_follow', (data) => {
            this.state.stats.totalFollows++;
            this.agents.logger.info(`New follow: ${data.username}`, 'FOLLOW_AGENT');
        });
        // Handle Shell Energy priority gifts (answered next)
        this.agents.chatListener.on('priority_gift', (data) => {
            this.handlePriorityGift(data);
        });
        // Handle Heart Me gifts (authorize questions after follow)
        this.agents.chatListener.on('heart_me_gift', (data) => {
            this.handleHeartMeGift(data);
        });
        // Handle Doughnut queued gifts (added to queue)
        this.agents.chatListener.on('queued_gift', (data) => {
            this.handleQueuedGift(data);
        });
    }
    async startLive() {
        if (this.state.isActive) {
            throw new Error('Live already active');
        }
        this.agents.logger.info('🚀 Starting live...', 'ORCHESTRATOR');
        // Initialize TTS Engine if API key is provided
        if (process_1.default.env.ELEVENLABS_API_KEY) {
            this.agents.logger.info('Initializing ElevenLabs TTS...', 'ORCHESTRATOR');
            this.ttsEngine = new elevenlabs_tts_1.TTSEngine({
                apiKey: process_1.default.env.ELEVENLABS_API_KEY,
                cacheDir: path.join(__dirname, '../../../cache/tts'),
                defaultVoiceId: process_1.default.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
                autoPlay: true,
                volume: parseInt(process_1.default.env.ELEVENLABS_VOLUME || '80')
            });
            this.ttsEngine.on('tts_started', () => {
                this.agents.logger.info(`TTS: Generating audio...`, 'TTS');
            });
            this.ttsEngine.on('tts_played', () => {
                this.agents.logger.info(`TTS: Playback completed`, 'TTS');
                this.emit('reading_audio_completed');
            });
            this.ttsEngine.on('tts_error', (data) => {
                this.agents.logger.error(`TTS error: ${data.error}`, 'TTS');
            });
            this.agents.logger.info('✅ ElevenLabs TTS initialized', 'ORCHESTRATOR');
        }
        // Start TikFinity Bridge if enabled
        const tikfinityEnabled = process_1.default.env.TIKFINITY_ENABLED === 'true';
        if (tikfinityEnabled) {
            this.agents.logger.info('Starting TikFinity Bridge...', 'ORCHESTRATOR');
            const bridge = new tikfinity_1.TikFinityBootstrap({
                enabled: true,
                wsUrl: process_1.default.env.TIKFINITY_WS_URL || 'ws://localhost:21213',
                simulate: process_1.default.env.TIKFINITY_SIMULATE === 'true',
                simulateFile: process_1.default.env.TIKFINITY_SIMULATE_FILE,
                reconnectEnabled: process_1.default.env.TIKFINITY_RECONNECT_ENABLED !== 'false',
                maxReconnectAttempts: parseInt(process_1.default.env.TIKFINITY_MAX_RECONNECT_ATTEMPTS || '10'),
                heartbeatInterval: parseInt(process_1.default.env.TIKFINITY_HEARTBEAT_INTERVAL || '30000')
            });
            if (bridge) {
                await bridge.start((msg) => {
                    // Route TikFinity events through the same pipeline
                    if (msg.isGift) {
                        this.agents.giftDetector.handleGift(msg);
                    }
                    else if (msg.isFollow) {
                        this.agents.followAgent.handleFollow(msg);
                    }
                    else {
                        this.handleChatMessage(msg);
                    }
                });
                this.tikfinityBridge = bridge;
            }
        }
        else {
            // Fallback to old ChatListener system
            this.agents.chatListener.start();
            this.agents.giftDetector.start();
            this.agents.followAgent.start();
        }
        this.state.isActive = true;
        this.state.stats = {
            totalReadings: 0,
            totalMessages: 0,
            totalGifts: 0,
            totalFollows: 0
        };
        this.agents.logger.info('✅ Live started', 'ORCHESTRATOR');
        this.emit('live_started');
        this.emit('state_changed');
    }
    async stopLive() {
        if (!this.state.isActive) {
            throw new Error('Live not active');
        }
        this.agents.logger.info('🛑 Stopping live...', 'ORCHESTRATOR');
        // Stop TikFinity Bridge if active
        if (this.tikfinityBridge) {
            this.tikfinityBridge.stop();
            this.tikfinityBridge = null;
        }
        else {
            // Stop old system
            this.agents.chatListener.stop();
            this.agents.giftDetector.stop();
            this.agents.followAgent.stop();
        }
        await this.agents.obsRenderEngine.clearReading();
        this.state.isActive = false;
        this.state.currentReading = undefined;
        this.agents.logger.info('✅ Live stopped', 'ORCHESTRATOR');
        this.emit('live_stopped');
        this.emit('state_changed');
    }
    async handleChatMessage(message) {
        if (!this.state.isActive)
            return;
        this.state.stats.totalMessages++;
        this.agents.logger.info(`Processing message from ${message.username}`, 'ORCHESTRATOR');
        const safetyCheck = this.agents.safetyGuard.isSafe(message.message, message.username);
        if (!safetyCheck.safe) {
            this.agents.logger.warn(`Unsafe message blocked: ${safetyCheck.reason}`, 'SAFETY_GUARD');
            return;
        }
        this.agents.contextAgent.addMessage(message);
        // Vérifier si l'utilisateur est autorisé (a suivi + envoyé Heart Me)
        const isAuthorized = this.state.authorizedUsers?.has(message.userId) || false;
        if (!isAuthorized) {
            this.agents.logger.warn(`❌ ${message.username} not authorized - must follow + send Heart Me gift first`, 'ORCHESTRATOR');
            // Émettre un rappel pour l'utilisateur
            this.emit('authorization_required', {
                username: message.username,
                userId: message.userId,
                message: 'Please follow and send a Heart Me gift to ask questions!',
                timestamp: Date.now()
            });
            return;
        }
        try {
            await this.processReading(message);
        }
        catch (error) {
            this.agents.logger.error(`Reading failed: ${error.message}`, 'ORCHESTRATOR');
            this.emit('reading_error', { message, error: error.message });
        }
    }
    async processReading(message) {
        const intent = await this.agents.intentAnalyzer.analyze(message);
        const suggestedOracleId = this.agents.intentAnalyzer.getOracleForIntent(intent);
        const oracle = this.agents.oracleSelector.selectOracle(intent, suggestedOracleId);
        const cards = this.agents.cardDrawEngine.drawCards(oracle, 3);
        const { systemPrompt, userPrompt } = this.agents.promptBuilder.buildPrompt(message.message, cards, oracle, intent, message.username);
        const rawResponse = await this.agents.responseComposer.compose(systemPrompt, userPrompt);
        const styledResponse = this.agents.styleAgent.applyStyle(rawResponse, message.username);
        const validation = this.agents.styleAgent.validateResponse(styledResponse);
        if (!validation.valid) {
            throw new Error(`Invalid response: ${validation.reason}`);
        }
        await this.agents.obsRenderEngine.renderReading(message.username, message.message, cards, styledResponse);
        this.state.currentReading = {
            username: message.username,
            question: message.message,
            cards,
            oracle_id: oracle.id,
            response: styledResponse
        };
        this.state.stats.totalReadings++;
        // Speak the response with TTS if enabled
        if (this.ttsEngine) {
            this.agents.logger.info(`🔊 Speaking response with TTS...`, 'ORCHESTRATOR');
            this.emit('reading_audio_started');
            try {
                await this.ttsEngine.speak(styledResponse, {
                    blocking: false
                });
            }
            catch (error) {
                this.agents.logger.error(`TTS playback failed: ${error.message}`, 'ORCHESTRATOR');
            }
        }
        this.agents.logger.info(`✅ Reading completed for ${message.username}`, 'ORCHESTRATOR');
        this.emit('reading_completed', this.state.currentReading);
    }
    setMode(mode, oracleId) {
        this.state.mode = mode;
        if (mode === 'FORCED' && oracleId) {
            this.state.forcedOracleId = oracleId;
        }
        else {
            this.state.forcedOracleId = undefined;
        }
        this.agents.logger.info(`Mode set to ${mode}${oracleId ? ` with oracle ${oracleId}` : ''}`, 'ORCHESTRATOR');
        this.emit('state_changed');
    }
    getState() {
        return { ...this.state };
    }
    async handleHeartMeGift(heartMeMessage) {
        if (!this.state.isActive) {
            this.agents.logger.warn('Heart Me gift received but live not active', 'ORCHESTRATOR');
            return;
        }
        this.agents.logger.info(`❤️ Processing Heart Me gift from ${heartMeMessage.username}`, 'ORCHESTRATOR');
        // Initialiser le suivi des autorisations si nécessaire
        if (!this.state.authorizedUsers) {
            this.state.authorizedUsers = new Set();
        }
        // Vérifier si l'utilisateur suit déjà
        const userContext = this.agents.contextAgent.getContext(heartMeMessage.username);
        const hasFollowed = userContext?.messages.some((msg) => msg.isFollow) || false;
        if (hasFollowed) {
            // Utilisateur autorisé : a suivi + envoyé Heart Me
            this.state.authorizedUsers.add(heartMeMessage.userId);
            this.state.stats.totalGifts++;
            this.agents.logger.info(`✅ ${heartMeMessage.username} is now authorized to ask questions (follow + Heart Me)`, 'ORCHESTRATOR');
            // Émettre l'événement pour le dashboard
            this.emit('user_authorized', {
                username: heartMeMessage.username,
                userId: heartMeMessage.userId,
                giftType: heartMeMessage.giftType,
                timestamp: Date.now()
            });
            this.emit('state_changed');
        }
        else {
            this.agents.logger.warn(`❌ ${heartMeMessage.username} sent Heart Me but hasn't followed yet`, 'ORCHESTRATOR');
            // Émettre un événement pour rappeler de suivre
            this.emit('follow_required', {
                username: heartMeMessage.username,
                userId: heartMeMessage.userId,
                message: 'Please follow first to activate your Heart Me gift!',
                timestamp: Date.now()
            });
        }
    }
    async handleQueuedGift(queuedMessage) {
        if (!this.state.isActive) {
            this.agents.logger.warn('Queued gift received but live not active', 'ORCHESTRATOR');
            return;
        }
        this.agents.logger.info(`🍩 Processing queued gift from ${queuedMessage.username}`, 'ORCHESTRATOR');
        // Ajouter la question à la file d'attente
        const lastMessage = this.agents.contextAgent.getLastMessageFromUser(queuedMessage.userId);
        if (lastMessage) {
            this.agents.logger.info(`📝 Adding question from ${queuedMessage.username} to queue: ${lastMessage.message}`, 'ORCHESTRATOR');
            // Initialiser la file d'attente si elle n'existe pas
            if (!this.state.questionQueue) {
                this.state.questionQueue = [];
            }
            // Ajouter à la file d'attente
            this.state.questionQueue.push({
                username: queuedMessage.username,
                userId: queuedMessage.userId,
                question: lastMessage.message,
                giftType: queuedMessage.giftType,
                timestamp: Date.now()
            });
            this.state.stats.totalGifts++;
            // Émettre l'événement pour le dashboard
            this.emit('question_queued', {
                username: queuedMessage.username,
                giftType: queuedMessage.giftType,
                question: lastMessage.message,
                queuePosition: this.state.questionQueue.length,
                timestamp: Date.now()
            });
            this.agents.logger.info(`✅ Question added to queue (position ${this.state.questionQueue.length})`, 'ORCHESTRATOR');
            this.emit('state_changed');
        }
        else {
            this.agents.logger.warn(`No question found from ${queuedMessage.username} to queue`, 'ORCHESTRATOR');
        }
    }
    async handlePriorityGift(priorityMessage) {
        if (!this.state.isActive) {
            this.agents.logger.warn('Priority gift received but live not active', 'ORCHESTRATOR');
            return;
        }
        this.agents.logger.info(`⚡ Processing priority gift from ${priorityMessage.username}`, 'ORCHESTRATOR');
        // Épingler la question de l'utilisateur en priorité
        // Forcer le traitement immédiat de sa dernière question
        const lastMessage = this.agents.contextAgent.getLastMessageFromUser(priorityMessage.userId);
        if (lastMessage) {
            this.agents.logger.info(`📌 Pinning question from ${priorityMessage.username}: ${lastMessage.message}`, 'ORCHESTRATOR');
            // Mettre en mode FORCED avec l'utilisateur prioritaire
            this.state.mode = 'FORCED';
            this.state.stats.totalGifts++;
            // Émettre l'événement pour le dashboard
            this.emit('priority_question_pinned', {
                username: priorityMessage.username,
                giftType: priorityMessage.giftType,
                question: lastMessage.message,
                timestamp: Date.now()
            });
            // Traiter la question en priorité
            try {
                await this.processReading(lastMessage);
                // Remettre en mode AUTO après traitement
                setTimeout(() => {
                    if (this.state.mode === 'FORCED') {
                        this.state.mode = 'AUTO';
                        this.agents.logger.info('🔄 Switched back to AUTO mode', 'ORCHESTRATOR');
                        this.emit('state_changed');
                    }
                }, 10000); // 10 secondes pour afficher la réponse
            }
            catch (error) {
                this.agents.logger.error(`Priority reading failed: ${error.message}`, 'ORCHESTRATOR');
                this.state.mode = 'AUTO'; // Remettre en AUTO en cas d'erreur
            }
            this.emit('state_changed');
        }
        else {
            this.agents.logger.warn(`No question found from ${priorityMessage.username} to prioritize`, 'ORCHESTRATOR');
        }
    }
    isActive() {
        return this.state.isActive;
    }
}
exports.LiveCoreOrchestrator = LiveCoreOrchestrator;
