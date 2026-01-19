import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PlaybackOptions {
  volume?: number;
  blocking?: boolean;
}

export class AudioPlayer {
  private currentProcess: any = null;
  private isPlaying: boolean = false;

  async play(audioBuffer: Buffer, options: PlaybackOptions = {}): Promise<void> {
    const volume = options.volume || 100;
    const blocking = options.blocking !== false;

    const tempFile = path.join(process.cwd(), 'temp_audio.mp3');
    fs.writeFileSync(tempFile, audioBuffer);

    try {
      await this.playFile(tempFile, volume, blocking);
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  async playFile(filePath: string, volume: number = 100, blocking: boolean = true): Promise<void> {
    if (this.isPlaying) {
      console.log('[AudioPlayer] Already playing, stopping current playback');
      await this.stop();
    }

    this.isPlaying = true;

    try {
      if (process.platform === 'win32') {
        await this.playWindows(filePath, volume, blocking);
      } else if (process.platform === 'darwin') {
        await this.playMacOS(filePath, volume, blocking);
      } else {
        await this.playLinux(filePath, volume, blocking);
      }
    } catch (error: any) {
      console.error(`[AudioPlayer] Playback error: ${error.message}`);
      throw error;
    } finally {
      this.isPlaying = false;
      this.currentProcess = null;
    }
  }

  private async playWindows(filePath: string, volume: number, blocking: boolean): Promise<void> {
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
      } else {
        exec(`powershell -ExecutionPolicy Bypass -File "${scriptFile}"`, (error) => {
          if (error) {
            console.error(`[AudioPlayer] Background playback error: ${error.message}`);
          }
          if (fs.existsSync(scriptFile)) {
            fs.unlinkSync(scriptFile);
          }
        });
      }
    } finally {
      if (blocking && fs.existsSync(scriptFile)) {
        fs.unlinkSync(scriptFile);
      }
    }
  }

  private async playMacOS(filePath: string, volume: number, blocking: boolean): Promise<void> {
    const volumePercent = Math.round(volume);
    const command = `afplay "${filePath}" -v ${volumePercent / 100}`;

    if (blocking) {
      await execAsync(command);
    } else {
      exec(command);
    }
  }

  private async playLinux(filePath: string, volume: number, blocking: boolean): Promise<void> {
    const volumePercent = Math.round(volume);
    let command = '';

    try {
      await execAsync('which mpg123');
      command = `mpg123 -q --gain ${volumePercent} "${filePath}"`;
    } catch {
      try {
        await execAsync('which ffplay');
        command = `ffplay -nodisp -autoexit -volume ${volumePercent} "${filePath}"`;
      } catch {
        throw new Error('No audio player found. Install mpg123 or ffmpeg.');
      }
    }

    if (blocking) {
      await execAsync(command);
    } else {
      exec(command);
    }
  }

  async stop(): Promise<void> {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
    this.isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
