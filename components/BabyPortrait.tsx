'use client';

import React from 'react';
import { Baby, Heart } from 'lucide-react';
import BabyAvatar from './BabyAvatar';
import type { Vote, AppConfig } from '@/lib/storage';

interface BabyPortraitProps {
  votes: Vote[];
  config: AppConfig;
}

export default function BabyPortrait({ votes, config }: BabyPortraitProps) {
  // Calculate most common characteristics
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;
  // En cas d'égalité, on choisit 'girl' par défaut pour afficher quand même le portrait
  const mostCommonGender = girlVotes > boyVotes ? 'girl' : boyVotes > girlVotes ? 'boy' : girlVotes > 0 ? 'girl' : null;
  
  const hairColorCounts: Record<string, number> = {};
  const eyeColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.hairColor) hairColorCounts[v.hairColor] = (hairColorCounts[v.hairColor] || 0) + 1;
    if (v.eyeColor) eyeColorCounts[v.eyeColor] = (eyeColorCounts[v.eyeColor] || 0) + 1;
  });
  
  const mostCommonHair = Object.keys(hairColorCounts).length > 0
    ? Object.entries(hairColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : undefined;
  const mostCommonEyes = Object.keys(eyeColorCounts).length > 0
    ? Object.entries(eyeColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : undefined;
  
  // Average weight and height
  const votesWithWeight = votes.filter(v => v.weight && v.weight > 0);
  const votesWithHeight = votes.filter(v => v.height && v.height > 0);
  const averageWeight = votesWithWeight.length > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / votesWithWeight.length)
    : null;
  const averageHeight = votesWithHeight.length > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / votesWithHeight.length)
    : null;
  
  // Background gradient selon le genre
  const bgGradient = mostCommonGender === 'girl' 
    ? 'from-pink-50 via-pink-100 to-pink-50' 
    : mostCommonGender === 'boy'
    ? 'from-blue-50 via-blue-100 to-blue-50'
    : 'from-purple-50 via-purple-100 to-purple-50';
  
  const borderColor = mostCommonGender === 'girl' 
    ? 'border-pink-300' 
    : mostCommonGender === 'boy'
    ? 'border-blue-300'
    : 'border-purple-300';
  
  if (!mostCommonGender) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-4 flex flex-col items-center justify-center">
        <Baby className="w-16 h-16 text-purple-300 mb-3 animate-bounce-slow" />
        <p className="text-sm text-slate-400 font-medium text-center">
          En attente de votes...
        </p>
        <p className="text-xs text-slate-300 mt-1 text-center">
          Le portrait du bébé apparaîtra ici
        </p>
      </div>
    );
  }
  
  return (
    <div className={`h-full bg-gradient-to-br ${bgGradient} rounded-2xl shadow-2xl border-4 ${borderColor} p-2 flex flex-col overflow-hidden animate-pulse-slow`}>
      {/* Header */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <Heart className={`w-5 h-5 ${mostCommonGender === 'girl' ? 'text-pink-500' : 'text-blue-500'} animate-pulse`} fill="currentColor" />
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider text-center">
          Portrait {config.babyName || 'Bébé'}
        </h2>
        <Heart className={`w-5 h-5 ${mostCommonGender === 'girl' ? 'text-pink-500' : 'text-blue-500'} animate-pulse`} fill="currentColor" />
      </div>
      
      {/* Baby Avatar Compact */}
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pop-in">
          <BabyAvatar
            gender={mostCommonGender}
            hairColor={mostCommonHair}
            eyeColor={mostCommonEyes}
            size={120}
          />
        </div>
      </div>
      
      {/* Infos */}
      <div className="mt-1 space-y-1">
        {/* Genre */}
        <div className={`text-center py-1.5 rounded-xl ${
          mostCommonGender === 'girl' 
            ? 'bg-pink-200/50 text-pink-700 border border-pink-300' 
            : 'bg-blue-200/50 text-blue-700 border border-blue-300'
        }`}>
          <p className="text-xl font-black uppercase tracking-wider">
            {mostCommonGender === 'girl' ? '♀ Fille' : '♂ Garçon'}
          </p>
          <p className="text-[10px] font-medium">
            {mostCommonGender === 'girl' ? girlVotes : boyVotes} votes
          </p>
        </div>
        
        {/* Caractéristiques */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          {mostCommonHair && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 text-center border border-slate-200">
              <p className="font-bold text-slate-700">💇 {mostCommonHair}</p>
            </div>
          )}
          {mostCommonEyes && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 text-center border border-slate-200">
              <p className="font-bold text-slate-700">👁️ {mostCommonEyes}</p>
            </div>
          )}
          {averageWeight && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 text-center border border-slate-200">
              <p className="font-bold text-purple-600">⚖️ {averageWeight}g</p>
            </div>
          )}
          {averageHeight && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 text-center border border-slate-200">
              <p className="font-bold text-indigo-600">📏 {averageHeight}cm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
