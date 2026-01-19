import { LogEntry, LogLevel } from '@angeline-live/shared';
import * as fs from 'fs';

export class LoggerAgent {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private logFilePath?: string;

  constructor(logFilePath?: string) {
    this.logFilePath = logFilePath;
  }

  log(level: LogLevel, message: string, agentId?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      agentId,
      metadata
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.printLog(entry);

    if (this.logFilePath) {
      this.writeToFile(entry);
    }
  }

  debug(message: string, agentId?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, agentId, metadata);
  }

  info(message: string, agentId?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, agentId, metadata);
  }

  warn(message: string, agentId?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, agentId, metadata);
  }

  error(message: string, agentId?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, agentId, metadata);
  }

  private printLog(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const agentPrefix = entry.agentId ? `[${entry.agentId}]` : '';
    const levelEmoji = this.getLevelEmoji(entry.level);

    console.log(`${levelEmoji} ${timestamp} ${agentPrefix} ${entry.message}`);

    if (entry.metadata) {
      console.log('  Metadata:', entry.metadata);
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.logFilePath) return;

    const logLine = JSON.stringify(entry) + '\n';

    fs.appendFile(this.logFilePath, logLine, (err) => {
      if (err) {
        console.error('Failed to write log to file:', err);
      }
    });
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  clear(): void {
    this.logs = [];
  }
}
