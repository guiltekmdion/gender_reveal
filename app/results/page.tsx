'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Crown, Gamepad2, Calendar, Clock, Weight, Ruler, Palette, Eye, ArrowLeft, Users, Zap, Trophy } from 'lucide-react';
import Link from 'next/link';

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

interface AppConfig {
  babyName?: string;
  parentNames?: string;
}

// Composant Roue de Couleurs - Style Gaming
const ColorWheel = ({ 
  data, 
  title, 
  icon: Icon,
  colors 
}: { 
  data: Record<string, number>; 
  title: string; 
  icon: React.ElementType;
  colors: Record<string, string>;
}) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  
  // Calculate segments for pie chart
  const segments = entries.reduce((acc, [color, count]) => {
    const percent = (count / total) * 100;
    const startPercent = acc.length > 0 ? acc[acc.length - 1].startPercent + acc[acc.length - 1].percent : 0;
    return [...acc, { color, count, percent, startPercent }];
  }, [] as Array<{ color: string; count: number; percent: number; startPercent: number }>);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/50">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-8">
          {/* Pie Chart - Gaming Style */}
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
              {/* Outer glow ring */}
              <circle
                cx="80"
                cy="80"
                r="75"
                fill="none"
                stroke="rgba(168, 85, 247, 0.3)"
                strokeWidth="2"
                className="animate-pulse"
              />
              
              {/* Pie segments */}
              {segments.map(({ color, percent, startPercent }) => {
                const startAngle = (startPercent / 100) * 360;
                const endAngle = ((startPercent + percent) / 100) * 360;
                const largeArcFlag = percent > 50 ? 1 : 0;
                
                const startX = 80 + 65 * Math.cos((startAngle - 90) * Math.PI / 180);
                const startY = 80 + 65 * Math.sin((startAngle - 90) * Math.PI / 180);
                const endX = 80 + 65 * Math.cos((endAngle - 90) * Math.PI / 180);
                const endY = 80 + 65 * Math.sin((endAngle - 90) * Math.PI / 180);

                return (
                  <g key={color}>
                    <path
                      d={`M 80 80 L ${startX} ${startY} A 65 65 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                      fill={colors[color] || '#94a3b8'}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:opacity-80"
                      style={{
                        filter: `drop-shadow(0 0 10px ${colors[color] || '#94a3b8'})`
                      }}
                    />
                  </g>
                );
              })}
              
              {/* Center circle - arcade style */}
              <circle
                cx="80"
                cy="80"
                r="35"
                fill="url(#centerGradient)"
                stroke="#8b5cf6"
                strokeWidth="3"
              />
              
              <defs>
                <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Icon className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          {/* Legend - Gaming style */}
          <div className="flex-1 space-y-2">
            {entries.map(([color, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={color} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border-2 border-white/50 shadow-lg"
                        style={{ 
                          backgroundColor: colors[color] || '#94a3b8',
                          boxShadow: `0 0 10px ${colors[color] || '#94a3b8'}`
                        }}
                      ></div>
                      <span className="text-white font-bold text-sm uppercase tracking-wide">
                        {color}
                      </span>
                    </div>
                    <span className="text-purple-300 font-black text-lg">
                      {percent}%
                    </span>
                  </div>
                  {/* Progress bar - arcade style */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-purple-500/30">
                    <div 
                      className="h-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${colors[color]}, ${colors[color]}dd)`,
                        boxShadow: `0 0 10px ${colors[color]}`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Score/Moyenne - Style Arcade
const ArcadeStatCard = ({ 
  value, 
  label, 
  unit,
  icon: Icon,
  color,
  votes
}: {
  value: number;
  label: string;
  unit: string;
  icon: React.ElementType;
  color: string;
  votes: number;
}) => {
  return (
    <div className={`relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border-4 ${color} shadow-[0_0_30px] overflow-hidden group hover:scale-105 transition-all duration-300`}>
      {/* Animated scanlines effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent animate-scan"></div>
      </div>
      
      {/* Pixel corners - retro gaming style */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-4 border-t-4 border-white/30"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-r-4 border-t-4 border-white/30"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-4 border-b-4 border-white/30"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-4 border-b-4 border-white/30"></div>
      
      <div className="relative z-10 text-center">
        {/* Icon with glow */}
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${color.includes('yellow') ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-pink-500'} shadow-lg mb-4 group-hover:animate-bounce`}>
          <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Value - Digital display style */}
        <div className="mb-2">
          <div className="inline-block px-4 py-2 bg-black/50 rounded-xl border-2 border-white/20 mb-2">
            <span className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] tracking-wider font-mono">
              {value}
            </span>
            <span className="text-2xl font-black text-purple-300 ml-1">{unit}</span>
          </div>
        </div>
        
        {/* Label */}
        <p className="text-white font-bold uppercase tracking-widest text-sm mb-1">
          {label}
        </p>
        <div className="flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
          <p className="text-purple-300 text-xs font-medium">
            {votes} vote(s)
          </p>
          <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  );
};

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState(true);

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
  }, []);

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

  // Calculate statistics
  const totalVotes = votes.length;
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;

  // Calculate averages for numerical predictions
  const votesWithWeight = votes.filter(v => v.weight);
  const averageWeight = votesWithWeight.length > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / votesWithWeight.length)
    : null;

  const votesWithHeight = votes.filter(v => v.height);
  const averageHeight = votesWithHeight.length > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / votesWithHeight.length)
    : null;

  // Calculate most common predictions (not displayed individually, used for color wheels)
  const hairColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.hairColor) {
      hairColorCounts[v.hairColor] = (hairColorCounts[v.hairColor] || 0) + 1;
    }
  });

  const eyeColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.eyeColor) {
      eyeColorCounts[v.eyeColor] = (eyeColorCounts[v.eyeColor] || 0) + 1;
    }
  });

  // Date predictions
  const dateCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.birthDate) {
      dateCounts[v.birthDate] = (dateCounts[v.birthDate] || 0) + 1;
    }
  });
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]);

  // Color mappings for hair and eyes
  const hairColorMap: Record<string, string> = {
    'Bruns': '#4a2c18',
    'Blonds': '#f5e6d3',
    'Roux': '#d4572a',
    'Noirs': '#1a1a1a',
    'Châtains': '#8b6f47'
  };

  const eyeColorMap: Record<string, string> = {
    'Bleus': '#4a90e2',
    'Verts': '#2ecc71',
    'Marrons': '#8b5a2b',
    'Noisette': '#a67c52',
    'Gris': '#95a5a6'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans pb-12">
      {/* Header - Gaming Style */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 shadow-xl p-4 sticky top-0 z-10 text-center border-b-4 border-purple-500">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors mb-2 font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider flex items-center justify-center gap-3 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            <Trophy className="text-yellow-400 animate-bounce" fill="currentColor" />
            Statistiques & Pronostics
            <Trophy className="text-yellow-400 animate-bounce" fill="currentColor" style={{animationDelay: '0.2s'}} />
          </h1>
          <p className="text-base text-purple-200 font-bold mt-2 uppercase tracking-wide">
            🎮 Les moyennes pour {config.babyName || 'Bébé'} 🎮
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Gender Vote Stats - Gaming Style */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden p-8 border-4 border-purple-500 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
          
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
            <Baby size={24} className="text-purple-400" />
            Vote Fille / Garçon
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-pink-900 to-pink-800 rounded-2xl p-6 text-center border-4 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform">
              <Crown className="w-16 h-16 text-pink-400 mx-auto mb-3 animate-pulse" fill="currentColor" />
              <p className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{girlVotes}</p>
              <p className="text-xl text-pink-300 font-black uppercase tracking-wider mt-2">Team Fille</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-center border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform">
              <Gamepad2 className="w-16 h-16 text-blue-400 mx-auto mb-3 animate-pulse" fill="currentColor" />
              <p className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{boyVotes}</p>
              <p className="text-xl text-blue-300 font-black uppercase tracking-wider mt-2">Team Garçon</p>
            </div>
          </div>

          <div className="h-8 w-full flex rounded-full overflow-hidden bg-slate-700 border-2 border-white/20 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-1000 ease-out flex items-center justify-center font-black text-white"
              style={{ width: `${totalVotes > 0 ? (girlVotes / totalVotes) * 100 : 50}%` }}
            >
              {totalVotes > 0 && <span className="text-sm drop-shadow-lg">{Math.round((girlVotes / totalVotes) * 100)}%</span>}
            </div>
            <div 
              className="h-full bg-gradient-to-l from-blue-500 to-blue-600 transition-all duration-1000 ease-out flex items-center justify-center font-black text-white"
              style={{ width: `${totalVotes > 0 ? (boyVotes / totalVotes) * 100 : 50}%` }}
            >
              {totalVotes > 0 && <span className="text-sm drop-shadow-lg">{Math.round((boyVotes / totalVotes) * 100)}%</span>}
            </div>
          </div>
        </div>

        {/* Averages - Gaming Arcade Style */}
        {(averageWeight || averageHeight) && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              <Zap size={28} className="text-yellow-400 animate-pulse" fill="currentColor" />
              Moyennes des Pronostics
              <Zap size={28} className="text-yellow-400 animate-pulse" fill="currentColor" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {averageWeight && (
                <ArcadeStatCard
                  value={averageWeight}
                  label="Poids Moyen"
                  unit="g"
                  icon={Weight}
                  color="border-yellow-500"
                  votes={votesWithWeight.length}
                />
              )}

              {averageHeight && (
                <ArcadeStatCard
                  value={averageHeight}
                  label="Taille Moyenne"
                  unit="cm"
                  icon={Ruler}
                  color="border-purple-500"
                  votes={votesWithHeight.length}
                />
              )}
            </div>
          </div>
        )}

        {/* Color Wheels - Gaming Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(hairColorCounts).length > 0 && (
            <ColorWheel
              data={hairColorCounts}
              title="Couleur des Cheveux"
              icon={Palette}
              colors={hairColorMap}
            />
          )}

          {Object.keys(eyeColorCounts).length > 0 && (
            <ColorWheel
              data={eyeColorCounts}
              title="Couleur des Yeux"
              icon={Eye}
              colors={eyeColorMap}
            />
          )}
        </div>

        {/* Most Popular Birth Dates - Gaming Style */}
        {sortedDates.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient"></div>
            
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
              <Calendar size={24} className="text-pink-400 animate-pulse" />
              Dates Populaires
            </h2>
            
            <div className="space-y-3">
              {sortedDates.slice(0, 5).map(([date, count], index) => (
                <div 
                  key={date}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border-2 border-purple-500/30 hover:border-purple-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:animate-pulse">
                      <span className="text-2xl font-black text-white">{index + 1}</span>
                    </div>
                    <span className="font-bold text-white text-lg">
                      {new Date(date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    <span className="text-xl font-black text-purple-300">{count}</span>
                    <span className="text-sm text-purple-400 font-bold uppercase">vote(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List of All Voters - Gaming Style */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
          
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
            <Users size={24} className="text-blue-400 animate-pulse" />
            Tous les Joueurs ({totalVotes})
          </h2>
          
          <div className="space-y-3">
            {votes.length === 0 ? (
              <p className="text-center text-purple-300 italic py-8 text-lg">
                Aucun vote pour l&apos;instant
              </p>
            ) : (
              votes.map((vote) => {
                const hasExtendedPredictions = vote.birthDate || vote.birthTime || vote.weight || vote.height || vote.hairColor || vote.eyeColor;
                
                return (
                  <div 
                    key={vote.id}
                    className="p-4 bg-slate-800/50 rounded-xl border-2 border-purple-500/30 hover:border-purple-500 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2
                          ${vote.choice === 'girl' 
                            ? 'bg-gradient-to-br from-pink-500 to-pink-700 border-pink-400 shadow-pink-500/50' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 shadow-blue-500/50'}
                        `}>
                          {vote.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-white text-lg">{vote.name}</p>
                          <p className={`text-sm font-bold uppercase tracking-wider ${vote.choice === 'girl' ? 'text-pink-400' : 'text-blue-400'}`}>
                            Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-purple-300 font-medium">
                        {new Date(vote.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {hasExtendedPredictions && (
                      <div className="ml-15 mt-3 pt-3 border-t-2 border-purple-500/30 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {vote.birthDate && (
                          <div className="flex items-center gap-2 text-purple-200 bg-purple-900/30 px-3 py-2 rounded-lg">
                            <Calendar size={14} className="text-purple-400" />
                            <span className="font-bold text-sm">{new Date(vote.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        {vote.birthTime && (
                          <div className="flex items-center gap-2 text-purple-200 bg-purple-900/30 px-3 py-2 rounded-lg">
                            <Clock size={14} className="text-purple-400" />
                            <span className="font-bold text-sm">{vote.birthTime}</span>
                          </div>
                        )}
                        {vote.weight && (
                          <div className="flex items-center gap-2 text-yellow-200 bg-yellow-900/30 px-3 py-2 rounded-lg">
                            <Weight size={14} className="text-yellow-400" />
                            <span className="font-bold text-sm">{vote.weight}g</span>
                          </div>
                        )}
                        {vote.height && (
                          <div className="flex items-center gap-2 text-pink-200 bg-pink-900/30 px-3 py-2 rounded-lg">
                            <Ruler size={14} className="text-pink-400" />
                            <span className="font-bold text-sm">{vote.height}cm</span>
                          </div>
                        )}
                        {vote.hairColor && (
                          <div className="flex items-center gap-2 text-amber-200 bg-amber-900/30 px-3 py-2 rounded-lg">
                            <Palette size={14} className="text-amber-400" />
                            <span className="font-bold text-sm">{vote.hairColor}</span>
                          </div>
                        )}
                        {vote.eyeColor && (
                          <div className="flex items-center gap-2 text-emerald-200 bg-emerald-900/30 px-3 py-2 rounded-lg">
                            <Eye size={14} className="text-emerald-400" />
                            <span className="font-bold text-sm">{vote.eyeColor}</span>
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

      </div>
    </div>
  );
}
