'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { computeWeightBins, computeHeightBins, computeTimeBins } from '@/lib/stats/histogram';

interface HistogramProps {
  data: number[] | string[]; // Peut être des nombres (poids/taille) ou des strings (heures)
  title: string;
  unit: string;
  color?: string;
  height?: number;
  bins?: number; // Déprécié : utilisé uniquement si dataType n'est pas fourni
  isTVMode?: boolean;
  dataType?: 'weight' | 'height' | 'time'; // Type de données pour utiliser les bins fixes
}

export default function Histogram({ 
  data, 
  title, 
  unit, 
  color = '#8b5cf6',
  height = 150,
  bins = 10,
  isTVMode = false,
  dataType
}: HistogramProps) {
  const [animatedBars, setAnimatedBars] = useState<Record<number, number>>({});

  // Calculer les bins fixes ou dynamiques selon le type
  const binsData = useMemo(() => {
    if (data.length === 0) {
      return { bins: [], counts: [] };
    }

    // Utiliser les bins fixes si dataType est spécifié
    if (dataType === 'weight' && Array.isArray(data) && typeof data[0] === 'number') {
      return computeWeightBins(data as number[]);
    }
    
    if (dataType === 'height' && Array.isArray(data) && typeof data[0] === 'number') {
      return computeHeightBins(data as number[]);
    }
    
    if (dataType === 'time' && Array.isArray(data) && typeof data[0] === 'string') {
      return computeTimeBins(data as string[]);
    }

    // Fallback : bins dynamiques (ancien comportement)
    const numericData = data as number[];
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);
    const range = max - min;
    const binWidth = range / bins;

    const result: Record<number, number> = {};
    for (let i = 0; i < bins; i++) {
      result[i] = 0;
    }

    numericData.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      result[binIndex] = (result[binIndex] || 0) + 1;
    });

    // Convertir en format compatible
    return {
      bins: Array.from({ length: bins }, (_, i) => {
        const binStart = Math.round(min + i * binWidth);
        const binEnd = Math.round(min + (i + 1) * binWidth);
        return `${binStart}-${binEnd}${unit}`;
      }),
      counts: Object.values(result),
    };
  }, [data, dataType, bins, unit]);

  const maxCount = binsData.counts.length > 0 ? Math.max(...binsData.counts) : 0;

  if (data.length === 0) return null;

  // Animation progressive
  useEffect(() => {
    const newAnimated: Record<number, number> = {};
    binsData.counts.forEach((count, index) => {
      setTimeout(() => {
        setAnimatedBars(prev => ({ ...prev, [index]: count }));
      }, index * 50);
    });
  }, [binsData]);

  const numBins = binsData.bins.length;
  const barWidth = numBins > 0 ? 100 / numBins : 0;

  return (
    <div className="w-full animate-fade-in">
      <h4 className={`${isTVMode ? 'text-[10px]' : 'text-sm'} font-bold text-slate-700 mb-1`}>
        {title}
      </h4>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height={height} fill="url(#grid)" opacity="0.3" />
          
          {/* Barres de l'histogramme */}
          {binsData.bins.map((binLabel, binIndex) => {
            const count = binsData.counts[binIndex] || 0;
            const barHeight = maxCount > 0 ? (animatedBars[binIndex] || 0) / maxCount * height : 0;
            const x = (binIndex * barWidth);
            const y = height - barHeight;
            
            return (
              <g key={binIndex} className="transition-all duration-500 hover:opacity-80 cursor-pointer">
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth * 0.8}%`}
                  height={barHeight}
                  fill={color}
                  rx="2"
                  className="transition-all duration-300 hover:brightness-110"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    opacity: barHeight > 0 ? 0.8 : 0
                  }}
                >
                  <animate
                    attributeName="height"
                    from="0"
                    to={barHeight}
                    dur="0.8s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="y"
                    from={height}
                    to={y}
                    dur="0.8s"
                    fill="freeze"
                  />
                </rect>
                {/* Tooltip au survol */}
                <title>{count} vote(s) dans l'intervalle {binLabel}</title>
              </g>
            );
          })}
        </svg>
        
        {/* Labels des axes */}
        {binsData.bins.length > 0 && (
          <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[8px] text-slate-500">
            <span>{binsData.bins[0]}</span>
            <span>{binsData.bins[binsData.bins.length - 1]}</span>
          </div>
        )}
      </div>
      {Array.isArray(data) && typeof data[0] === 'number' && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
          <span className="font-semibold">Min:</span>
          <span>{Math.min(...(data as number[]))}{unit}</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold">Max:</span>
          <span>{Math.max(...(data as number[]))}{unit}</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold">Écart:</span>
          <span>{Math.max(...(data as number[])) - Math.min(...(data as number[]))}{unit}</span>
        </div>
      )}
    </div>
  );
}
