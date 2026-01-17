'use client';

import React, { useEffect, useState } from 'react';

interface ColorPieChartProps {
  data: Record<string, number>; // { "Blonds": 5, "Bruns": 3, ... }
  colors: Record<string, string>; // { "Blonds": "#f5e6b3", ... }
  title: string;
  icon?: React.ElementType;
  size?: number;
  isTVMode?: boolean;
  compact?: boolean;
}

export default function ColorPieChart({ 
  data, 
  colors, 
  title, 
  icon: Icon,
  size = 200, 
  isTVMode = false,
  compact = false
}: ColorPieChartProps) {
  const [animatedSegments, setAnimatedSegments] = useState<Record<string, number>>({});
  const [hasAnimated, setHasAnimated] = useState(false);

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  // Calculer les segments triés par fréquence
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  
  const segments = entries.reduce((acc, [label, count], index) => {
    const percent = (count / total) * 100;
    const startPercent = acc.length > 0 
      ? acc[acc.length - 1].startPercent + acc[acc.length - 1].percent 
      : 0;
    return [...acc, { 
      label, 
      count, 
      percent, 
      startPercent,
      color: colors[label] || '#cbd5e1'
    }];
  }, [] as Array<{ label: string; count: number; percent: number; startPercent: number; color: string }>);

  // Initialiser immédiatement les segments sans animation en mode compact
  useEffect(() => {
    if (compact && !hasAnimated) {
      // Pas d'animation en mode compact, affichage direct
      const initialSegments: Record<string, number> = {};
      segments.forEach(segment => {
        initialSegments[segment.label] = segment.percent;
      });
      setAnimatedSegments(initialSegments);
      setHasAnimated(true);
    } else if (!compact && !hasAnimated) {
      // Animation uniquement au premier montage en mode normal
      const intervals: NodeJS.Timeout[] = [];
      
      segments.forEach((segment, index) => {
        const duration = 1000;
        const steps = 30;
        const step = segment.percent / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
          currentStep++;
          const animatedPercent = Math.min(segment.percent, currentStep * step);
          setAnimatedSegments(prev => ({ 
            ...prev, 
            [segment.label]: animatedPercent 
          }));
          
          if (currentStep >= steps) {
            clearInterval(interval);
          }
        }, (duration / steps));
        
        intervals.push(interval);
      });
      
      setHasAnimated(true);
      
      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [compact, hasAnimated, segments.length]);

  // Utiliser une taille de base fixe (200) pour les calculs du viewBox, mais afficher à la taille demandée
  const baseSize = 200;
  const displaySize = size;
  const radius = baseSize / 2 - 10;
  const centerX = baseSize / 2;
  const centerY = baseSize / 2;

  // Fonction pour calculer les coordonnées d'un arc
  const getArcPath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Fonction pour créer une version plus sombre de la couleur
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      {title && (
        <div className={`flex items-center gap-2 ${compact ? 'mb-1' : (isTVMode ? 'mb-1' : 'mb-3')}`}>
          {Icon && <Icon size={compact ? 12 : (isTVMode ? 14 : 18)} className="text-purple-500 transition-transform duration-300 hover:scale-110" />}
          <h3 className={`${compact ? 'text-xs' : (isTVMode ? 'text-xs' : 'text-sm')} font-bold text-slate-700`}>{title}</h3>
        </div>
      )}

      {/* Graphique et légende */}
      <div className="flex flex-col items-center gap-2 flex-1">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg 
            width={displaySize} 
            height={displaySize} 
            viewBox={`0 0 ${baseSize} ${baseSize}`} 
            className="transform -rotate-90"
          >
            {/* Définitions des gradients */}
            <defs>
              {segments.map((segment) => {
                const gradientId = `gradient-${segment.label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
                const rgb = hexToRgb(segment.color);
                const darkerColor = rgb 
                  ? `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`
                  : segment.color;
                
                return (
                  <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={segment.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={darkerColor} stopOpacity="0.8" />
                  </linearGradient>
                );
              })}
            </defs>
            
            {/* Cercle de fond */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
              className="transition-all duration-500"
            />
            
            {/* Segments */}
            {segments.map((segment, index) => {
              // En mode compact, afficher directement le pourcentage final
              const displayPercent = compact ? segment.percent : (animatedSegments[segment.label] || 0);
              const startAngle = segment.startPercent * 3.6; // Convertir % en degrés
              const endAngle = startAngle + (displayPercent * 3.6);
              const gradientId = `gradient-${segment.label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
              
              if (displayPercent <= 0) return null;
              
              return (
                <path
                  key={segment.label}
                  d={getArcPath(startAngle, endAngle)}
                  fill={`url(#${gradientId})`}
                  className="transition-all duration-300"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                    opacity: 0.9
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Légende avec pourcentages */}
        <div className={`w-full ${compact ? 'space-y-0.5' : (isTVMode ? 'space-y-0.5' : 'space-y-2')}`}>
          {entries.map(([label, count]) => {
            const percent = Math.round((count / total) * 100);
            // En mode compact ou si pas d'animation, afficher directement le pourcentage final
            const animatedPercent = compact || hasAnimated ? percent : Math.round(animatedSegments[label] || 0);
            
            return (
              <div 
                key={label}
                className={`flex items-center justify-between transition-all duration-300`}
              >
                <div className="flex items-center gap-1.5">
                  <div 
                    className={`${compact ? 'w-3 h-3' : (isTVMode ? 'w-3 h-3' : 'w-4 h-4')} rounded-full border-2 border-slate-200 transition-all duration-300 flex-shrink-0`}
                    style={{ 
                      backgroundColor: colors[label] || '#cbd5e1',
                      boxShadow: `0 1px 2px rgba(0, 0, 0, 0.1)`
                    }}
                  ></div>
                  <span className={`${compact ? 'text-[10px]' : (isTVMode ? 'text-[10px]' : 'text-sm')} font-semibold text-slate-700 truncate`}>
                    {label}
                  </span>
                </div>
                <span className={`${compact ? 'text-[10px]' : (isTVMode ? 'text-[10px]' : 'text-sm')} font-black text-purple-600 flex-shrink-0`}>
                  {animatedPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
