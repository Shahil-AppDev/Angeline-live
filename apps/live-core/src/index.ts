import { OpenRouterClient } from '@angeline-live/llm';
import { OBSController } from '@angeline-live/obs-render';
import { OracleManager } from '@angeline-live/oracle-system';
import * as dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import { ContextAgent } from '../agents/ia/ContextAgent';
import { IntentAnalyzer } from '../agents/ia/IntentAnalyzer';
import { SafetyGuard } from '../agents/ia/SafetyGuard';
import { OBSRenderEngine } from '../agents/obs/OBSRenderEngine';
import { RateLimiter } from '../agents/obs/RateLimiter';
import { CardDrawEngine } from '../agents/oracle/CardDrawEngine';
import { MeaningExtractor } from '../agents/oracle/MeaningExtractor';
import { OracleSelector } from '../agents/oracle/OracleSelector';
import { PromptBuilder } from '../agents/response/PromptBuilder';
import { ResponseComposer } from '../agents/response/ResponseComposer';
import { StyleAgent } from '../agents/response/StyleAgent';
import { HealthMonitor } from '../agents/system/HealthMonitor';
import { LiveCoreOrchestrator } from '../agents/system/LiveCoreOrchestrator';
import { LoggerAgent } from '../agents/system/LoggerAgent';
import { ChatListener } from '../agents/tiktok/ChatListener';
import { FollowAgent } from '../agents/tiktok/FollowAgent';
import { GiftDetector } from '../agents/tiktok/GiftDetector';

dotenv.config();

const ROOT_PATH = path.resolve(__dirname, '../../..');
const CONFIG_PATH = path.join(ROOT_PATH, 'config');
const ASSETS_PATH = path.join(ROOT_PATH, 'assets');

async function main() {
  console.log('🚀 Starting Angeline NJ Live Core...\n');

  const logger = new LoggerAgent(path.join(ROOT_PATH, 'logs/live-core.log'));
  logger.info('Initializing Live Core', 'MAIN');

  const oracleManager = new OracleManager(
    path.join(CONFIG_PATH, 'oracles.json'),
    ASSETS_PATH
  );
  logger.info('✅ Oracle Manager initialized', 'MAIN');

  const obsController = new OBSController(
    {
      host: process.env.OBS_WS_HOST || 'localhost',
      port: parseInt(process.env.OBS_WS_PORT || '4455'),
      password: process.env.OBS_WS_PASSWORD || ''
    },
    path.join(CONFIG_PATH, 'sources_map.json')
  );

  try {
    await obsController.connect();
    logger.info('✅ OBS connected', 'MAIN');
  } catch (error: any) {
    logger.warn(`⚠️ OBS connection failed: ${error.message}`, 'MAIN');
  }

  const llmClient = new OpenRouterClient(
    process.env.OPENROUTER_API_KEY || '',
    process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'
  );
  logger.info('✅ LLM client initialized', 'MAIN');

  const chatListener = new ChatListener();
  const giftDetector = new GiftDetector();
  const followAgent = new FollowAgent();
  const intentAnalyzer = new IntentAnalyzer(path.join(CONFIG_PATH, 'taxonomy.json'));
  const safetyGuard = new SafetyGuard();
  const contextAgent = new ContextAgent();
  const oracleSelector = new OracleSelector(oracleManager);
  const cardDrawEngine = new CardDrawEngine(oracleManager);
  const meaningExtractor = new MeaningExtractor();
  const promptBuilder = new PromptBuilder();
  const responseComposer = new ResponseComposer(llmClient);
  const styleAgent = new StyleAgent();
  const obsRenderEngine = new OBSRenderEngine(obsController);
  const rateLimiter = new RateLimiter(500);
  const healthMonitor = new HealthMonitor(30000);

  const orchestrator = new LiveCoreOrchestrator({
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

  const app = express();
  
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  app.use(express.json());

  app.use('/assets', express.static(ASSETS_PATH, {
    maxAge: '1d',
    etag: true
  }));
  logger.info(`✅ Static assets served from /assets`, 'MAIN');

  const apiRouter = express.Router();

  apiRouter.get('/health', (_req, res) => {
    const statuses = healthMonitor.getAllStatuses();
    const isHealthy = healthMonitor.isAllHealthy();
    
    res.json({
      healthy: isHealthy,
      services: statuses,
      live: orchestrator.getState()
    });
  });

  apiRouter.post('/live/start', async (_req, res) => {
    try {
      await orchestrator.startLive();
      res.json({ success: true, message: 'Live started' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  apiRouter.post('/live/stop', async (_req, res) => {
    try {
      await orchestrator.stopLive();
      res.json({ success: true, message: 'Live stopped' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  apiRouter.post('/live/mode', (req, res) => {
    const { mode, oracleId } = req.body;
    
    if (mode !== 'AUTO' && mode !== 'FORCED') {
      return res.status(400).json({ success: false, error: 'Invalid mode' });
    }

    orchestrator.setMode(mode, oracleId);
    res.json({ success: true, mode, oracleId });
  });

  apiRouter.get('/live/state', (_req, res) => {
    res.json(orchestrator.getState());
  });

  apiRouter.get('/oracles', (_req, res) => {
    // MVP: Return only ORACLE_MYSTICA
    const allOracles = oracleManager.getAllOracles();
    const mysticaOracle = allOracles.find(o => o.id === 'ORACLE_MYSTICA');
    res.json(mysticaOracle ? [mysticaOracle] : []);
  });

  apiRouter.post('/live/test-draw', async (req, res) => {
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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.use('/api', apiRouter);
  logger.info(`✅ API routes mounted on /api`, 'MAIN');

  const PORT = parseInt(process.env.LIVE_CORE_PORT || '3001');
  const server = app.listen(PORT, () => {
    logger.info(`✅ Live Core API listening on port ${PORT}`, 'MAIN');
    console.log(`\n🎉 Angeline NJ Live Core ready!`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔮 Oracles: ${oracleManager.getAllOracles().length} loaded`);
  });

  const io = require('socket.io')(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: any) => {
    logger.info('Dashboard connected via WebSocket', 'WEBSOCKET');
    
    socket.emit('state_update', orchestrator.getState());

    orchestrator.on('state_changed', () => {
      socket.emit('state_update', orchestrator.getState());
    });

    orchestrator.on('reading_started', (data: any) => {
      socket.emit('reading_started', data);
    });

    orchestrator.on('reading_completed', (data: any) => {
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
