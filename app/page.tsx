'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Crown, Gamepad2, Heart, Star, PartyPopper, Trophy, ExternalLink, X, Mail } from 'lucide-react';
import Link from 'next/link';

interface Vote {
  id: number;
  name: string;
  email?: string;
  choice: 'girl' | 'boy';
  timestamp: number;
  // Extended predictions
  birthDate?: string;
  birthTime?: string;
  weight?: number;
  height?: number;
  hairColor?: string;
  eyeColor?: string;
}

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

export default function Home() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<'girl' | 'boy' | null>(null);
  // Extended prediction fields
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load votes and config from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [votesRes, configRes] = await Promise.all([
          fetch('/api/votes'),
          fetch('/api/config'),
        ]);
        
        if (votesRes.ok) {
          const votesData = await votesRes.json();
          setVotes(votesData);
        }
        
        if (configRes.ok) {
          const configData = await configRes.json();
          setConfig(configData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh votes every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/votes');
        if (res.ok) {
          const data = await res.json();
          setVotes(data);
        }
      } catch (error) {
        console.error('Error refreshing votes:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const totalVotes = votes.length;
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;
  
  const girlPercent = totalVotes === 0 ? 50 : Math.round((girlVotes / totalVotes) * 100);
  const boyPercent = totalVotes === 0 ? 50 : Math.round((boyVotes / totalVotes) * 100);

  const handleVoteClick = () => {
    if (!name.trim()) {
      alert("Hé ! N'oublie pas de mettre ton prénom !");
      return;
    }
    if (!selectedChoice) {
      alert("Choisis ton équipe (Fille ou Garçon) !");
      return;
    }
    
    // Show predictions modal first
    setShowPredictionsModal(true);
  };

  const handleSubmitVote = async (skipEmail: boolean = false) => {
    try {
      const voteData: { 
        name: string; 
        choice: 'girl' | 'boy'; 
        email?: string;
        birthDate?: string;
        birthTime?: string;
        weight?: number;
        height?: number;
        hairColor?: string;
        eyeColor?: string;
      } = {
        name: name.trim(),
        choice: selectedChoice!,
      };

      if (!skipEmail && email.trim()) {
        voteData.email = email.trim();
      }

      // Add predictions if provided
      if (birthDate) voteData.birthDate = birthDate;
      if (birthTime) voteData.birthTime = birthTime;
      const parsedWeight = weight ? parseInt(weight, 10) : NaN;
      const parsedHeight = height ? parseInt(height, 10) : NaN;
      if (!isNaN(parsedWeight)) voteData.weight = parsedWeight;
      if (!isNaN(parsedHeight)) voteData.height = parsedHeight;
      if (hairColor) voteData.hairColor = hairColor;
      if (eyeColor) voteData.eyeColor = eyeColor;

      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
      });

      if (res.ok) {
        const newVote = await res.json();
        setVotes([newVote, ...votes]);
        setName('');
        setEmail('');
        setSelectedChoice(null);
        setBirthDate('');
        setBirthTime('');
        setWeight('');
        setHeight('');
        setHairColor('');
        setEyeColor('');
        setShowEmailModal(false);
        setShowPredictionsModal(false);
        setShowConfetti(true);
        
        // Reset confetti animation
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erreur lors de l'enregistrement du vote");
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert("Erreur lors de l'enregistrement du vote");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 text-purple-500 animate-bounce mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show reveal if configured
  if (config.isRevealed && config.actualGender) {
    const isGirl = config.actualGender === 'girl';
    return (
      <div className={`min-h-screen flex items-center justify-center ${isGirl ? 'bg-gradient-to-br from-pink-100 to-pink-200' : 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
        <div className="text-center px-4">
          <div className="mb-8">
            {isGirl ? (
              <Crown className="w-32 h-32 text-pink-500 mx-auto animate-bounce" fill="currentColor" />
            ) : (
              <Gamepad2 className="w-32 h-32 text-blue-500 mx-auto animate-bounce" fill="currentColor" />
            )}
          </div>
          <h1 className={`text-6xl font-black mb-4 ${isGirl ? 'text-pink-600' : 'text-blue-600'}`}>
            {isGirl ? "C'est une FILLE !" : "C'est un GARÇON !"} 🎉
          </h1>
          {config.babyName && config.babyName !== 'Bébé' && (
            <p className="text-3xl font-bold text-slate-700 mb-8">
              Bienvenue {config.babyName} !
            </p>
          )}
          <Link 
            href="/"
            className="inline-block bg-white text-slate-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Voir les pronostics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-200 text-slate-800 pb-12">
      
      {/* Header Festif */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 text-center border-b border-slate-100">
        <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center justify-center gap-2">
          <Baby className="text-purple-500" />
          Fille ou Garçon ?
        </h1>
        <p className="text-base text-slate-600 font-medium mt-1">
          Quel sera le genre de {config.babyName || 'Bébé'} ?
        </p>
        {config.parentNames && (
          <p className="text-sm text-slate-400 font-medium mt-1">
            {config.parentNames}
          </p>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-8">
        
        {/* Barre de Score / Stats */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-1 relative">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest px-4 py-2 text-slate-500">
            <span className="text-pink-500">Team Fille ({girlVotes})</span>
            <span className="text-blue-500">Team Garçon ({boyVotes})</span>
          </div>
          
          <div className="h-6 w-full flex rounded-full overflow-hidden bg-slate-100 relative">
             {/* Pink Bar */}
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out flex items-center justify-start pl-2"
              style={{ width: `${girlPercent}%` }}
            >
              {girlPercent > 10 && <span className="text-[10px] text-white font-bold">{girlPercent}%</span>}
            </div>
            
            {/* Blue Bar */}
            <div 
              className="h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${boyPercent}%` }}
            >
               {boyPercent > 10 && <span className="text-[10px] text-white font-bold">{boyPercent}%</span>}
            </div>

            {/* Center VS Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border border-slate-100 z-10">
              <div className="bg-slate-800 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full">
                VS
              </div>
            </div>
          </div>
        </div>

        {/* Zone de Vote */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 border border-slate-100">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-700">À toi de jouer !</h2>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom..." 
              className="w-full text-center text-lg font-medium border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bouton Fille - Video Game Style */}
            <button
              onClick={() => setSelectedChoice('girl')}
              className={`relative group overflow-hidden rounded-2xl p-6 transition-all duration-300 border-4 flex flex-col items-center gap-3 transform
                ${selectedChoice === 'girl' 
                  ? 'border-pink-500 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50 shadow-[0_0_25px_rgba(236,72,153,0.5)] scale-110 -rotate-2' 
                  : 'border-slate-200 hover:border-pink-300 bg-gradient-to-br from-white to-slate-50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-white hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 hover:-rotate-1'
                }`}
            >
              {/* Glow effect background */}
              {selectedChoice === 'girl' && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-transparent to-pink-600/20 animate-pulse"></div>
              )}
              
              {/* Icon with gaming style */}
              <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                selectedChoice === 'girl' 
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg shadow-pink-500/50 animate-pulse' 
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 group-hover:from-pink-200 group-hover:to-pink-300 group-hover:text-pink-600'
              }`}>
                <Crown size={40} fill={selectedChoice === 'girl' ? "currentColor" : "none"} strokeWidth={2.5} />
              </div>
              
              {/* Label with arcade font style */}
              <span className={`font-black uppercase tracking-widest text-xl transition-all ${
                selectedChoice === 'girl' 
                  ? 'text-pink-600 drop-shadow-[0_2px_4px_rgba(236,72,153,0.5)]' 
                  : 'text-slate-400 group-hover:text-pink-500'
              }`}>
                Fille
              </span>
              
              {/* Selection indicator - Game style */}
              {selectedChoice === 'girl' && (
                <>
                  <div className="absolute top-3 right-3 animate-bounce">
                    <Heart size={20} className="text-pink-500 drop-shadow-lg" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </>
              )}
              
              {/* Hover sparkle effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-4 right-8 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 left-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              </div>
            </button>

            {/* Bouton Garçon - Video Game Style */}
            <button
              onClick={() => setSelectedChoice('boy')}
              className={`relative group overflow-hidden rounded-2xl p-6 transition-all duration-300 border-4 flex flex-col items-center gap-3 transform
                ${selectedChoice === 'boy' 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 shadow-[0_0_25px_rgba(59,130,246,0.5)] scale-110 rotate-2' 
                  : 'border-slate-200 hover:border-blue-300 bg-gradient-to-br from-white to-slate-50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 hover:rotate-1'
                }`}
            >
              {/* Glow effect background */}
              {selectedChoice === 'boy' && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-blue-600/20 animate-pulse"></div>
              )}
              
              {/* Icon with gaming style */}
              <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                selectedChoice === 'boy' 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/50 animate-pulse' 
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 group-hover:from-blue-200 group-hover:to-blue-300 group-hover:text-blue-600'
              }`}>
                <Gamepad2 size={40} fill={selectedChoice === 'boy' ? "currentColor" : "none"} strokeWidth={2.5} />
              </div>
              
              {/* Label with arcade font style */}
              <span className={`font-black uppercase tracking-widest text-xl transition-all ${
                selectedChoice === 'boy' 
                  ? 'text-blue-600 drop-shadow-[0_2px_4px_rgba(59,130,246,0.5)]' 
                  : 'text-slate-400 group-hover:text-blue-500'
              }`}>
                Garçon
              </span>
              
              {/* Selection indicator - Game style */}
              {selectedChoice === 'boy' && (
                <>
                  <div className="absolute top-3 right-3 animate-bounce">
                    <Star size={20} className="text-blue-500 drop-shadow-lg" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </>
              )}
              
              {/* Hover sparkle effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-4 left-8 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              </div>
            </button>
          </div>

          <button
            onClick={handleVoteClick}
            disabled={!name || !selectedChoice}
            className={`relative w-full py-4 rounded-xl font-black text-xl uppercase tracking-wider shadow-lg transform transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden
              ${(!name || !selectedChoice) 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)] hover:-translate-y-1 active:scale-95 bg-[length:200%_100%] animate-gradient'
              }`}
            style={(!name || !selectedChoice) ? {} : {
              animation: 'gradient 3s ease infinite'
            }}
          >
            {/* Animated background effect */}
            {name && selectedChoice && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-pink-400"></div>
              </>
            )}
            
            <span className="relative z-10 flex items-center gap-3">
              {showConfetti ? (
                <PartyPopper className="animate-spin" size={24} />
              ) : (
                <Trophy size={24} className="animate-bounce" />
              )}
              Valider mon vote !
              {name && selectedChoice && <Star size={20} className="animate-pulse" fill="currentColor" />}
            </span>
          </button>
        </div>

        {/* Liste des récents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Derniers pronostics</h3>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600 font-medium">{votes.length} votes</span>
          </div>

          <div className="space-y-3">
            {votes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic">
                Aucun vote pour l&apos;instant. Sois le premier !
              </div>
            ) : (
              votes.map((vote) => (
                <div 
                  key={vote.id} 
                  className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50 animate-in"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm
                      ${vote.choice === 'girl' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                    `}>
                      {vote.choice === 'girl' ? <Crown size={18} /> : <Gamepad2 size={18} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{vote.name}</span>
                      <span className={`text-xs font-medium uppercase ${vote.choice === 'girl' ? 'text-pink-400' : 'text-blue-400'}`}>
                        Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {new Date(vote.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Birth List Link - Moved here after votes */}
        {config.birthListLink && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-slate-600">
                Envie de nous gâter ? 🎁
              </p>
              <a
                href={config.birthListLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <ExternalLink size={18} />
                Voir la liste de naissance
              </a>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-8 pb-4 text-center space-y-2">
          <Link 
            href="/results"
            className="text-sm text-purple-600 hover:text-purple-700 transition-colors block font-medium"
          >
            📊 Voir les statistiques
          </Link>
          <Link 
            href="/admin"
            className="text-xs text-slate-300 hover:text-slate-400 transition-colors block"
          >
            Administration
          </Link>
        </div>

      </div>

      {/* Predictions Modal */}
      {showPredictionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in my-8">
            <button
              onClick={() => setShowPredictionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Baby className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Fais tes pronostics ! 🎯
              </h3>
              <p className="text-sm text-slate-500">
                Ces informations sont optionnelles
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Heure de naissance
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Poids (grammes)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="ex: 3400"
                    min="500"
                    max="10000"
                    className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="ex: 50"
                    min="20"
                    max="100"
                    className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Couleur des cheveux
                </label>
                <select
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                >
                  <option value="">Sélectionne...</option>
                  <option value="Bruns">Bruns</option>
                  <option value="Blonds">Blonds</option>
                  <option value="Roux">Roux</option>
                  <option value="Noirs">Noirs</option>
                  <option value="Châtains">Châtains</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Couleur des yeux
                </label>
                <select
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                >
                  <option value="">Sélectionne...</option>
                  <option value="Bleus">Bleus</option>
                  <option value="Verts">Verts</option>
                  <option value="Marrons">Marrons</option>
                  <option value="Noisette">Noisette</option>
                  <option value="Gris">Gris</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Continuer
              </button>
              
              <button
                onClick={() => setShowPredictionsModal(false)}
                className="w-full bg-slate-100 text-slate-600 py-2 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Reste informé(e) ! 📧
              </h3>
              <p className="text-sm text-slate-500">
                Laisse-nous ton email pour recevoir des nouvelles (optionnel)
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton-email@exemple.com"
                className="w-full text-center text-base border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-300"
              />

              <div className="space-y-2">
                <button
                  onClick={() => handleSubmitVote(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Envoyer mon vote avec email
                </button>
                
                <button
                  onClick={() => handleSubmitVote(true)}
                  className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Continuer sans email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Overlay Simple (CSS-based feedback) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="absolute text-6xl animate-bounce">🎉</div>
        </div>
      )}
    </div>
  );
}
