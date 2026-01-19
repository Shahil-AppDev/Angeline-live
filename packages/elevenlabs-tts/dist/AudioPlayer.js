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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class AudioPlayer {
    constructor() {
        this.currentProcess = null;
        this.isPlaying = false;
    }
    async play(audioBuffer, options = {}) {
        const volume = options.volume || 100;
        const blocking = options.blocking !== false;
        const tempFile = path.join(process.cwd(), 'temp_audio.mp3');
        fs.writeFileSync(tempFile, audioBuffer);
        try {
            await this.playFile(tempFile, volume, blocking);
        }
        finally {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }
    async playFile(filePath, volume = 100, blocking = true) {
        if (this.isPlaying) {
            console.log('[AudioPlayer] Already playing, stopping current playback');
            await this.stop();
        }
        this.isPlaying = true;
        try {
            if (process.platform === 'win32') {
                await this.playWindows(filePath, volume, blocking);
            }
            else if (process.platform === 'darwin') {
                await this.playMacOS(filePath, volume, blocking);
            }
            else {
                await this.playLinux(filePath, volume, blocking);
            }
        }
        catch (error) {
            console.error(`[AudioPlayer] Playback error: ${error.message}`);
            throw error;
        }
        finally {
            this.isPlaying = false;
            this.currentProcess = null;
        }
    }
    async playWindows(filePath, volume, blocking) {
        const volumePercent = Math.round(volume);
        const psScript = `
      Add-Type -AssemblyName presentationCore
      $mediaPlayer = New-Object System.Windows.Media.MediaPlayer
      $mediaPlayer.Open([uri]"${filePath.replace(/\\/g, '\\\\')}")
      $mediaPlayer.Volume = ${volumePercent / 100}
      $mediaPlayer.Play()
      Start-Sleep -Seconds 1
      while($mediaPlayer.NaturalDuration.HasTimeSpan -eq $false) {
        Start-Sleep -Milliseconds 100
      }
      $duration = $mediaPlayer.NaturalDuration.TimeSpan.TotalSeconds
      Start-Sleep -Seconds $duration
      $mediaPlayer.Stop()
      $mediaPlayer.Close()
    `;
        const scriptFile = path.join(process.cwd(), 'temp_play.ps1');
        fs.writeFileSync(scriptFile, psScript);
        try {
            if (blocking) {
                await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptFile}"`);
            }
            else {
                (0, child_process_1.exec)(`powershell -ExecutionPolicy Bypass -File "${scriptFile}"`, (error) => {
                    if (error) {
                        console.error(`[AudioPlayer] Background playback error: ${error.message}`);
                    }
                    if (fs.existsSync(scriptFile)) {
                        fs.unlinkSync(scriptFile);
                    }
                });
            }
        }
        finally {
            if (blocking && fs.existsSync(scriptFile)) {
                fs.unlinkSync(scriptFile);
            }
        }
    }
    async playMacOS(filePath, volume, blocking) {
        const volumePercent = Math.round(volume);
        const command = `afplay "${filePath}" -v ${volumePercent / 100}`;
        if (blocking) {
            await execAsync(command);
        }
        else {
            (0, child_process_1.exec)(command);
        }
    }
    async playLinux(filePath, volume, blocking) {
        const volumePercent = Math.round(volume);
        let command = '';
        try {
            await execAsync('which mpg123');
            command = `mpg123 -q --gain ${volumePercent} "${filePath}"`;
        }
        catch {
            try {
                await execAsync('which ffplay');
                command = `ffplay -nodisp -autoexit -volume ${volumePercent} "${filePath}"`;
            }
            catch {
                throw new Error('No audio player found. Install mpg123 or ffmpeg.');
            }
        }
        if (blocking) {
            await execAsync(command);
        }
        else {
            (0, child_process_1.exec)(command);
        }
    }
    async stop() {
        if (this.currentProcess) {
            this.currentProcess.kill();
            this.currentProcess = null;
        }
        this.isPlaying = false;
    }
    getIsPlaying() {
        return this.isPlaying;
    }
}
exports.AudioPlayer = AudioPlayer;
