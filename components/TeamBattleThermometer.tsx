'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';

interface TeamBattleThermometerProps {
  girlVotes: number;
  boyVotes: number;
  orientation?: 'vertical' | 'horizontal';
  animated?: boolean;
  playSound?: boolean;
}

export default function TeamBattleThermometer({ 
  girlVotes, 
  boyVotes, 
  orientation = 'vertical',
  animated = true,
  playSound = false
}: TeamBattleThermometerProps) {
  const totalVotes = girlVotes + boyVotes;
  const girlPercent = totalVotes > 0 ? Math.round((girlVotes / totalVotes) * 100) : 50;
  const boyPercent = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 50;
  
  const [prevGirlPercent, setPrevGirlPercent] = useState(girlPercent);
  const [shake, setShake] = useState(false);
  
  // Detect significant changes
  useEffect(() => {
    const diff = Math.abs(girlPercent - prevGirlPercent);
    
    if (diff > 2 && totalVotes > 0 && animated) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // Play sound if enabled (à implémenter plus tard avec Audio API)
      if (playSound) {
        // TODO: Add sound effect
      }
    }
    
    setPrevGirlPercent(girlPercent);
  }, [girlPercent, prevGirlPercent, totalVotes, animated, playSound]);
  
  const isGirlLeading = girlPercent > boyPercent;
  const isTie = girlPercent === boyPercent;
  
  if (orientation === 'horizontal') {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-6 ${shake ? 'animate-shake-horizontal' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <Trophy className={`w-8 h-8 ${isGirlLeading ? 'text-pink-500' : isTie ? 'text-purple-500' : 'text-blue-500'} animate-pulse`} />
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider">
            Battle Team Fille vs Garçon
          </h2>
        </div>
        
        {/* Horizontal Bar */}
        <div className="relative h-24 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          {/* Pink side */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out"
            style={{ width: `${girlPercent}%` }}
          />
          
          {/* Blue side */}
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
            style={{ width: `${boyPercent}%` }}
          />
          
          {/* Center VS Badge */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white rounded-full p-2 shadow-lg border-2 border-slate-200">
              <div className="bg-slate-800 text-white text-sm font-bold w-12 h-12 flex items-center justify-center rounded-full">
                VS
              </div>
            </div>
          </div>
          
          {/* Percentages */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white text-2xl font-black z-10">
            {girlPercent > 15 && `${Math.round(girlPercent)}%`}
          </div>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white text-2xl font-black z-10">
            {boyPercent > 15 && `${Math.round(boyPercent)}%`}
          </div>
        </div>
        
        {/* Team Labels */}
        <div className="flex justify-between mt-4 px-4">
          <div className="text-center">
            <div className="text-4xl mb-1">♀</div>
            <p className="text-pink-600 font-black text-lg">Team Fille</p>
            <p className="text-pink-500 font-bold text-2xl">{girlVotes}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-1">♂</div>
            <p className="text-blue-600 font-black text-lg">Team Garçon</p>
            <p className="text-blue-500 font-bold text-2xl">{boyVotes}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Vertical orientation - Affichage compact avec thermomètre horizontal
  return (
    <div className={`h-full flex flex-col bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-2 ${shake ? 'animate-shake-horizontal' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <Trophy className={`w-4 h-4 ${isGirlLeading ? 'text-pink-500' : isTie ? 'text-purple-500' : 'text-blue-500'}`} />
        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Battle</span>
      </div>
      
      {/* Thermomètre horizontal */}
      <div className="relative h-12 bg-slate-100 rounded-full overflow-hidden shadow-inner flex-shrink-0">
        {/* Barre rose */}
        <div 
          className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out flex items-center justify-start pl-2"
          style={{ width: `${girlPercent}%` }}
        >
          {girlPercent > 15 && (
            <span className="text-xs text-white font-bold">{girlPercent}%</span>
          )}
        </div>
        
        {/* Barre bleue */}
        <div 
          className="h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out flex items-center justify-end pr-2 absolute top-0 right-0"
          style={{ width: `${boyPercent}%` }}
        >
          {boyPercent > 15 && (
            <span className="text-xs text-white font-bold">{boyPercent}%</span>
          )}
        </div>
        
        {/* Badge VS central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md border-2 border-slate-200 z-10">
          <div className="bg-slate-800 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full">
            VS
          </div>
        </div>
      </div>
      
      {/* Labels des équipes */}
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="text-center">
          <span className="text-pink-500 text-base font-black">Team Fille</span>
          <p className="text-pink-600 font-bold text-sm">({girlVotes})</p>
        </div>
        <div className="text-center">
          <span className="text-blue-500 text-base font-black">Team Garçon</span>
          <p className="text-blue-600 font-bold text-sm">({boyVotes})</p>
        </div>
      </div>
    </div>
  );
}
