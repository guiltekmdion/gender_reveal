'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { normalizeName } from '@/lib/normalization';

interface NameCloudProps {
  names: Array<{ name: string; choice: 'girl' | 'boy' }>;
  title?: string;
  isTVMode?: boolean;
  compact?: boolean;
  maxNames?: number; // Limite le nombre de prénoms affichés (top N)
}

export default function NameCloud({ names, title = 'Les pronostics', isTVMode = false, compact = false, maxNames = 50 }: NameCloudProps) {
  // Normaliser et regrouper les prénoms
  const normalizedNames = useMemo(() => {
    const nameCounts: Record<string, { count: number; girlCount: number; boyCount: number }> = {};
    
    names.forEach(({ name, choice }) => {
      const normalized = normalizeName(name);
      if (normalized) {
        if (!nameCounts[normalized]) {
          nameCounts[normalized] = { count: 0, girlCount: 0, boyCount: 0 };
        }
        nameCounts[normalized].count++;
        if (choice === 'girl') {
          nameCounts[normalized].girlCount++;
        } else {
          nameCounts[normalized].boyCount++;
        }
      }
    });
    
    // Trier par count décroissant et prendre le top N
    const sorted = Object.entries(nameCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, maxNames);
    
    // Si on a limité, ajouter "Autres" si nécessaire
    const totalOriginal = names.length;
    const totalDisplayed = sorted.reduce((sum, [, counts]) => sum + counts.count, 0);
    const othersCount = totalOriginal - totalDisplayed;
    
    const result: Array<{ name: string; choice: 'girl' | 'boy'; count: number }> = sorted.map(([name, counts]) => {
      // Déterminer le choix dominant pour l'affichage
      const dominantChoice = counts.girlCount >= counts.boyCount ? 'girl' : 'boy';
      return { name, choice: dominantChoice, count: counts.count };
    });
    
    if (othersCount > 0 && sorted.length >= maxNames) {
      result.push({ name: 'Autres', choice: 'girl', count: othersCount });
    }
    
    return result;
  }, [names, maxNames]);

  const [displayedNames, setDisplayedNames] = useState<Array<{ name: string; choice: 'girl' | 'boy'; x: number; y: number; size: number; rotation: number }>>([]);

  useEffect(() => {
    // Générer des positions et tailles aléatoires pour chaque prénom
    const generatePositions = () => {
      return normalizedNames.map(({ name, choice, count }) => {
        // Position aléatoire dans le conteneur (avec marges)
        const x = Math.random() * 80 + 10; // Entre 10% et 90%
        const y = Math.random() * 80 + 10;
        
        // Taille basée sur la fréquence (count) et la longueur du prénom
        const baseSize = compact ? 12 : (isTVMode ? 14 : 18);
        const maxCount = Math.max(...normalizedNames.map(n => n.count));
        const frequencyFactor = count / maxCount; // 0-1
        const lengthFactor = Math.max(0.7, 1 - (name.length - 3) * 0.05);
        const size = baseSize * (0.8 + frequencyFactor * 0.4) * lengthFactor;
        
        // Rotation légère aléatoire pour un effet plus naturel
        const rotation = (Math.random() - 0.5) * 15; // Entre -7.5° et +7.5°
        
        return {
          name,
          choice,
          x,
          y,
          size,
          rotation
        };
      });
    };

    setDisplayedNames(generatePositions());
  }, [normalizedNames, isTVMode, compact]);

  if (normalizedNames.length === 0) {
    return null;
  }

  // Séparer les votes fille/garçon pour statistiques
  const girlVotes = normalizedNames.filter(n => n.choice === 'girl').reduce((sum, n) => sum + n.count, 0);
  const boyVotes = normalizedNames.filter(n => n.choice === 'boy').reduce((sum, n) => sum + n.count, 0);
  const total = normalizedNames.reduce((sum, n) => sum + n.count, 0);

  return (
    <div className={`bg-white rounded-xl shadow-2xl border border-transparent bg-gradient-to-br from-white to-purple-50/30 ${isTVMode ? 'p-2' : 'p-4'} overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] hover:border-purple-200 animate-fade-in`} style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
      {/* En-tête */}
      <div className={`flex items-center gap-2 ${isTVMode ? 'mb-1' : 'mb-3'}`}>
        <Users size={isTVMode ? 14 : 18} className="text-purple-500 transition-transform duration-300 hover:scale-110" />
        <h3 className={`${isTVMode ? 'text-xs' : 'text-sm'} font-bold text-slate-700`}>{title}</h3>
        <span className={`ml-auto ${isTVMode ? 'text-[10px]' : 'text-xs'} text-slate-500 font-medium`}>
          {total} {total === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      {/* Nuage de prénoms */}
      <div 
        className={`relative bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-100 overflow-hidden ${compact ? 'h-full min-h-[180px]' : (isTVMode ? 'h-32' : 'h-48')} transition-all duration-300`}
      >
        {displayedNames.map((item, index) => {
          const isGirl = item.choice === 'girl';
          const bgColor = isGirl 
            ? 'bg-gradient-to-br from-pink-100 to-pink-200' 
            : 'bg-gradient-to-br from-blue-100 to-blue-200';
          const textColor = isGirl 
            ? 'text-pink-700' 
            : 'text-blue-700';
          const borderColor = isGirl 
            ? 'border-pink-300' 
            : 'border-blue-300';
          const shadowColor = isGirl 
            ? '0 2px 8px rgba(236, 72, 153, 0.3)' 
            : '0 2px 8px rgba(59, 130, 246, 0.3)';

          return (
            <div
              key={`${item.name}-${index}`}
              className={`absolute ${bgColor} ${borderColor} ${textColor} ${compact ? 'px-1 py-0.5' : (isTVMode ? 'px-1.5 py-0.5' : 'px-2 py-1')} rounded-full border-2 font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer animate-fade-in`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                fontSize: `${item.size}px`,
                boxShadow: shadowColor,
                animationDelay: `${index * 30}ms`,
                zIndex: 1
              }}
              title={`${item.name} - Team ${isGirl ? 'Fille' : 'Garçon'}${item.count > 1 ? ` (${item.count}x)` : ''}`}
            >
              {item.name}
            </div>
          );
        })}
      </div>

      {/* Statistiques en bas */}
      <div className={`mt-2 pt-2 border-t border-slate-200 flex items-center justify-center ${isTVMode ? 'gap-2' : 'gap-4'}`}>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-pink-600`}></div>
          <span className={`${isTVMode ? 'text-[9px]' : 'text-xs'} text-slate-600 font-medium`}>
            Fille: <span className="font-bold text-pink-600">{girlVotes}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600`}></div>
          <span className={`${isTVMode ? 'text-[9px]' : 'text-xs'} text-slate-600 font-medium`}>
            Garçon: <span className="font-bold text-blue-600">{boyVotes}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
