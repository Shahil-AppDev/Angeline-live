# @angeline-live/elevenlabs-tts

Module de synthèse vocale (Text-to-Speech) utilisant l'API ElevenLabs pour Angeline Live.

## Fonctionnalités

- ✅ Conversion texte vers audio haute qualité
- ✅ Cache intelligent (évite les appels API redondants)
- ✅ Lecture audio automatique (Windows/macOS/Linux)
- ✅ Support multi-voix
- ✅ Gestion du volume
- ✅ Mode blocking/non-blocking
- ✅ Événements pour intégration

## Installation

```bash
cd packages/elevenlabs-tts
npm install
npm run build
```

## Utilisation

### Exemple basique

```typescript
import { TTSEngine } from '@angeline-live/elevenlabs-tts';

const tts = new TTSEngine({
  apiKey: process.env.ELEVENLABS_API_KEY!,
  cacheDir: './cache/tts',
  defaultVoiceId: 'C7VHv0h3cGzIczU4biXw', // Voix MVP par défaut
  autoPlay: true,
  volume: 80
});

// Parler un texte
await tts.speak("Bienvenue dans Angeline Live!");

// Parler avec options personnalisées
await tts.speak("Votre lecture de tarot révèle...", {
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
  voiceSettings: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2
  },
  volume: 90
});
```

### Événements

```typescript
tts.on('tts_started', ({ text }) => {
  console.log(`Génération audio: ${text}`);
});

tts.on('tts_generated', ({ text, size }) => {
  console.log(`Audio généré: ${size} bytes`);
});

tts.on('tts_played', ({ text }) => {
  console.log(`Lecture terminée`);
});

tts.on('tts_error', ({ text, error }) => {
  console.error(`Erreur TTS: ${error}`);
});
```

### Gestion du cache

```typescript
// Statistiques du cache
const stats = tts.getCacheStats();
console.log(`Cache: ${stats.count} fichiers, ${stats.totalSizeMB} MB`);

// Vider le cache
tts.clearCache();
```

### Voix disponibles

```typescript
const voices = await tts.getVoices();
voices.voices.forEach(voice => {
  console.log(`${voice.name} (${voice.voice_id})`);
});
```

## Voix recommandées

### Français
- **Bella** - `EXAVITQu4vr4xnSDxMaL` - Voix féminine douce (recommandée pour Angeline)
- **Charlotte** - `XB0fDUnXU5powFXDhCwa` - Voix féminine claire
- **Matilda** - `XrExE9yKIg1WjnnlVkGX` - Voix féminine mature

### Anglais
- **Sarah** - `EXAVITQu4vr4xnSDxMaL` - Voix féminine polyvalente
- **Rachel** - `21m00Tcm4TlvDq8ikWAM` - Voix féminine naturelle
- **Adam** - `pNInz6obpgDQGcFmaJgB` - Voix masculine

## Configuration des paramètres vocaux

```typescript
const voiceSettings = {
  stability: 0.5,        // 0-1: Stabilité (0.5 = équilibré)
  similarity_boost: 0.75, // 0-1: Similarité à la voix (0.75 = recommandé)
  style: 0.0,            // 0-1: Style expressif (0 = neutre)
  use_speaker_boost: true // Amélioration de la clarté
};
```

## Intégration avec LiveCoreOrchestrator

```typescript
// Dans LiveCoreOrchestrator
import { TTSEngine } from '@angeline-live/elevenlabs-tts';

class LiveCoreOrchestrator {
  private ttsEngine: TTSEngine;

  constructor() {
    this.ttsEngine = new TTSEngine({
      apiKey: process.env.ELEVENLABS_API_KEY!,
      cacheDir: path.join(__dirname, '../../cache/tts'),
      autoPlay: true,
      volume: 80
    });

    this.ttsEngine.on('tts_started', () => {
      this.emit('reading_audio_started');
    });

    this.ttsEngine.on('tts_played', () => {
      this.emit('reading_audio_completed');
    });
  }

  async processReading(message: TikTokMessage) {
    // ... génération de la réponse ...
    
    // Parler la réponse
    await this.ttsEngine.speak(styledResponse, {
      blocking: false // Non-bloquant pour ne pas bloquer le live
    });
  }
}
```

## API Reference

### TTSEngine

#### Constructor
```typescript
new TTSEngine(config: TTSConfig)
```

#### Méthodes
- `speak(text: string, options?: TTSOptions & PlaybackOptions): Promise<Buffer>`
- `speakChunks(chunks: string[], options?: TTSOptions & PlaybackOptions): Promise<void>`
- `stop(): Promise<void>`
- `isPlaying(): boolean`
- `getVoices(): Promise<any>`
- `getUserInfo(): Promise<any>`
- `getCacheStats(): { count: number; totalSize: number; totalSizeMB: number }`
- `clearCache(): void`
- `setVolume(volume: number): void`
- `setAutoPlay(enabled: boolean): void`

#### Événements
- `tts_started` - Génération audio démarrée
- `tts_generated` - Audio généré
- `tts_played` - Lecture terminée
- `tts_stopped` - Lecture arrêtée
- `tts_error` - Erreur
- `cache_cleared` - Cache vidé

## Limites API ElevenLabs

- **Free Tier**: 10,000 caractères/mois
- **Starter**: 30,000 caractères/mois
- **Creator**: 100,000 caractères/mois
- **Pro**: 500,000 caractères/mois

Le cache permet de réutiliser les audios déjà générés et d'économiser votre quota.

## Dépannage

### Erreur "No audio player found"
**Linux uniquement**: Installer mpg123 ou ffmpeg
```bash
sudo apt-get install mpg123
# ou
sudo apt-get install ffmpeg
```

### Erreur "Access denied"
Vérifier que la clé API est valide:
```typescript
const userInfo = await tts.getUserInfo();
console.log(userInfo);
```

### Audio ne joue pas
- Vérifier le volume système
- Tester avec `blocking: true` pour debug
- Vérifier les logs `[AudioPlayer]`

## License

MIT
