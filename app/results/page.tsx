'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Crown, Gamepad2, Calendar, Clock, Weight, Ruler, Palette, Eye, ArrowLeft, Users, TrendingUp } from 'lucide-react';
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

// Composant Roue de Couleurs - Style Gender Reveal doux
const ColorWheelPastel = ({ 
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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-purple-500" />
        <h3 className="text-base font-bold text-slate-700">{title}</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie Chart - Style doux */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="65"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="2"
            />
            
            {/* Pie segments */}
            {segments.map(({ color, percent, startPercent }) => {
              const startAngle = (startPercent / 100) * 360;
              const endAngle = ((startPercent + percent) / 100) * 360;
              const largeArcFlag = percent > 50 ? 1 : 0;
              
              const startX = 70 + 55 * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = 70 + 55 * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = 70 + 55 * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = 70 + 55 * Math.sin((endAngle - 90) * Math.PI / 180);

              return (
                <g key={color}>
                  <path
                    d={`M 70 70 L ${startX} ${startY} A 55 55 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                    fill={colors[color] || '#cbd5e1'}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx="70"
              cy="70"
              r="25"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
          </svg>
          
          {/* Center icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Icon className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {entries.map(([color, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={color}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-slate-200"
                      style={{ backgroundColor: colors[color] || '#cbd5e1' }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700">{color}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{percent}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 ease-out rounded-full"
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: colors[color] || '#cbd5e1'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
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

  // Calculate most common predictions
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

  // Color mappings - couleurs douces pour gender reveal
  const hairColorMap: Record<string, string> = {
    'Bruns': '#8b6f47',
    'Blonds': '#f5e6b3',
    'Roux': '#d4856a',
    'Noirs': '#4a4a4a',
    'Châtains': '#a67c52'
  };

  const eyeColorMap: Record<string, string> = {
    'Bleus': '#6ba3d4',
    'Verts': '#7ab88f',
    'Marrons': '#a67c52',
    'Noisette': '#b8956a',
    'Gris': '#a0aec0'
  };

  // Date predictions
  const dateCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.birthDate) {
      dateCounts[v.birthDate] = (dateCounts[v.birthDate] || 0) + 1;
    }
  });
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center justify-center gap-2">
            <TrendingUp className="text-purple-500" />
            Statistiques & Pronostics
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            Les moyennes des pronostics pour {config.babyName || 'Bébé'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Gender Vote Stats */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Baby size={20} />
            Vote Fille / Garçon
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-pink-50 rounded-2xl p-4 text-center border-2 border-pink-200">
              <Crown className="w-10 h-10 text-pink-500 mx-auto mb-2" fill="currentColor" />
              <p className="text-3xl font-black text-pink-600">{girlVotes}</p>
              <p className="text-sm text-pink-600 font-medium">Team Fille</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
              <Gamepad2 className="w-10 h-10 text-blue-500 mx-auto mb-2" fill="currentColor" />
              <p className="text-3xl font-black text-blue-600">{boyVotes}</p>
              <p className="text-sm text-blue-600 font-medium">Team Garçon</p>
            </div>
          </div>

          <div className="h-6 w-full flex rounded-full overflow-hidden bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out"
              style={{ width: `${totalVotes > 0 ? (girlVotes / totalVotes) * 100 : 50}%` }}
            />
            <div 
              className="h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${totalVotes > 0 ? (boyVotes / totalVotes) * 100 : 50}%` }}
            />
          </div>
        </div>

        {/* Averages */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Moyennes des pronostics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {averageWeight && (
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                <Weight className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-700">{averageWeight}g</p>
                <p className="text-xs text-purple-600 font-medium">Poids moyen</p>
                <p className="text-[10px] text-slate-400 mt-1">{votesWithWeight.length} vote(s)</p>
              </div>
            )}

            {averageHeight && (
              <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                <Ruler className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-indigo-700">{averageHeight}cm</p>
                <p className="text-xs text-indigo-600 font-medium">Taille moyenne</p>
                <p className="text-[10px] text-slate-400 mt-1">{votesWithHeight.length} vote(s)</p>
              </div>
            )}
          </div>

          {/* Color Wheels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.keys(hairColorCounts).length > 0 && (
              <ColorWheelPastel
                data={hairColorCounts}
                title="Couleur des cheveux"
                icon={Palette}
                colors={hairColorMap}
              />
            )}

            {Object.keys(eyeColorCounts).length > 0 && (
              <ColorWheelPastel
                data={eyeColorCounts}
                title="Couleur des yeux"
                icon={Eye}
                colors={eyeColorMap}
              />
            )}
          </div>

          {!averageWeight && !averageHeight && Object.keys(hairColorCounts).length === 0 && Object.keys(eyeColorCounts).length === 0 && (
            <p className="text-center text-slate-400 italic py-4">
              Aucun pronostic détaillé pour l&apos;instant
            </p>
          )}
        </div>

        {/* Most Popular Birth Dates */}
        {sortedDates.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Dates de naissance les plus populaires
            </h2>
            <div className="space-y-2">
              {sortedDates.slice(0, 5).map(([date, count], index) => (
                <div 
                  key={date}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-700">
                      {new Date(date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{count} vote(s)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List of All Voters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} />
            Tous les participants ({totalVotes})
          </h2>
          
          <div className="space-y-2">
            {votes.length === 0 ? (
              <p className="text-center text-slate-400 italic py-4">
                Aucun vote pour l&apos;instant
              </p>
            ) : (
              votes.map((vote) => {
                const hasExtendedPredictions = vote.birthDate || vote.birthTime || vote.weight || vote.height || vote.hairColor || vote.eyeColor;
                
                return (
                  <div 
                    key={vote.id}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                          ${vote.choice === 'girl' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                        `}>
                          {vote.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{vote.name}</p>
                          <p className={`text-xs font-medium uppercase ${vote.choice === 'girl' ? 'text-pink-500' : 'text-blue-500'}`}>
                            Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(vote.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {hasExtendedPredictions && (
                      <div className="ml-13 mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {vote.birthDate && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar size={12} className="text-purple-500" />
                            <span>{new Date(vote.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        {vote.birthTime && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock size={12} className="text-purple-500" />
                            <span>{vote.birthTime}</span>
                          </div>
                        )}
                        {vote.weight && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Weight size={12} className="text-purple-500" />
                            <span>{vote.weight}g</span>
                          </div>
                        )}
                        {vote.height && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Ruler size={12} className="text-purple-500" />
                            <span>{vote.height}cm</span>
                          </div>
                        )}
                        {vote.hairColor && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Palette size={12} className="text-amber-500" />
                            <span>{vote.hairColor}</span>
                          </div>
                        )}
                        {vote.eyeColor && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Eye size={12} className="text-emerald-500" />
                            <span>{vote.eyeColor}</span>
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
