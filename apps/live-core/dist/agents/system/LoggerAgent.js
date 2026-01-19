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
exports.LoggerAgent = void 0;
const shared_1 = require("@angeline-live/shared");
const fs = __importStar(require("fs"));
class LoggerAgent {
    constructor(logFilePath) {
        this.logs = [];
        this.maxLogs = 1000;
        this.logFilePath = logFilePath;
    }
    log(level, message, agentId, metadata) {
        const entry = {
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
    debug(message, agentId, metadata) {
        this.log(shared_1.LogLevel.DEBUG, message, agentId, metadata);
    }
    info(message, agentId, metadata) {
        this.log(shared_1.LogLevel.INFO, message, agentId, metadata);
    }
    warn(message, agentId, metadata) {
        this.log(shared_1.LogLevel.WARN, message, agentId, metadata);
    }
    error(message, agentId, metadata) {
        this.log(shared_1.LogLevel.ERROR, message, agentId, metadata);
    }
    printLog(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const agentPrefix = entry.agentId ? `[${entry.agentId}]` : '';
        const levelEmoji = this.getLevelEmoji(entry.level);
        console.log(`${levelEmoji} ${timestamp} ${agentPrefix} ${entry.message}`);
        if (entry.metadata) {
            console.log('  Metadata:', entry.metadata);
        }
    }
    getLevelEmoji(level) {
        switch (level) {
            case shared_1.LogLevel.DEBUG: return '🔍';
            case shared_1.LogLevel.INFO: return 'ℹ️';
            case shared_1.LogLevel.WARN: return '⚠️';
            case shared_1.LogLevel.ERROR: return '❌';
            default: return '📝';
        }
    }
    writeToFile(entry) {
        if (!this.logFilePath)
            return;
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFile(this.logFilePath, logLine, (err) => {
            if (err) {
                console.error('Failed to write log to file:', err);
            }
        });
    }
    getLogs(level, limit) {
        let filtered = level
            ? this.logs.filter(log => log.level === level)
            : this.logs;
        if (limit) {
            filtered = filtered.slice(-limit);
        }
        return filtered;
    }
    clear() {
        this.logs = [];
    }
}
exports.LoggerAgent = LoggerAgent;
