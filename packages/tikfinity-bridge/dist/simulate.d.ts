import { EventBus } from './eventBus';
export interface SimulatorConfig {
    filePath: string;
    playbackSpeed?: number;
    loop?: boolean;
}
export declare class EventSimulator {
    private eventBus;
    private config;
    private isRunning;
    private stopRequested;
    constructor(config: SimulatorConfig, eventBus: EventBus);
    start(): Promise<void>;
    private playFile;
    private sleep;
    stop(): void;
    getStatus(): {
        running: boolean;
    };
}
export declare function createSampleSimulationFile(outputPath: string): void;
