import { OBSSourceUpdate } from '@angeline-live/shared';
interface OBSConfig {
    host: string;
    port: number;
    password: string;
}
export declare class OBSController {
    private obs;
    private config;
    private connected;
    private sourcesMap;
    constructor(config: OBSConfig, sourcesMapPath: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    updateSource(update: OBSSourceUpdate): Promise<void>;
    updateCardImage(cardSlot: 'CARD1' | 'CARD2' | 'CARD3', imagePath: string): Promise<void>;
    updateText(sourceName: string, text: string): Promise<void>;
    playSound(sourceName: string, audioPath: string): Promise<void>;
    setPreset(presetName: 'idle' | 'reading_active'): Promise<void>;
    revealCards(card1Path: string, card2Path: string, card3Path: string): Promise<void>;
    private getSceneItemId;
    private getShuffleSound;
    private getFlipSound;
    showReadingOverlay(payload: {
        username: string;
        question: string;
        cards: Array<{
            image_path: string;
        }>;
        response: string;
    }): Promise<void>;
    resetToIdle(): Promise<void>;
    getStatus(): Promise<{
        connected: boolean;
        streaming: boolean;
        recording: boolean;
    }>;
}
export {};
