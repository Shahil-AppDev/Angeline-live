export interface TikFinityEvent {
  type: 'CHAT_MESSAGE' | 'GIFT' | 'FOLLOW' | 'SHARE' | 'LIKE' | 'JOIN';
  timestamp: number;
  user: {
    id: string;
    username: string;
    nickname: string;
    profilePictureUrl?: string;
  };
  data?: {
    message?: string;
    giftId?: number;
    giftName?: string;
    giftCount?: number;
    diamondCost?: number;
  };
}

export interface NormalizedEvent {
  type: 'CHAT_MESSAGE' | 'GIFT' | 'FOLLOW' | 'SHARE' | 'LIKE' | 'JOIN';
  timestamp: number;
  userId: string;
  username: string;
  nickname: string;
  message?: string;
  giftId?: number;
  giftName?: string;
  giftCount?: number;
  diamondCost?: number;
}

export interface OBSCommand {
  type: 'SET_TEXT' | 'SET_IMAGE' | 'SET_SCENE' | 'PLAY_MEDIA' | 'SHOW_SOURCE' | 'HIDE_SOURCE' | 'SET_SOURCE_SETTINGS';
  sourceName: string;
  data?: {
    text?: string;
    imagePath?: string;
    sceneName?: string;
    mediaPath?: string;
    visible?: boolean;
    settings?: Record<string, unknown>;
  };
}

export interface BridgeConfig {
  tikfinityUrl: string;
  obsUrl: string;
  obsPassword: string;
  serverPort: number;
  authToken: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  obsCommandRateLimit: number;
}

export interface HealthStatus {
  tikfinity: {
    connected: boolean;
    lastEvent?: number;
    reconnectAttempts: number;
  };
  obs: {
    connected: boolean;
    lastCommand?: number;
    version?: string;
  };
  server: {
    uptime: number;
    connectedClients: number;
  };
}

export interface SimulateEvent {
  delay: number;
  event: TikFinityEvent;
}
