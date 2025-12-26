'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, Save, Trash2, Eye, LogOut, 
  Baby, Heart, Settings, Users
} from 'lucide-react';

interface AppConfig {
  babyName?: string;
  parentNames?: string;
  girlIcon?: string;
  boyIcon?: string;
  girlColor?: string;
  boyColor?: string;
  birthListLink?: string;
  revealDate?: string;
  isRevealed?: boolean;
  actualGender?: 'girl' | 'boy' | null;
}

interface Vote {
  id: number;
  name: string;
  email?: string;
  choice: 'girl' | 'boy';
  timestamp: number;
  birthDate?: string;
  birthTime?: string;
  weight?: number;
  height?: number;
  hairColor?: string;
  eyeColor?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>({});
  const [votes, setVotes] = useState<Vote[]>([]);
  const [saveStatus, setSaveStatus] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      const [configRes, votesRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/votes'),
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        setPassword('');
        loadData();
      } else {
        alert('Mot de passe incorrect');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsAuthenticated(false);
    router.push('/');
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveStatus('✓ Sauvegardé !');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('✗ Erreur');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('✗ Erreur');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleClearVotes = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les votes ?')) {
      return;
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setVotes([]);
        alert('Tous les votes ont été supprimés');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Administration</h1>
            <p className="text-sm text-slate-500 text-sm">Accès réservé aux administrateurs</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="Entrez le mot de passe admin"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalVotes = votes.length;
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Administration</h1>
              <p className="text-xs text-slate-500">Panneau de configuration</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalVotes}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Total votes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{girlVotes}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Team Fille</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{boyVotes}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Team Garçon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings size={20} />
            Configuration de l&apos;application
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Surnom du bébé
                </label>
                <input
                  type="text"
                  value={config.babyName || ''}
                  onChange={(e) => setConfig({ ...config, babyName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="ex: Bébé, Zouzounette, Petit Pois..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Affiché dans &quot;Quel sera le genre de...&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Noms des parents
                </label>
                <input
                  type="text"
                  value={config.parentNames || ''}
                  onChange={(e) => setConfig({ ...config, parentNames: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="ex: Papa & Maman"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lien vers la liste de naissance
              </label>
              <input
                type="url"
                value={config.birthListLink || ''}
                onChange={(e) => setConfig({ ...config, birthListLink: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="https://..."
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Révélation du sexe</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRevealed"
                    checked={config.isRevealed || false}
                    onChange={(e) => setConfig({ ...config, isRevealed: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isRevealed" className="text-sm font-medium text-slate-700">
                    Révéler le sexe du bébé
                  </label>
                </div>

                {config.isRevealed && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sexe du bébé
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="actualGender"
                          value="girl"
                          checked={config.actualGender === 'girl'}
                          onChange={() => setConfig({ ...config, actualGender: 'girl' })}
                          className="w-4 h-4 text-pink-600 border-slate-300 focus:ring-pink-500"
                        />
                        <span className="text-sm text-slate-700">Fille</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="actualGender"
                          value="boy"
                          checked={config.actualGender === 'boy'}
                          onChange={() => setConfig({ ...config, actualGender: 'boy' })}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Garçon</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Enregistrer les modifications
                {saveStatus && <span className="ml-2">{saveStatus}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Votes Management */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} />
              Gestion des votes
            </h2>
            <button
              onClick={handleClearVotes}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <Trash2 size={16} />
              Tout supprimer
            </button>
          </div>

          <div className="space-y-2">
            {votes.length === 0 ? (
              <p className="text-center py-8 text-slate-400 italic">Aucun vote pour l&apos;instant</p>
            ) : (
              votes.map((vote) => {
                const hasExtendedPredictions = vote.birthDate || vote.birthTime || vote.weight || vote.height || vote.hairColor || vote.eyeColor;
                
                return (
                  <div
                    key={vote.id}
                    className="p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                          ${vote.choice === 'girl' ? 'bg-pink-500' : 'bg-blue-500'}
                        `}>
                          {vote.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{vote.name}</p>
                          {vote.email && (
                            <p className="text-xs text-slate-500">{vote.email}</p>
                          )}
                          <p className={`text-xs ${vote.choice === 'girl' ? 'text-pink-500' : 'text-blue-500'}`}>
                            Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(vote.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    {hasExtendedPredictions && (
                      <div className="ml-11 mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600">
                        {vote.birthDate && (
                          <div>
                            <span className="font-medium">Date:</span> {new Date(vote.birthDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        {vote.birthTime && (
                          <div>
                            <span className="font-medium">Heure:</span> {vote.birthTime}
                          </div>
                        )}
                        {vote.weight && (
                          <div>
                            <span className="font-medium">Poids:</span> {vote.weight}g
                          </div>
                        )}
                        {vote.height && (
                          <div>
                            <span className="font-medium">Taille:</span> {vote.height}cm
                          </div>
                        )}
                        {vote.hairColor && (
                          <div>
                            <span className="font-medium">Cheveux:</span> {vote.hairColor}
                          </div>
                        )}
                        {vote.eyeColor && (
                          <div>
                            <span className="font-medium">Yeux:</span> {vote.eyeColor}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Liens rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              Voir la page publique
            </button>
            <button
              onClick={() => router.push('/results')}
              className="bg-purple-100 text-purple-700 py-3 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={18} />
              Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
