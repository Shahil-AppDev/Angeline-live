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
const llm_1 = require("@angeline-live/llm");
const obs_render_1 = require("@angeline-live/obs-render");
const oracle_system_1 = require("@angeline-live/oracle-system");
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const ContextAgent_1 = require("../agents/ia/ContextAgent");
const IntentAnalyzer_1 = require("../agents/ia/IntentAnalyzer");
const SafetyGuard_1 = require("../agents/ia/SafetyGuard");
const OBSRenderEngine_1 = require("../agents/obs/OBSRenderEngine");
const RateLimiter_1 = require("../agents/obs/RateLimiter");
const CardDrawEngine_1 = require("../agents/oracle/CardDrawEngine");
const MeaningExtractor_1 = require("../agents/oracle/MeaningExtractor");
const OracleSelector_1 = require("../agents/oracle/OracleSelector");
const PromptBuilder_1 = require("../agents/response/PromptBuilder");
const ResponseComposer_1 = require("../agents/response/ResponseComposer");
const StyleAgent_1 = require("../agents/response/StyleAgent");
const HealthMonitor_1 = require("../agents/system/HealthMonitor");
const LiveCoreOrchestrator_1 = require("../agents/system/LiveCoreOrchestrator");
const LoggerAgent_1 = require("../agents/system/LoggerAgent");
const ChatListener_1 = require("../agents/tiktok/ChatListener");
const FollowAgent_1 = require("../agents/tiktok/FollowAgent");
const GiftDetector_1 = require("../agents/tiktok/GiftDetector");
dotenv.config();
const ROOT_PATH = path.resolve(__dirname, '../../..');
const CONFIG_PATH = path.join(ROOT_PATH, 'config');
const ASSETS_PATH = path.join(ROOT_PATH, 'assets');
async function main() {
    console.log('🚀 Starting Angeline NJ Live Core...\n');
    const logger = new LoggerAgent_1.LoggerAgent(path.join(ROOT_PATH, 'logs/live-core.log'));
    logger.info('Initializing Live Core', 'MAIN');
    const oracleManager = new oracle_system_1.OracleManager(path.join(CONFIG_PATH, 'oracles.json'), ASSETS_PATH);
    logger.info('✅ Oracle Manager initialized', 'MAIN');
    const obsController = new obs_render_1.OBSController({
        host: process.env.OBS_WS_HOST || 'localhost',
        port: parseInt(process.env.OBS_WS_PORT || '4455'),
        password: process.env.OBS_WS_PASSWORD || ''
    }, path.join(CONFIG_PATH, 'sources_map.json'));
    try {
        await obsController.connect();
        logger.info('✅ OBS connected', 'MAIN');
    }
    catch (error) {
        logger.warn(`⚠️ OBS connection failed: ${error.message}`, 'MAIN');
    }
    const llmClient = new llm_1.OpenRouterClient(process.env.OPENROUTER_API_KEY || '', process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet');
    logger.info('✅ LLM client initialized', 'MAIN');
    const chatListener = new ChatListener_1.ChatListener();
    const giftDetector = new GiftDetector_1.GiftDetector();
    const followAgent = new FollowAgent_1.FollowAgent();
    const intentAnalyzer = new IntentAnalyzer_1.IntentAnalyzer(path.join(CONFIG_PATH, 'taxonomy.json'));
    const safetyGuard = new SafetyGuard_1.SafetyGuard();
    const contextAgent = new ContextAgent_1.ContextAgent();
    const oracleSelector = new OracleSelector_1.OracleSelector(oracleManager);
    const cardDrawEngine = new CardDrawEngine_1.CardDrawEngine(oracleManager);
    const meaningExtractor = new MeaningExtractor_1.MeaningExtractor();
    const promptBuilder = new PromptBuilder_1.PromptBuilder();
    const responseComposer = new ResponseComposer_1.ResponseComposer(llmClient);
    const styleAgent = new StyleAgent_1.StyleAgent();
    const obsRenderEngine = new OBSRenderEngine_1.OBSRenderEngine(obsController);
    const rateLimiter = new RateLimiter_1.RateLimiter(500);
    const healthMonitor = new HealthMonitor_1.HealthMonitor(30000);
    const orchestrator = new LiveCoreOrchestrator_1.LiveCoreOrchestrator({
        chatListener,
        giftDetector,
        followAgent,
        intentAnalyzer,
        safetyGuard,
        contextAgent,
        oracleSelector,
        cardDrawEngine,
        meaningExtractor,
        promptBuilder,
        responseComposer,
        styleAgent,
        obsRenderEngine,
        rateLimiter,
        logger
    });
    // Gérer les cadeaux prioritaires (Shell Energy)
    chatListener.on('priority_gift', (priorityMessage) => {
        logger.info(`⚡ Priority gift detected: ${priorityMessage.giftType} from ${priorityMessage.username}`, 'MAIN');
        orchestrator.handlePriorityGift(priorityMessage);
    });
    healthMonitor.start();
    logger.info('✅ Health monitor started', 'MAIN');
    const app = (0, express_1.default)();
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    app.use(express_1.default.json());
    app.get('/health', (req, res) => {
        const statuses = healthMonitor.getAllStatuses();
        const isHealthy = healthMonitor.isAllHealthy();
        res.json({
            healthy: isHealthy,
            services: statuses,
            live: orchestrator.getState()
        });
    });
    app.post('/live/start', async (req, res) => {
        try {
            await orchestrator.startLive();
            res.json({ success: true, message: 'Live started' });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });
    app.post('/live/stop', async (req, res) => {
        try {
            await orchestrator.stopLive();
            res.json({ success: true, message: 'Live stopped' });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });
    app.post('/live/mode', (req, res) => {
        const { mode, oracleId } = req.body;
        if (mode !== 'AUTO' && mode !== 'FORCED') {
            return res.status(400).json({ success: false, error: 'Invalid mode' });
        }
        orchestrator.setMode(mode, oracleId);
        res.json({ success: true, mode, oracleId });
    });
    app.get('/live/state', (req, res) => {
        res.json(orchestrator.getState());
    });
    app.get('/oracles', (req, res) => {
        const oracles = oracleManager.getAllOracles();
        res.json(oracles);
    });
    app.post('/live/test-draw', async (req, res) => {
        try {
            if (!orchestrator.getState().isActive) {
                return res.status(400).json({ success: false, error: 'Live is not active' });
            }
            const testMessage = {
                username: req.body.username || 'TestUser',
                message: req.body.message || 'Quelle est ma destinée amoureuse ?',
                userId: 'test-' + Date.now(),
                timestamp: Date.now()
            };
            await orchestrator.handleChatMessage(testMessage);
            res.json({
                success: true,
                message: 'Test draw initiated',
                testMessage
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    const PORT = parseInt(process.env.LIVE_CORE_PORT || '3001');
    const server = app.listen(PORT, () => {
        logger.info(`✅ Live Core API listening on port ${PORT}`, 'MAIN');
        console.log(`\n🎉 Angeline NJ Live Core ready!`);
        console.log(`📡 API: http://localhost:${PORT}`);
        console.log(`🔮 Oracles: ${oracleManager.getAllOracles().length} loaded`);
    });
    const io = require('socket.io')(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        logger.info('Dashboard connected via WebSocket', 'WEBSOCKET');
        socket.emit('state_update', orchestrator.getState());
        orchestrator.on('state_changed', () => {
            socket.emit('state_update', orchestrator.getState());
        });
        orchestrator.on('reading_started', (data) => {
            socket.emit('reading_started', data);
        });
        orchestrator.on('reading_completed', (data) => {
            socket.emit('reading_completed', data);
        });
        socket.on('disconnect', () => {
            logger.info('Dashboard disconnected', 'WEBSOCKET');
        });
    });
}
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
