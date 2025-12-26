'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Star, PartyPopper, Trophy, ExternalLink, X, Mail } from 'lucide-react';
import Link from 'next/link';
import BabyAvatar from '@/components/BabyAvatar';

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
  dueDate?: string;
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
  const [weightTouched, setWeightTouched] = useState(false);
  const [height, setHeight] = useState('');
  const [heightTouched, setHeightTouched] = useState(false);
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Baby-friendly ranges for sliders (UI only; API validation remains wider)
  const WEIGHT_MIN = 500;
  const WEIGHT_MAX = 6000;
  const WEIGHT_STEP = 50;
  const WEIGHT_DEFAULT = 3300;

  const HEIGHT_MIN = 25;
  const HEIGHT_MAX = 60;
  const HEIGHT_STEP = 1;
  const HEIGHT_DEFAULT = 50;

  const hairOptions = [
    { value: 'Blonds', color: '#f5e6b3' },
    { value: 'Châtains', color: '#a67c52' },
    { value: 'Bruns', color: '#8b6f47' },
    { value: 'Roux', color: '#d4856a' },
    { value: 'Noirs', color: '#4a4a4a' },
  ];

  const eyeOptions = [
    { value: 'Bleus', color: '#6ba3d4' },
    { value: 'Verts', color: '#7ab88f' },
    { value: 'Gris', color: '#a0aec0' },
    { value: 'Noisette', color: '#b8956a' },
    { value: 'Marrons', color: '#a67c52' },
  ];

  const selectedHairHex = hairOptions.find(o => o.value === hairColor)?.color;
  const selectedEyeHex = eyeOptions.find(o => o.value === eyeColor)?.color;

  const parseISODate = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const dueDateObj = parseISODate(config.dueDate || '');
  const birthDateObj = parseISODate(birthDate);
  const daysFromDueDate = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

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
    
    // Préremplir la date de naissance avec la date du terme si elle existe
    if (dueDateObj && !birthDate) {
      const year = dueDateObj.getFullYear();
      const month = String(dueDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dueDateObj.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
    }
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
      const parsedWeight = weightTouched && weight ? parseInt(weight, 10) : NaN;
      const parsedHeight = heightTouched && height ? parseInt(height, 10) : NaN;
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
        setWeightTouched(false);
        setHeight('');
        setHeightTouched(false);
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
            <div className={`text-[128px] mx-auto animate-bounce leading-none ${isGirl ? 'text-pink-500' : 'text-blue-500'}`}>
              {isGirl ? '♀' : '♂'}
            </div>
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
            {/* Bouton Fille */}
            <button
              onClick={() => setSelectedChoice('girl')}
              className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 border-4 flex flex-col items-center gap-2
                ${selectedChoice === 'girl' 
                  ? 'border-pink-500 bg-pink-50 shadow-pink-200 shadow-lg scale-105' 
                  : 'border-slate-100 hover:border-pink-200 bg-white hover:bg-pink-50 text-slate-400 grayscale hover:grayscale-0'
                }`}
            >
              <div className={`p-3 rounded-full ${selectedChoice === 'girl' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <div className="text-3xl font-bold leading-none">♀</div>
              </div>
              <span className={`font-bold uppercase tracking-wider ${selectedChoice === 'girl' ? 'text-pink-600' : 'text-slate-400'}`}>
                Fille
              </span>
              {selectedChoice === 'girl' && (
                <div className="absolute top-2 right-2 animate-bounce">
                  <Star size={16} className="text-pink-400" fill="currentColor" />
                </div>
              )}
            </button>

            {/* Bouton Garçon */}
            <button
              onClick={() => setSelectedChoice('boy')}
              className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 border-4 flex flex-col items-center gap-2
                ${selectedChoice === 'boy' 
                  ? 'border-blue-500 bg-blue-50 shadow-blue-200 shadow-lg scale-105' 
                  : 'border-slate-100 hover:border-blue-200 bg-white hover:bg-blue-50 text-slate-400 grayscale hover:grayscale-0'
                }`}
            >
              <div className={`p-3 rounded-full ${selectedChoice === 'boy' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <div className="text-3xl font-bold leading-none">♂</div>
              </div>
              <span className={`font-bold uppercase tracking-wider ${selectedChoice === 'boy' ? 'text-blue-600' : 'text-slate-400'}`}>
                Garçon
              </span>
              {selectedChoice === 'boy' && (
                <div className="absolute top-2 right-2 animate-bounce">
                  <Star size={16} className="text-blue-400" fill="currentColor" />
                </div>
              )}
            </button>
          </div>

          <button
            onClick={handleVoteClick}
            disabled={!name || !selectedChoice}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2
              ${(!name || !selectedChoice) 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1'
              }`}
          >
            {showConfetti ? <PartyPopper className="animate-spin" /> : <Trophy size={20} />}
            Valider mon vote !
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm text-2xl font-bold leading-none
                      ${vote.choice === 'girl' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                    `}>
                      {vote.choice === 'girl' ? '♀' : '♂'}
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
                Tous les champs sont obligatoires
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
                  {dueDateObj && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      <p>
                        Terme: <span className="font-medium text-slate-600">{dueDateObj.toLocaleDateString('fr-FR')}</span>
                      </p>
                      {birthDateObj && (
                        <p>
                          {(() => {
                            const delta = daysFromDueDate(birthDateObj, dueDateObj);
                            if (delta === 0) return 'Indication: Jour J (terme)';
                            if (delta < 0) return `Indication: J${delta} (${Math.abs(delta)} jour(s) avant)`;
                            return `Indication: J+${delta} (${delta} jour(s) après)`;
                          })()}
                        </p>
                      )}
                    </div>
                  )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Poids (grammes)
                    </label>
                    {(weightTouched || weight) && (
                      <button
                        type="button"
                        onClick={() => {
                          setWeight('');
                          setWeightTouched(false);
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                  <div className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {weightTouched ? `${weight}g` : <span className="text-slate-400 font-medium">Non renseigné</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {WEIGHT_MIN}–{WEIGHT_MAX}g
                      </p>
                    </div>
                    <input
                      type="range"
                      min={WEIGHT_MIN}
                      max={WEIGHT_MAX}
                      step={WEIGHT_STEP}
                      value={weightTouched ? weight : String(WEIGHT_DEFAULT)}
                      onChange={(e) => {
                        setWeightTouched(true);
                        setWeight(e.target.value);
                      }}
                      className="w-full mt-2 accent-purple-600"
                      aria-label="Poids du bébé en grammes"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Taille (cm)
                    </label>
                    {(heightTouched || height) && (
                      <button
                        type="button"
                        onClick={() => {
                          setHeight('');
                          setHeightTouched(false);
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                  <div className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {heightTouched ? `${height}cm` : <span className="text-slate-400 font-medium">Non renseigné</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {HEIGHT_MIN}–{HEIGHT_MAX}cm
                      </p>
                    </div>
                    <input
                      type="range"
                      min={HEIGHT_MIN}
                      max={HEIGHT_MAX}
                      step={HEIGHT_STEP}
                      value={heightTouched ? height : String(HEIGHT_DEFAULT)}
                      onChange={(e) => {
                        setHeightTouched(true);
                        setHeight(e.target.value);
                      }}
                      className="w-full mt-2 accent-purple-600"
                      aria-label="Taille du bébé en centimètres"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Couleur des cheveux
                  </label>
                  {hairColor && (
                    <button
                      type="button"
                      onClick={() => setHairColor('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="w-full border-2 border-slate-200 rounded-lg px-3 py-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {hairColor ? hairColor : <span className="text-slate-400 font-medium">Non renseigné</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">Choisis une couleur</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {hairOptions.map((opt) => {
                      const isSelected = hairColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHairColor(opt.value)}
                          className={
                            `h-10 w-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ` +
                            (isSelected
                              ? 'border-white ring-2 ring-purple-400 shadow'
                              : 'border-slate-200 hover:border-slate-300')
                          }
                          style={{ backgroundColor: opt.color }}
                          aria-label={`Cheveux: ${opt.value}`}
                          aria-pressed={isSelected}
                          title={opt.value}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Couleur des yeux
                  </label>
                  {eyeColor && (
                    <button
                      type="button"
                      onClick={() => setEyeColor('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="w-full border-2 border-slate-200 rounded-lg px-3 py-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {eyeColor ? eyeColor : <span className="text-slate-400 font-medium">Non renseigné</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">Choisis une couleur</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {eyeOptions.map((opt) => {
                      const isSelected = eyeColor === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEyeColor(opt.value)}
                          className={
                            `h-10 w-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ` +
                            (isSelected
                              ? 'border-white ring-2 ring-purple-400 shadow'
                              : 'border-slate-200 hover:border-slate-300')
                          }
                          style={{ backgroundColor: opt.color }}
                          aria-label={`Yeux: ${opt.value}`}
                          aria-pressed={isSelected}
                          title={opt.value}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aperçu</p>
                  <p className="text-[10px] text-slate-400">{selectedChoice === 'girl' ? 'Fille' : selectedChoice === 'boy' ? 'Garçon' : '—'}</p>
                </div>
                <div className="flex justify-center">
                  <BabyAvatar 
                    hairColor={selectedHairHex} 
                    eyeColor={selectedEyeHex} 
                    gender={selectedChoice || undefined}
                    size={96}
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <span>
                    Cheveux: <span className="font-medium text-slate-600">{hairColor || '—'}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    Yeux: <span className="font-medium text-slate-600">{eyeColor || '—'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={!birthDate || !birthTime || !weight || !height || !hairColor || !eyeColor}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:-translate-y-0"
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
