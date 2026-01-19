export interface PlaybackOptions {
    volume?: number;
    blocking?: boolean;
}
export declare class AudioPlayer {
    private currentProcess;
    private isPlaying;
    play(audioBuffer: Buffer, options?: PlaybackOptions): Promise<void>;
    playFile(filePath: string, volume?: number, blocking?: boolean): Promise<void>;
    private playWindows;
    private playMacOS;
    private playLinux;
    stop(): Promise<void>;
    getIsPlaying(): boolean;
}
