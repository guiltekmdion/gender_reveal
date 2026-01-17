'use client';

import React from 'react';
import { Award } from 'lucide-react';
import type { Vote } from '@/lib/storage';
import { getExtreme } from '@/lib/fun-facts';

interface ExtremesProps {
  votes: Vote[];
  layout?: 'grid' | 'list';
  compact?: boolean;
}

interface ExtremeCardData {
  emoji: string;
  label: string;
  value: string;
  voter: string;
  color: string;
}

export default function Extremes({ votes, layout = 'grid', compact = false }: ExtremesProps) {
  const extremes: ExtremeCardData[] = [];
  
  // Plus lourd
  const heaviest = getExtreme(votes, 'weight', 'max');
  if (heaviest && typeof heaviest.value === 'number') {
    extremes.push({
      emoji: '🏋️',
      label: 'Plus lourd',
      value: `${heaviest.value}g`,
      voter: heaviest.voter,
      color: 'from-purple-50 to-purple-100 border-purple-200'
    });
  }
  
  // Plus léger
  const lightest = getExtreme(votes, 'weight', 'min');
  if (lightest && typeof lightest.value === 'number') {
    extremes.push({
      emoji: '🪶',
      label: 'Plus léger',
      value: `${lightest.value}g`,
      voter: lightest.voter,
      color: 'from-blue-50 to-blue-100 border-blue-200'
    });
  }
  
  // Plus grand
  const tallest = getExtreme(votes, 'height', 'max');
  if (tallest && typeof tallest.value === 'number') {
    extremes.push({
      emoji: '📏',
      label: 'Plus grand',
      value: `${tallest.value}cm`,
      voter: tallest.voter,
      color: 'from-indigo-50 to-indigo-100 border-indigo-200'
    });
  }
  
  // Plus petit
  const shortest = getExtreme(votes, 'height', 'min');
  if (shortest && typeof shortest.value === 'number') {
    extremes.push({
      emoji: '📐',
      label: 'Plus petit',
      value: `${shortest.value}cm`,
      voter: shortest.voter,
      color: 'from-cyan-50 to-cyan-100 border-cyan-200'
    });
  }
  
  // Plus matinal
  const earliest = getExtreme(votes, 'birthTime', 'min');
  if (earliest) {
    extremes.push({
      emoji: '🌅',
      label: 'Plus matinal',
      value: earliest.value as string,
      voter: earliest.voter,
      color: 'from-amber-50 to-amber-100 border-amber-200'
    });
  }
  
  // Plus tardif
  const latest = getExtreme(votes, 'birthTime', 'max');
  if (latest) {
    extremes.push({
      emoji: '🌙',
      label: 'Plus tardif',
      value: latest.value as string,
      voter: latest.voter,
      color: 'from-violet-50 to-violet-100 border-violet-200'
    });
  }
  
  if (extremes.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border-2 border-purple-200 ${compact ? 'p-2' : 'p-6'} h-full flex flex-col items-center justify-center`}>
        <Award className={`text-purple-300 ${compact ? 'w-8 h-8 mb-2' : 'w-16 h-16 mb-4'}`} />
        <p className={`text-slate-400 font-medium text-center ${compact ? 'text-xs' : 'text-lg'}`}>
          Pas assez de données
        </p>
      </div>
    );
  }
  
  if (compact) {
    // Version ultra compacte pour Party Mode
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-1 h-full flex flex-col">
        {/* Header compact */}
        <div className="flex items-center gap-1 mb-1 px-1">
          <Award className="w-3 h-3 text-amber-500" />
          <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
            Records
          </h2>
        </div>
        
        {/* Content compact */}
        <div className={layout === 'grid' 
          ? `grid grid-cols-2 gap-0.5 flex-1 overflow-hidden` 
          : 'space-y-0.5 flex-1 overflow-hidden'
        }>
          {extremes.slice(0, 4).map((extreme, index) => (
            <div
              key={`${extreme.label}-${index}`}
              className={`bg-gradient-to-br ${extreme.color} rounded p-0.5 border transition-all duration-300 relative overflow-hidden`}
            >
              {/* Emoji et value en ligne */}
              <div className="flex items-center justify-center gap-1">
                <span className="text-base">{extreme.emoji}</span>
                <span className="text-sm font-black text-slate-800">{extreme.value}</span>
              </div>
              
              {/* Label compact */}
              <p className="text-[7px] font-bold text-slate-600 text-center uppercase truncate">
                {extreme.label}
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
        <Award className="w-6 h-6 text-amber-500 animate-pulse" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
          Les Records
        </h2>
      </div>
      
      {/* Content */}
      <div className={layout === 'grid' 
        ? `grid grid-cols-2 gap-3 flex-1 overflow-y-auto` 
        : 'space-y-3 flex-1 overflow-y-auto'
      }>
        {extremes.map((extreme, index) => (
          <div
            key={`${extreme.label}-${index}`}
            className={`bg-gradient-to-br ${extreme.color} rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden animate-pop-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Badge Record */}
            <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              RECORD
            </div>
            
            {/* Emoji */}
            <div className="text-5xl mb-2 text-center animate-bounce-slow">
              {extreme.emoji}
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-slate-600 text-center uppercase tracking-wide mb-1">
              {extreme.label}
            </p>
            
            {/* Value */}
            <p className="text-3xl font-black text-slate-800 text-center mb-2 animate-pulse">
              {extreme.value}
            </p>
            
            {/* Voter */}
            <p className="text-xs text-slate-500 text-center font-medium truncate">
              par {extreme.voter}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
