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
  const mostCommonHairColor = Object.entries(hairColorCounts).sort((a, b) => b[1] - a[1])[0];

  const eyeColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.eyeColor) {
      eyeColorCounts[v.eyeColor] = (eyeColorCounts[v.eyeColor] || 0) + 1;
    }
  });
  const mostCommonEyeColor = Object.entries(eyeColorCounts).sort((a, b) => b[1] - a[1])[0];

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {mostCommonHairColor && (
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <Palette className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-lg font-black text-amber-700">{mostCommonHairColor[0]}</p>
                <p className="text-xs text-amber-600 font-medium">Couleur cheveux</p>
                <p className="text-[10px] text-slate-400 mt-1">{mostCommonHairColor[1]} vote(s)</p>
              </div>
            )}

            {mostCommonEyeColor && (
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <Eye className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-lg font-black text-emerald-700">{mostCommonEyeColor[0]}</p>
                <p className="text-xs text-emerald-600 font-medium">Couleur yeux</p>
                <p className="text-[10px] text-slate-400 mt-1">{mostCommonEyeColor[1]} vote(s)</p>
              </div>
            )}
          </div>

          {!averageWeight && !averageHeight && !mostCommonHairColor && !mostCommonEyeColor && (
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
