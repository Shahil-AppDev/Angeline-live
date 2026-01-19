# TikFinity Bridge

Robust WebSocket client for connecting to TikFinity Desktop App (TikTok LIVE API).

## Features

- ✅ WebSocket connection with auto-reconnect (exponential backoff + jitter)
- ✅ Heartbeat/ping mechanism for connection health
- ✅ Event normalization (CHAT_MESSAGE, GIFT, FOLLOW)
- ✅ EventBus for internal pub/sub
- ✅ SIMULATE mode for offline testing with JSONL replay

## Usage

### Live Mode

```typescript
import { TikFinityBridge } from '@angeline-live/tikfinity-bridge';

const bridge = new TikFinityBridge({
  wsUrl: 'ws://localhost:21213',
  reconnectEnabled: true,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000
});

await bridge.start();

const eventBus = bridge.getEventBus();

eventBus.subscribe('CHAT_MESSAGE', (event) => {
  console.log(`${event.username}: ${event.message}`);
});

eventBus.subscribe('GIFT', (event) => {
  console.log(`${event.username} sent ${event.giftName} x${event.count}`);
});

// Later...
bridge.stop();
```

### Simulate Mode

```typescript
import { TikFinityBridge, createSampleSimulationFile } from '@angeline-live/tikfinity-bridge';

// Create sample file
createSampleSimulationFile('./events.jsonl');

const bridge = new TikFinityBridge({
  wsUrl: '', // not used in simulate mode
  simulate: true,
  simulateFile: './events.jsonl'
});

await bridge.start();
```

## Event Types

### CHAT_MESSAGE
```typescript
{
  type: 'CHAT_MESSAGE',
  userId: string,
  username: string,
  message: string,
  timestamp: number
}
```

### GIFT
```typescript
{
  type: 'GIFT',
  userId: string,
  username: string,
  giftId: number,
  giftName: string,
  coins: number,
  count: number,
  timestamp: number
}
```

### FOLLOW
```typescript
{
  type: 'FOLLOW',
  userId: string,
  username: string,
  timestamp: number
}
```

## Requirements

- TikFinity Desktop App must run on the same Windows PC
- WebSocket URL: `ws://localhost:21213` (default)

## Architecture

```
TikFinity Desktop (Windows PC)
    ↓ WebSocket
TikFinityClient (this package)
    ↓ EventBus
LiveCoreOrchestrator
    ↓
SafetyGuard → IntentAnalyzer → OracleSelector → CardDrawEngine → LLM → StyleAgent
    ↓
OBSRenderEngine
```
