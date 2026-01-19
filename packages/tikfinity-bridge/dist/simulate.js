"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSimulator = void 0;
exports.createSampleSimulationFile = createSampleSimulationFile;
const fs = require('fs');
const readline = require('readline');
class EventSimulator {
    constructor(config, eventBus) {
        this.isRunning = false;
        this.stopRequested = false;
        this.config = {
            filePath: config.filePath,
            playbackSpeed: config.playbackSpeed ?? 1.0,
            loop: config.loop ?? false
        };
        this.eventBus = eventBus;
    }
    async start() {
        if (this.isRunning) {
            console.log('[Simulator] Already running');
            return;
        }
        if (!fs.existsSync(this.config.filePath)) {
            throw new Error(`[Simulator] File not found: ${this.config.filePath}`);
        }
        this.isRunning = true;
        this.stopRequested = false;
        console.log(`[Simulator] Starting playback from ${this.config.filePath} (speed: ${this.config.playbackSpeed}x)`);
        do {
            await this.playFile();
            if (this.config.loop && !this.stopRequested) {
                console.log('[Simulator] Looping...');
                await this.sleep(2000);
            }
        } while (this.config.loop && !this.stopRequested);
        this.isRunning = false;
        console.log('[Simulator] Playback finished');
    }
    async playFile() {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(this.config.filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            let lineNumber = 0;
            let lastTimestamp = 0;
            rl.on('line', async (line) => {
                if (this.stopRequested) {
                    rl.close();
                    return;
                }
                lineNumber++;
                if (!line.trim()) {
                    return;
                }
                try {
                    const event = JSON.parse(line);
                    if (event.timestamp && lastTimestamp > 0) {
                        const delay = (event.timestamp - lastTimestamp) / this.config.playbackSpeed;
                        if (delay > 0) {
                            await this.sleep(delay);
                        }
                    }
                    lastTimestamp = event.timestamp;
                    console.log(`[Simulator] 📨 Replaying ${event.type} from ${event.username}`);
                    this.eventBus.publish(event);
                }
                catch (error) {
                    console.error(`[Simulator] Error parsing line ${lineNumber}:`, error);
                }
            });
            rl.on('close', () => {
                resolve();
            });
            rl.on('error', (error) => {
                console.error('[Simulator] Error reading file:', error);
                reject(error);
            });
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    stop() {
        console.log('[Simulator] Stopping...');
        this.stopRequested = true;
    }
    getStatus() {
        return { running: this.isRunning };
    }
}
exports.EventSimulator = EventSimulator;
function createSampleSimulationFile(outputPath) {
    const sampleEvents = [
        {
            type: 'CHAT_MESSAGE',
            userId: 'user1',
            username: 'TestUser1',
            message: 'Hello! Can you do a reading for me?',
            timestamp: Date.now()
        },
        {
            type: 'FOLLOW',
            userId: 'user1',
            username: 'TestUser1',
            timestamp: Date.now() + 1000
        },
        {
            type: 'GIFT',
            userId: 'user1',
            username: 'TestUser1',
            giftId: 5655,
            giftName: 'Rose',
            coins: 1,
            count: 1,
            timestamp: Date.now() + 2000
        },
        {
            type: 'CHAT_MESSAGE',
            userId: 'user2',
            username: 'TestUser2',
            message: 'What does my future hold?',
            timestamp: Date.now() + 5000
        },
        {
            type: 'GIFT',
            userId: 'user2',
            username: 'TestUser2',
            giftId: 5269,
            giftName: 'Heart Me',
            coins: 15,
            count: 1,
            timestamp: Date.now() + 6000
        }
    ];
    const lines = sampleEvents.map(event => JSON.stringify(event)).join('\n');
    fs.writeFileSync(outputPath, lines, 'utf8');
    console.log(`[Simulator] Sample file created: ${outputPath}`);
}
