'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      localStorage.setItem('admin_token', response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full bg-mystic-bg2/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-[rgba(139,92,246,0.15)]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold font-title">
            🔮 Angeline NJ
          </h1>
          <p className="text-mystic-muted mt-2 font-body">Live Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-mystic-text mb-2 font-body">
              Utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-mystic-bg/60 border border-[rgba(139,92,246,0.3)] rounded-lg focus:ring-2 focus:ring-gold-2 focus:border-transparent outline-none transition text-mystic-text"
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mystic-text mb-2 font-body">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-mystic-bg/60 border border-[rgba(139,92,246,0.3)] rounded-lg focus:ring-2 focus:ring-gold-2 focus:border-transparent outline-none transition text-mystic-text"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-3 to-gold-2 hover:shadow-[0_0_20px_rgba(214,168,74,0.4)] text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <span className="relative z-10">{loading ? 'Connexion...' : 'Se connecter'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
