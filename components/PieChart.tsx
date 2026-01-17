'use client';

import React, { useEffect, useState } from 'react';

interface PieChartProps {
  girlPercent: number;
  boyPercent: number;
  size?: number;
  isTVMode?: boolean;
}

export default function PieChart({ girlPercent, boyPercent, size = 200, isTVMode = false }: PieChartProps) {
  const [animatedGirl, setAnimatedGirl] = useState(0);
  const [animatedBoy, setAnimatedBoy] = useState(0);

  useEffect(() => {
    // Animation progressive du graphique
    const duration = 1500;
    const steps = 60;
    const girlStep = girlPercent / steps;
    const boyStep = boyPercent / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedGirl(Math.min(girlPercent, currentStep * girlStep));
      setAnimatedBoy(Math.min(boyPercent, currentStep * boyStep));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [girlPercent, boyPercent]);

  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calcul des angles pour le pie chart
  const girlAngle = (animatedGirl / 100) * 360;
  const boyAngle = (animatedBoy / 100) * 360;
  
  // Coordonnées pour les arcs
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

  const girlStartAngle = 0;
  const girlEndAngle = girlAngle;
  const boyStartAngle = girlEndAngle;
  const boyEndAngle = boyStartAngle + boyAngle;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
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
        
        {/* Segment Fille (Pink) */}
        {animatedGirl > 0 && (
          <path
            d={getArcPath(girlStartAngle, girlEndAngle)}
            fill="url(#girlGradient)"
            className="transition-all duration-500"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(236, 72, 153, 0.3))' }}
          >
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              fill="freeze"
            />
          </path>
        )}
        
        {/* Segment Garçon (Blue) */}
        {animatedBoy > 0 && (
          <path
            d={getArcPath(boyStartAngle, boyEndAngle)}
            fill="url(#boyGradient)"
            className="transition-all duration-500"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))' }}
          >
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin="0.3s"
              fill="freeze"
            />
          </path>
        )}
        
        {/* Définition des gradients */}
        <defs>
          <linearGradient id="girlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="boyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Texte central avec pourcentages */}
        {(girlPercent + boyPercent) > 0 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={radius - 30}
              fill="white"
              className="opacity-90"
            />
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="fill-purple-700 font-black"
              transform={`rotate(90 ${centerX} ${centerY})`}
              style={{ fontSize: isTVMode ? '14px' : '18px' }}
            >
              {Math.round(animatedGirl)}%
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              className="fill-purple-600 font-bold"
              transform={`rotate(90 ${centerX} ${centerY})`}
              style={{ fontSize: isTVMode ? '10px' : '12px' }}
            >
              {Math.round(animatedBoy)}%
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
