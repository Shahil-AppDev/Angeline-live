'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const LIVE_CORE_API = process.env.NEXT_PUBLIC_LIVE_CORE_API_URL || '/api';

interface LiveState {
  isActive: boolean;
  mode: 'AUTO' | 'FORCED';
  forcedOracleId?: string;
  currentReading?: any;
  stats: {
    totalReadings: number;
    totalMessages: number;
    totalGifts: number;
    totalFollows: number;
  };
}

interface Oracle {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOracle, setSelectedOracle] = useState('');
  const [, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchOracles();

    const newSocket = io('/', {
      path: '/socket.io/'
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setLoading(false);
    });

    newSocket.on('state_update', (state: LiveState) => {
      setLiveState(state);
    });

    newSocket.on('reading_started', (data: any) => {
      console.log('🔮 Reading started:', data);
    });

    newSocket.on('reading_completed', (data: any) => {
      console.log('✅ Reading completed:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  const fetchOracles = async () => {
    try {
      const oraclesRes = await axios.get(`${LIVE_CORE_API}/oracles`);
      setOracles(oraclesRes.data);
    } catch (error) {
      console.error('Failed to fetch oracles:', error);
    }
  };

  const handleStartLive = async () => {
    try {
      await axios.post(`${LIVE_CORE_API}/live/start`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur');
    }
  };

  const handleStopLive = async () => {
    try {
      await axios.post(`${LIVE_CORE_API}/live/stop`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur');
    }
  };

  const handleSetMode = async (mode: 'AUTO' | 'FORCED') => {
    try {
      await axios.post(`${LIVE_CORE_API}/live/mode`, {
        mode,
        oracleId: mode === 'FORCED' ? selectedOracle : undefined
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur');
    }
  };

  const handleTestDraw = async () => {
    try {
      await axios.post(`${LIVE_CORE_API}/live/test-draw`, {
        username: 'TestUser',
        message: 'Quelle est ma destinée amoureuse ?'
      });
      alert('✅ Test draw lancé ! Vérifie OBS et les logs.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors du test draw');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gold font-title">
            🔮 Angeline NJ
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-mystic-bg2/80 hover:bg-mystic-bg2 border border-[rgba(139,92,246,0.3)] rounded-lg transition text-mystic-text"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <div className="text-mystic-muted text-sm mb-2">Status</div>
            <div className="text-2xl font-bold">
              {liveState?.isActive ? (
                <span className="text-green-400">🟢 LIVE</span>
              ) : (
                <span className="text-red-400">🔴 OFF</span>
              )}
            </div>
          </div>

          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <div className="text-mystic-muted text-sm mb-2">Tirages</div>
            <div className="text-2xl font-bold text-gold-2">
              {liveState?.stats.totalReadings || 0}
            </div>
          </div>

          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <div className="text-mystic-muted text-sm mb-2">Messages</div>
            <div className="text-2xl font-bold text-gold-1">
              {liveState?.stats.totalMessages || 0}
            </div>
          </div>

          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <div className="text-mystic-muted text-sm mb-2">Cadeaux</div>
            <div className="text-2xl font-bold text-gold-2">
              {liveState?.stats.totalGifts || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gold font-title">Contrôles Live</h2>
            
            <div className="space-y-4">
              {!liveState?.isActive ? (
                <button
                  onClick={handleStartLive}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  ▶️ Démarrer le Live
                </button>
              ) : (
                <button
                  onClick={handleStopLive}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  ⏹️ Arrêter le Live
                </button>
              )}

              <div className="border-t border-[rgba(139,92,246,0.15)] pt-4">
                <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                  <div className="text-xs text-mystic-muted mb-1">Oracle Actif (MVP)</div>
                  <div className="text-sm text-gold-2 font-semibold">
                    🔮 Oracle Mystica Sentimental
                  </div>
                  <div className="text-xs text-mystic-muted mt-1">
                    102 cartes • Amour & Relations
                  </div>
                </div>
              </div>

              {liveState?.isActive && (
                <div className="border-t border-[rgba(139,92,246,0.15)] pt-4">
                  <button
                    onClick={handleTestDraw}
                    className="w-full bg-gradient-to-r from-gold-3 to-gold-2 hover:shadow-[0_0_20px_rgba(214,168,74,0.4)] text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    🧪 Test Draw
                  </button>
                  <p className="text-xs text-mystic-muted mt-2 text-center">
                    Simule un tirage de test
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-mystic-bg2/80 backdrop-blur-xl border border-[rgba(139,92,246,0.15)] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gold font-title">Tirage en cours</h2>
            
            {liveState?.currentReading ? (
              <div className="space-y-4">
                <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                  <div className="text-xs text-mystic-muted mb-1">Utilisateur</div>
                  <div className="font-medium text-mystic-text">@{liveState.currentReading.username}</div>
                </div>
                
                <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                  <div className="text-xs text-mystic-muted mb-1">Question</div>
                  <div className="text-sm text-mystic-text italic">&ldquo;{liveState.currentReading.question}&rdquo;</div>
                </div>
                
                <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                  <div className="text-xs text-mystic-muted mb-1">Oracle</div>
                  <div className="text-sm text-gold-2 font-semibold">{liveState.currentReading.oracle_id}</div>
                </div>
                
                <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                  <div className="text-xs text-mystic-muted mb-2">Cartes Tirées</div>
                  <div className="grid grid-cols-3 gap-2">
                    {liveState.currentReading.cards?.map((c: any, i: number) => (
                      <div key={i} className="bg-gold-3/20 rounded p-2 text-center border border-gold-2/30">
                        <div className="text-xs text-gold-1">Carte</div>
                        <div className="text-lg font-bold text-gold-2">{c.number}</div>
                        {c.meaning && (
                          <div className="text-xs text-mystic-text mt-1 truncate" title={c.meaning}>
                            {c.meaning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {liveState.currentReading.interpretation && (
                  <div className="bg-mystic-bg/40 rounded-lg p-3 border border-[rgba(139,92,246,0.1)]">
                    <div className="text-xs text-mystic-muted mb-2">Interprétation</div>
                    <div className="text-sm text-mystic-text leading-relaxed">
                      {liveState.currentReading.interpretation}
                    </div>
                  </div>
                )}

                {liveState.currentReading.response && (
                  <div className="bg-gold-3/10 rounded-lg p-3 border border-gold-2/20">
                    <div className="text-xs text-gold-1 mb-2">✨ Réponse Envoyée</div>
                    <div className="text-sm text-mystic-text leading-relaxed">
                      {liveState.currentReading.response}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-mystic-muted text-center py-8">
                <div className="text-4xl mb-2">🔮</div>
                <div>Aucun tirage en cours</div>
                <div className="text-xs mt-1">Les tirages apparaîtront ici en temps réel</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
