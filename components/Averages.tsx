'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { Vote } from '@/lib/storage';

interface AveragesProps {
  votes: Vote[];
  compact?: boolean;
}

export default function Averages({ votes, compact = false }: AveragesProps) {
  // Calcul des moyennes
  const votesWithWeight = votes.filter(v => v.weight && v.weight > 0);
  const votesWithHeight = votes.filter(v => v.height && v.height > 0);
  
  const averageWeight = votesWithWeight.length > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / votesWithWeight.length)
    : null;
  
  const averageHeight = votesWithHeight.length > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / votesWithHeight.length)
    : null;

  // Calcul de la médiane pour les dates
  const votesWithDate = votes.filter(v => v.birthDate);
  let medianDate: string | null = null;
  if (votesWithDate.length > 0) {
    const sortedDates = [...votesWithDate]
      .map(v => v.birthDate!)
      .sort();
    const midIndex = Math.floor(sortedDates.length / 2);
    medianDate = sortedDates[midIndex];
  }

  // Calcul de l'heure médiane
  const votesWithTime = votes.filter(v => v.birthTime);
  let medianTime: string | null = null;
  if (votesWithTime.length > 0) {
    const sortedTimes = [...votesWithTime]
      .map(v => v.birthTime!)
      .sort();
    const midIndex = Math.floor(sortedTimes.length / 2);
    medianTime = sortedTimes[midIndex];
  }

  const averages = [];
  
  if (averageWeight) {
    averages.push({
      emoji: '⚖️',
      label: 'Poids moyen',
      value: `${averageWeight}g`,
      color: 'from-purple-50 to-purple-100 border-purple-200'
    });
  }
  
  if (averageHeight) {
    averages.push({
      emoji: '📏',
      label: 'Taille moyenne',
      value: `${averageHeight}cm`,
      color: 'from-blue-50 to-blue-100 border-blue-200'
    });
  }
  
  if (medianDate) {
    averages.push({
      emoji: '📅',
      label: 'Date médiane',
      value: medianDate.split('-')[2] + '/' + medianDate.split('-')[1],
      color: 'from-indigo-50 to-indigo-100 border-indigo-200'
    });
  }
  
  if (medianTime) {
    averages.push({
      emoji: '🕐',
      label: 'Heure médiane',
      value: medianTime,
      color: 'from-amber-50 to-amber-100 border-amber-200'
    });
  }

  if (averages.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 border-purple-200 ${compact ? 'p-2' : 'p-6'} h-full flex flex-col items-center justify-center`}>
        <TrendingUp className={`text-purple-300 ${compact ? 'w-8 h-8 mb-2' : 'w-16 h-16 mb-4'}`} />
        <p className={`text-slate-400 font-medium text-center ${compact ? 'text-xs' : 'text-lg'}`}>
          Pas assez de données
        </p>
      </div>
    );
  }

  if (compact) {
    // Version ultra compacte pour Party Mode
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-1.5 h-full flex flex-col">
        {/* Content compact - Pas de header */}
        <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-hidden">
          {averages.slice(0, 4).map((avg, index) => (
            <div
              key={`${avg.label}-${index}`}
              className={`bg-gradient-to-br ${avg.color} rounded p-1.5 border-2 transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center`}
            >
              {/* Emoji */}
              <div className="text-2xl mb-1">{avg.emoji}</div>
              
              {/* Value */}
              <div className="text-lg font-black text-slate-800">{avg.value}</div>
              
              {/* Label compact */}
              <p className="text-[10px] font-bold text-slate-600 text-center uppercase truncate w-full">
                {avg.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Version normale
  return (
    <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-500 animate-pulse" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
          Les Moyennes
        </h2>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
        {averages.map((avg, index) => (
          <div
            key={`${avg.label}-${index}`}
            className={`bg-gradient-to-br ${avg.color} rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden animate-pop-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Emoji */}
            <div className="text-5xl mb-2 text-center animate-bounce-slow">
              {avg.emoji}
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-slate-600 text-center uppercase tracking-wide mb-1">
              {avg.label}
            </p>
            
            {/* Value */}
            <p className="text-3xl font-black text-slate-800 text-center mb-2">
              {avg.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
