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

export interface Card {
  id: string;
  name: string;
  imagePath: string;
  keywords: string[];
}

export interface ReadingPayload {
  username: string;
  question: string;
  cards: Card[];
  response: string;
}

export interface RevealTiming {
  delayBeforeReveal: number;
  delayBetweenCards: number;
  cardAnimationDuration: number;
}

export interface IOBSClient {
  sendOBSCommand(command: OBSCommand): Promise<void>;
}
