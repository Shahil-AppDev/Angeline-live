export declare enum IntentLevel {
    H0 = "H0",
    H1 = "H1",
    H2 = "H2",
    H3 = "H3"
}
export declare enum IntentAxis {
    SENTIMENTAL = "SENTIMENTAL",
    TRAVAIL = "TRAVAIL",
    FAMILLE = "FAMILLE",
    SPIRITUEL = "SPIRITUEL"
}
export interface IntentAnalysisResult {
    level: IntentLevel;
    intentId: string;
    axis?: IntentAxis;
    confidence: number;
    keywords: string[];
    rawMessage: string;
}
export interface OracleConfig {
    id: string;
    name: string;
    description: string;
    card_count: number;
    assets_path: string;
    themes: string[];
    tone: string;
    card_format: {
        type: 'image' | 'video';
        extension: string;
        naming_convention: string;
    };
    parent_oracle?: string;
}
export interface Card {
    id: string;
    number: number;
    name: string;
    meaning: string;
    reversed_meaning?: string;
    keywords: string[];
    image_path: string;
    video_path?: string;
}
export interface CardDraw {
    cards: Card[];
    oracle_id: string;
    timestamp: number;
    user: string;
    question: string;
}
export interface TikTokMessage {
    username: string;
    message: string;
    timestamp: number;
    userId: string;
    isGift?: boolean;
    giftId?: number;
    giftName?: string;
    repeatCount?: number;
    repeatEnd?: boolean;
    isFollow?: boolean;
}
export interface LiveState {
    isActive: boolean;
    mode: 'AUTO' | 'FORCED';
    forcedOracleId?: string;
    currentReading?: {
        username: string;
        question: string;
        cards: Card[];
        oracle_id: string;
        response?: string;
    };
    questionQueue?: Array<{
        username: string;
        userId: string;
        question: string;
        giftType: string;
        timestamp: number;
    }>;
    authorizedUsers?: Set<string>;
    stats: {
        totalReadings: number;
        totalMessages: number;
        totalGifts: number;
        totalFollows: number;
    };
}
export interface OBSSourceUpdate {
    sourceName: string;
    settings?: Record<string, any>;
    visible?: boolean;
    position?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface AgentMessage {
    type: string;
    payload: any;
    timestamp: number;
    agentId: string;
}
export interface LLMRequest {
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
}
export interface LLMResponse {
    content: string;
    tokens: number;
    model: string;
    finishReason: string;
}
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    agentId?: string;
    metadata?: Record<string, any>;
}
export interface HealthStatus {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: number;
    details?: string;
}
