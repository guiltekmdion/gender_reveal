'use client';

import React from 'react';

type CardColor = 'pink' | 'blue' | 'purple' | 'amber' | 'emerald' | 'white';

interface StatCardProps {
  title: string;
  icon?: React.ElementType;
  color?: CardColor;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const colorClasses: Record<CardColor, string> = {
  pink: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
  white: 'bg-white border-slate-200',
};

export default function StatCard({ 
  title, 
  icon: Icon, 
  color = 'white', 
  children,
  className = '',
  style
}: StatCardProps) {
  // Détection du mode ultra-compact basé sur le className
  const isUltraCompact = className.includes('p-0.5') || className.includes('p-1');
  
  return (
    <div 
      className={`rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${colorClasses[color]} ${className} flex flex-col min-h-0 overflow-hidden`}
      style={style}
    >
      {/* Pas de header en mode ultra-compact pour gagner de la place */}
      {!isUltraCompact && (
        <div className="flex items-center gap-1 flex-shrink-0 mb-2">
          {Icon && <Icon size={16} className="text-slate-700 flex-shrink-0" />}
          <h3 className="font-bold text-slate-800 truncate text-xs">{title}</h3>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
