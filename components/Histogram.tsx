'use client';

import React, { useEffect, useState } from 'react';

interface HistogramProps {
  data: number[];
  title: string;
  unit: string;
  color?: string;
  height?: number;
  bins?: number;
  isTVMode?: boolean;
}

export default function Histogram({ 
  data, 
  title, 
  unit, 
  color = '#8b5cf6',
  height = 150,
  bins = 10,
  isTVMode = false
}: HistogramProps) {
  const [animatedBars, setAnimatedBars] = useState<Record<number, number>>({});

  if (data.length === 0) return null;

  // Calculer les bins (intervalles)
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binWidth = range / bins;

  // Compter les valeurs dans chaque bin
  const binsData: Record<number, number> = {};
  for (let i = 0; i < bins; i++) {
    binsData[i] = 0;
  }

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    binsData[binIndex] = (binsData[binIndex] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(binsData));

  // Animation progressive
  useEffect(() => {
    const newAnimated: Record<number, number> = {};
    Object.keys(binsData).forEach((binKey, index) => {
      const binIndex = parseInt(binKey);
      setTimeout(() => {
        setAnimatedBars(prev => ({ ...prev, [binIndex]: binsData[binIndex] }));
      }, index * 50);
    });
  }, [binsData]);

  const barWidth = 100 / bins;

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
          {Object.entries(binsData).map(([binIndex, count]) => {
            const bin = parseInt(binIndex);
            const barHeight = maxCount > 0 ? (animatedBars[bin] || 0) / maxCount * height : 0;
            const x = (bin * barWidth);
            const y = height - barHeight;
            
            return (
              <g key={bin} className="transition-all duration-500 hover:opacity-80 cursor-pointer">
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
                <title>{count} vote(s) dans l'intervalle {Math.round(min + bin * binWidth)}{unit} - {Math.round(min + (bin + 1) * binWidth)}{unit}</title>
              </g>
            );
          })}
        </svg>
        
        {/* Labels des axes */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[8px] text-slate-500">
          <span>{Math.round(min)}{unit}</span>
          <span>{Math.round(max)}{unit}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
        <span className="font-semibold">Min:</span>
        <span>{Math.round(min)}{unit}</span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold">Max:</span>
        <span>{Math.round(max)}{unit}</span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold">Écart:</span>
        <span>{Math.round(range)}{unit}</span>
      </div>
    </div>
  );
}
