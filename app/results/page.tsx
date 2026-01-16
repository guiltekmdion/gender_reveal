'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Calendar, Clock, Weight, Ruler, Palette, Eye, ArrowLeft, Users, TrendingUp, QrCode } from 'lucide-react';
import Link from 'next/link';
import BabyAvatar from '@/components/BabyAvatar';
import QRCode from '@/components/QRCode';
import { formatDate, formatDateLong } from '@/lib/date-utils';

interface Vote {
  id: number;
  name: string;
  email?: string;
  choice: 'girl' | 'boy';
  timestamp: number;
  birthDate?: string;
  birthTime?: string;
  weight?: number;
  height?: number;
  hairColor?: string;
  eyeColor?: string;
}

interface AppConfig {
  babyName?: string;
  parentNames?: string;
  dateFormat?: string;
  voteUrl?: string;
  tvMode?: boolean;
}

// Composant Roue de Couleurs - Style Gender Reveal doux
const ColorWheelPastel = ({ 
  data, 
  title, 
  icon: Icon,
  colors,
  isTVMode = false
}: { 
  data: Record<string, number>; 
  title: string; 
  icon: React.ElementType;
  colors: Record<string, string>;
  isTVMode?: boolean;
}) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  
  // Calculate segments for pie chart
  const segments = entries.reduce((acc, [color, count]) => {
    const percent = (count / total) * 100;
    const startPercent = acc.length > 0 ? acc[acc.length - 1].startPercent + acc[acc.length - 1].percent : 0;
    return [...acc, { color, count, percent, startPercent }];
  }, [] as Array<{ color: string; count: number; percent: number; startPercent: number }>);

  const svgSize = isTVMode ? 280 : 140;
  const radius = isTVMode ? 130 : 65;
  const centerRadius = isTVMode ? 50 : 25;

  return (
    <div className={`bg-white rounded-2xl ${isTVMode ? 'p-8 border-2 shadow-md' : 'p-6 border shadow-sm'} border-slate-100`}>
      <div className={`flex items-center gap-2 ${isTVMode ? 'mb-6' : 'mb-4'}`}>
        <Icon className={`${isTVMode ? 'w-8 h-8' : 'w-5 h-5'} text-purple-500`} />
        <h3 className={`${isTVMode ? 'text-2xl' : 'text-base'} font-bold text-slate-700`}>{title}</h3>
      </div>

      <div className={`flex flex-col md:flex-row items-center ${isTVMode ? 'gap-10' : 'gap-6'}`}>
        {/* Pie Chart - Style doux */}
        <div className="relative flex-shrink-0">
          <svg width={svgSize} height={svgSize} viewBox="0 0 140 140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={isTVMode ? "4" : "2"}
            />
            
            {/* Pie segments */}
            {segments.map(({ color, percent, startPercent }) => {
              const startAngle = (startPercent / 100) * 360;
              const endAngle = ((startPercent + percent) / 100) * 360;
              const largeArcFlag = percent > 50 ? 1 : 0;
              
              const innerRadius = radius - 10;
              const startX = 70 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = 70 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = 70 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = 70 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);

              return (
                <g key={color}>
                  <path
                    d={`M 70 70 L ${startX} ${startY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                    fill={colors[color] || '#cbd5e1'}
                    stroke="white"
                    strokeWidth={isTVMode ? "4" : "2"}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx="70"
              cy="70"
              r={centerRadius}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth={isTVMode ? "4" : "2"}
            />
          </svg>
          
          {/* Center icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Icon className={`${isTVMode ? 'w-12 h-12' : 'w-6 h-6'} text-purple-500`} />
          </div>
        </div>

        {/* Legend */}
        <div className={`flex-1 w-full ${isTVMode ? 'space-y-4' : 'space-y-2'}`}>
          {entries.map(([color, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={color}>
                <div className={`flex items-center justify-between ${isTVMode ? 'mb-2' : 'mb-1'}`}>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`${isTVMode ? 'w-5 h-5' : 'w-3 h-3'} rounded-full border border-slate-200`}
                      style={{ backgroundColor: colors[color] || '#cbd5e1' }}
                    ></div>
                    <span className={`${isTVMode ? 'text-xl' : 'text-sm'} font-medium text-slate-700`}>{color}</span>
                  </div>
                  <span className={`${isTVMode ? 'text-xl' : 'text-sm'} font-bold text-purple-600`}>{percent}%</span>
                </div>
                <div className={`${isTVMode ? 'h-3' : 'h-1.5'} bg-slate-100 rounded-full overflow-hidden`}>
                  <div 
                    className="h-full transition-all duration-500 ease-out rounded-full"
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: colors[color] || '#cbd5e1'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);

  // Mettre à jour le temps depuis la dernière mise à jour chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
      setTimeSinceUpdate(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const loadData = async () => {
    if (isRefreshing) return; // Éviter les doublons
    setIsRefreshing(true);
    try {
      const [votesRes, configRes] = await Promise.all([
        fetch('/api/votes'),
        fetch('/api/config'),
      ]);
      
      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);
      }
      
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Rafraîchissement automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadData est stable, pas besoin de dépendance

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 text-purple-500 animate-bounce mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalVotes = votes.length;
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;
  const girlPercent = totalVotes > 0 ? Math.round((girlVotes / totalVotes) * 100) : 0;
  const boyPercent = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 0;

  // Calculate averages for numerical predictions
  const votesWithWeight = votes.filter(v => v.weight);
  const averageWeight = votesWithWeight.length > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / votesWithWeight.length)
    : null;

  const votesWithHeight = votes.filter(v => v.height);
  const averageHeight = votesWithHeight.length > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / votesWithHeight.length)
    : null;

  // Calculate most common predictions
  const hairColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.hairColor) {
      hairColorCounts[v.hairColor] = (hairColorCounts[v.hairColor] || 0) + 1;
    }
  });

  const eyeColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.eyeColor) {
      eyeColorCounts[v.eyeColor] = (eyeColorCounts[v.eyeColor] || 0) + 1;
    }
  });

  // Color mappings - couleurs douces pour gender reveal
  const hairColorMap: Record<string, string> = {
    'Bruns': '#8b6f47',
    'Blonds': '#f5e6b3',
    'Roux': '#d4856a',
    'Noirs': '#4a4a4a',
    'Châtains': '#a67c52'
  };

  const eyeColorMap: Record<string, string> = {
    'Bleus': '#6ba3d4',
    'Verts': '#7ab88f',
    'Marrons': '#a67c52',
    'Noisette': '#b8956a',
    'Gris': '#a0aec0'
  };

  const mostCommonKey = (counts: Record<string, number>): string | null => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || null;
  };

  const mostCommonHair = mostCommonKey(hairColorCounts);
  const mostCommonEyes = mostCommonKey(eyeColorCounts);
  const mostCommonHairHex = mostCommonHair ? hairColorMap[mostCommonHair] : undefined;
  const mostCommonEyeHex = mostCommonEyes ? eyeColorMap[mostCommonEyes] : undefined;
  const mostCommonGender = girlVotes > boyVotes ? 'girl' : boyVotes > girlVotes ? 'boy' : undefined;

  // Date predictions
  const dateCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.birthDate) {
      dateCounts[v.birthDate] = (dateCounts[v.birthDate] || 0) + 1;
    }
  });
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]);

  // Détection du mode TV (via config ou URL)
  const isTVMode = config.tvMode || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tv') === 'true');
  
  // Styles conditionnels pour TV mode
  const containerClass = isTVMode 
    ? 'min-h-screen bg-slate-50 font-sans pb-16 px-8 lg:px-16 xl:px-24 2xl:px-32'
    : 'min-h-screen bg-slate-50 font-sans pb-12';
  
  const contentClass = isTVMode
    ? 'w-full space-y-12 mt-8'
    : 'max-w-4xl mx-auto px-4 mt-6 space-y-6';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={`bg-white shadow-sm ${isTVMode ? 'p-6' : 'p-4'} sticky top-0 z-10 text-center border-b border-slate-100`}>
        <div className={isTVMode ? 'w-full' : 'max-w-4xl mx-auto'}>
          {isTVMode ? (
            // Header simplifié pour TV
            <>
              {/* Indicateur de mise à jour discret en haut à droite */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-xs text-slate-400">{timeSinceUpdate}s</span>
              </div>
              
              <h1 className={`text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center justify-center gap-3 mt-4`}>
                <TrendingUp className="w-12 h-12 text-purple-500" />
                Statistiques & Pronostics
              </h1>
              <p className="text-3xl text-slate-600 font-medium mt-4">
                Les moyennes des pronostics pour {config.babyName || 'Bébé'}
              </p>
            </>
          ) : (
            // Header normal pour desktop/mobile
            <>
              <div className="flex items-center justify-between mb-2">
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour
                </Link>
                
                {/* Indicateur de dernière mise à jour */}
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Mis à jour il y a {timeSinceUpdate}s</span>
                </div>
              </div>
              
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider flex items-center justify-center gap-2">
                <TrendingUp className="text-purple-500" />
                Statistiques & Pronostics
              </h1>
              <p className="text-base text-slate-600 font-medium mt-2">
                Les moyennes des pronostics pour {config.babyName || 'Bébé'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className={contentClass}>
        
        {/* Gender Vote Stats */}
        <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${isTVMode ? 'p-10 border-2' : 'p-6 border'} border-slate-100 ${isTVMode ? 'shadow-2xl' : ''}`}>
          <h2 className={`${isTVMode ? 'text-4xl' : 'text-lg'} font-bold text-slate-800 ${isTVMode ? 'mb-8' : 'mb-4'} flex items-center gap-2`}>
            <Baby size={isTVMode ? 40 : 20} />
            Vote Fille / Garçon
          </h2>
          
          {/* Compteur total proéminent */}
          {totalVotes > 0 && (
            <div className={`text-center mb-6 ${isTVMode ? 'mb-10' : ''}`}>
              <p 
                key={totalVotes}
                className={`${isTVMode ? 'text-7xl' : 'text-4xl'} font-black text-purple-700 transition-all duration-500 ${isTVMode ? 'drop-shadow-lg' : ''} animate-pulse-once`}
                style={{
                  animation: 'pulseOnce 0.6s ease-in-out'
                }}
              >
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </p>
            </div>
          )}
          
          <div className={`grid grid-cols-2 ${isTVMode ? 'gap-10 mb-10' : 'gap-4 mb-4'}`}>
            <div className={`bg-pink-50 rounded-2xl ${isTVMode ? 'p-10 border-2 shadow-lg' : 'p-4 border-2'} border-pink-200 text-center transition-all duration-500 hover:scale-105`}>
              <div className={`${isTVMode ? 'text-9xl' : 'text-5xl'} text-pink-500 mx-auto ${isTVMode ? 'mb-4' : 'mb-2'} leading-none transition-all duration-500`}>♀</div>
              {/* Pourcentage proéminent */}
              <p 
                key={`girl-percent-${girlPercent}`}
                className={`${isTVMode ? 'text-7xl' : 'text-4xl'} font-black text-pink-600 transition-all duration-500 ${isTVMode ? 'drop-shadow-lg mb-2' : ''}`}
                style={{
                  animation: 'pulseOnce 0.6s ease-in-out'
                }}
              >
                {girlPercent}%
              </p>
              <p 
                key={`girl-votes-${girlVotes}`}
                className={`${isTVMode ? 'text-6xl' : 'text-3xl'} font-black text-pink-700 transition-all duration-500 mb-2`}
                style={{
                  animation: 'pulseOnce 0.6s ease-in-out'
                }}
              >
                {girlVotes}
              </p>
              <p className={`${isTVMode ? 'text-2xl' : 'text-sm'} text-pink-600 font-bold ${isTVMode ? 'mt-2' : ''}`}>
                Team Fille
              </p>
            </div>
            <div className={`bg-blue-50 rounded-2xl ${isTVMode ? 'p-10 border-2 shadow-lg' : 'p-4 border-2'} border-blue-200 text-center transition-all duration-500 hover:scale-105`}>
              <div className={`${isTVMode ? 'text-9xl' : 'text-5xl'} text-blue-500 mx-auto ${isTVMode ? 'mb-4' : 'mb-2'} leading-none transition-all duration-500`}>♂</div>
              {/* Pourcentage proéminent */}
              <p 
                key={`boy-percent-${boyPercent}`}
                className={`${isTVMode ? 'text-7xl' : 'text-4xl'} font-black text-blue-600 transition-all duration-500 ${isTVMode ? 'drop-shadow-lg mb-2' : ''}`}
                style={{
                  animation: 'pulseOnce 0.6s ease-in-out'
                }}
              >
                {boyPercent}%
              </p>
              <p 
                key={`boy-votes-${boyVotes}`}
                className={`${isTVMode ? 'text-6xl' : 'text-3xl'} font-black text-blue-700 transition-all duration-500 mb-2`}
                style={{
                  animation: 'pulseOnce 0.6s ease-in-out'
                }}
              >
                {boyVotes}
              </p>
              <p className={`${isTVMode ? 'text-2xl' : 'text-sm'} text-blue-600 font-bold ${isTVMode ? 'mt-2' : ''}`}>
                Team Garçon
              </p>
            </div>
          </div>

          <div className={`${isTVMode ? 'h-12' : 'h-6'} w-full flex rounded-full overflow-hidden bg-slate-100 ${isTVMode ? 'shadow-inner border-2 border-slate-200' : ''}`}>
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out"
              style={{ width: `${totalVotes > 0 ? (girlVotes / totalVotes) * 100 : 50}%` }}
            />
            <div 
              className="h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${totalVotes > 0 ? (boyVotes / totalVotes) * 100 : 50}%` }}
            />
          </div>
        </div>

        {/* Averages */}
        <div className={`bg-white rounded-3xl shadow-lg ${isTVMode ? 'p-10 border-2 shadow-2xl' : 'p-6 border'} border-slate-100`}>
          <h2 className={`${isTVMode ? 'text-4xl' : 'text-lg'} font-bold text-slate-800 ${isTVMode ? 'mb-8' : 'mb-4'} flex items-center gap-2`}>
            <TrendingUp size={isTVMode ? 40 : 20} />
            Moyennes des pronostics
          </h2>

          {(mostCommonHair || mostCommonEyes) && (
            <div className={`bg-slate-50 rounded-2xl ${isTVMode ? 'p-8 border-2' : 'p-5 border'} border-slate-100 ${isTVMode ? 'mb-8' : 'mb-6'}`}>
              <div className={`flex items-center justify-between ${isTVMode ? 'mb-4' : 'mb-3'}`}>
                <p className={`${isTVMode ? 'text-xl' : 'text-sm'} font-bold text-slate-700`}>Portrait moyen</p>
                <p className={`${isTVMode ? 'text-sm' : 'text-[10px]'} text-slate-400`}>Prédictions les plus fréquentes</p>
              </div>
              <div className="flex justify-center">
                <BabyAvatar 
                  hairColor={mostCommonHairHex} 
                  eyeColor={mostCommonEyeHex} 
                  gender={mostCommonGender}
                  size={isTVMode ? 300 : 112}
                />
              </div>
              <div className={`${isTVMode ? 'mt-4' : 'mt-3'} flex items-center justify-center gap-2 ${isTVMode ? 'text-lg' : 'text-xs'} text-slate-600`}>
                <span>
                  Genre: <span className="font-semibold">{mostCommonGender === 'girl' ? 'Fille' : mostCommonGender === 'boy' ? 'Garçon' : '—'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Cheveux: <span className="font-semibold">{mostCommonHair || '—'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Yeux: <span className="font-semibold">{mostCommonEyes || '—'}</span>
                </span>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 ${isTVMode ? 'gap-10 mb-10' : 'gap-4 mb-6'}`}>
            {averageWeight && (
              <div className={`bg-purple-50 rounded-xl ${isTVMode ? 'p-10 border-2 shadow-lg' : 'p-4 border'} border-purple-100 text-center transition-all duration-500 hover:scale-105`}>
                <Weight className={`${isTVMode ? 'w-16 h-16' : 'w-8 h-8'} text-purple-600 mx-auto ${isTVMode ? 'mb-6' : 'mb-2'}`} />
                <p className={`${isTVMode ? 'text-6xl' : 'text-2xl'} font-black text-purple-700 transition-all duration-500 ${isTVMode ? 'drop-shadow-lg' : ''}`}>{averageWeight}g</p>
                <p className={`${isTVMode ? 'text-2xl' : 'text-xs'} text-purple-600 font-bold ${isTVMode ? 'mt-3' : ''}`}>Poids moyen</p>
                <p className={`${isTVMode ? 'text-lg' : 'text-[10px]'} text-slate-400 ${isTVMode ? 'mt-2' : 'mt-1'}`}>{votesWithWeight.length} vote(s)</p>
              </div>
            )}

            {averageHeight && (
              <div className={`bg-indigo-50 rounded-xl ${isTVMode ? 'p-10 border-2 shadow-lg' : 'p-4 border'} border-indigo-100 text-center transition-all duration-500 hover:scale-105`}>
                <Ruler className={`${isTVMode ? 'w-16 h-16' : 'w-8 h-8'} text-indigo-600 mx-auto ${isTVMode ? 'mb-6' : 'mb-2'}`} />
                <p className={`${isTVMode ? 'text-6xl' : 'text-2xl'} font-black text-indigo-700 transition-all duration-500 ${isTVMode ? 'drop-shadow-lg' : ''}`}>{averageHeight}cm</p>
                <p className={`${isTVMode ? 'text-2xl' : 'text-xs'} text-indigo-600 font-bold ${isTVMode ? 'mt-3' : ''}`}>Taille moyenne</p>
                <p className={`${isTVMode ? 'text-lg' : 'text-[10px]'} text-slate-400 ${isTVMode ? 'mt-2' : 'mt-1'}`}>{votesWithHeight.length} vote(s)</p>
              </div>
            )}
          </div>

          {/* Color Wheels */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${isTVMode ? 'gap-10' : 'gap-6'}`}>
            {Object.keys(hairColorCounts).length > 0 && (
              <ColorWheelPastel
                data={hairColorCounts}
                title="Couleur des cheveux"
                icon={Palette}
                colors={hairColorMap}
                isTVMode={isTVMode}
              />
            )}

            {Object.keys(eyeColorCounts).length > 0 && (
              <ColorWheelPastel
                data={eyeColorCounts}
                title="Couleur des yeux"
                icon={Eye}
                colors={eyeColorMap}
                isTVMode={isTVMode}
              />
            )}
          </div>

          {!averageWeight && !averageHeight && Object.keys(hairColorCounts).length === 0 && Object.keys(eyeColorCounts).length === 0 && (
            <p className="text-center text-slate-400 italic py-4">
              Aucun pronostic détaillé pour l&apos;instant
            </p>
          )}
        </div>

        {/* Most Popular Birth Dates */}
        {sortedDates.length > 0 && (
          <div className={`bg-white rounded-3xl shadow-lg ${isTVMode ? 'p-10 border-2 shadow-2xl' : 'p-6 border'} border-slate-100`}>
            <h2 className={`${isTVMode ? 'text-4xl' : 'text-lg'} font-bold text-slate-800 ${isTVMode ? 'mb-8' : 'mb-4'} flex items-center gap-2`}>
              <Calendar size={isTVMode ? 40 : 20} />
              Dates de naissance les plus populaires
            </h2>
            <div className={isTVMode ? 'space-y-5' : 'space-y-2'}>
              {sortedDates.slice(0, 5).map(([date, count], index) => (
                <div 
                  key={date}
                  className={`flex items-center justify-between ${isTVMode ? 'p-8 bg-slate-50 rounded-xl border-2 border-slate-200 shadow-md' : 'p-3 bg-slate-50 rounded-lg'} transition-all duration-300 hover:shadow-lg`}
                >
                  <div className={`flex items-center ${isTVMode ? 'gap-8' : 'gap-3'}`}>
                    <div className={`${isTVMode ? 'w-16 h-16 text-2xl' : 'w-8 h-8 text-sm'} bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold border-2 border-purple-200`}>
                      {index + 1}
                    </div>
                    <span className={`${isTVMode ? 'text-3xl' : 'text-base'} font-bold text-slate-700`}>
                      {formatDateLong(date, undefined, config)}
                    </span>
                  </div>
                  <span className={`${isTVMode ? 'text-2xl' : 'text-sm'} font-black text-purple-600 ${isTVMode ? 'drop-shadow-md' : ''}`}>{count} vote(s)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code pour voter - Déplacé après les statistiques */}
        {config.voteUrl && (
          <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${isTVMode ? 'p-10 border-2 shadow-2xl' : 'p-6 border'} border-slate-100`}>
            <h2 className={`${isTVMode ? 'text-4xl' : 'text-lg'} font-bold text-slate-800 ${isTVMode ? 'mb-8' : 'mb-4'} flex items-center gap-2`}>
              <QrCode size={isTVMode ? 40 : 20} />
              Scanner pour voter
            </h2>
            <div className={`flex flex-col md:flex-row items-center ${isTVMode ? 'gap-10' : 'gap-6'}`}>
              <QRCode value={config.voteUrl} size={isTVMode ? 300 : 200} />
              <div className="flex-1 text-center md:text-left">
                <p className={`${isTVMode ? 'text-xl' : 'text-sm'} text-slate-600 mb-2`}>
                  Scannez ce QR code pour accéder directement à la page de vote
                </p>
                <a
                  href={config.voteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isTVMode ? 'text-lg' : 'text-sm'} text-purple-600 hover:text-purple-700 font-medium underline break-all`}
                >
                  {config.voteUrl}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* List of All Voters - Masquée en mode TV */}
        {!isTVMode && (
        <div className={`bg-white rounded-3xl shadow-lg p-6 border border-slate-100`}>
          <h2 className={`${isTVMode ? 'text-3xl' : 'text-lg'} font-bold text-slate-800 ${isTVMode ? 'mb-6' : 'mb-4'} flex items-center gap-2`}>
            <Users size={isTVMode ? 32 : 20} />
            Tous les participants ({totalVotes})
          </h2>
          
          <div className={isTVMode ? 'space-y-4' : 'space-y-2'}>
            {votes.length === 0 ? (
              <p className={`text-center text-slate-400 italic ${isTVMode ? 'py-8 text-2xl' : 'py-4'}`}>
                Aucun vote pour l&apos;instant
              </p>
            ) : (
              votes.map((vote) => {
                const hasExtendedPredictions = vote.birthDate || vote.birthTime || vote.weight || vote.height || vote.hairColor || vote.eyeColor;
                
                return (
                  <div 
                    key={vote.id}
                    className={`${isTVMode ? 'p-6 border border-slate-200' : 'p-4'} bg-slate-50 rounded-xl`}
                  >
                    <div className={`flex items-center justify-between ${isTVMode ? 'mb-4' : 'mb-2'}`}>
                      <div className={`flex items-center ${isTVMode ? 'gap-6' : 'gap-3'}`}>
                        <div className={`${isTVMode ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-base'} rounded-full flex items-center justify-center text-white font-bold
                          ${vote.choice === 'girl' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                        `}>
                          {vote.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`${isTVMode ? 'text-2xl' : 'text-base'} font-bold text-slate-800`}>{vote.name}</p>
                          <p className={`${isTVMode ? 'text-lg' : 'text-xs'} font-medium uppercase ${vote.choice === 'girl' ? 'text-pink-500' : 'text-blue-500'}`}>
                            Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                          </p>
                        </div>
                      </div>
                      <span className={`${isTVMode ? 'text-lg' : 'text-xs'} text-slate-400`}>
                        {formatDate(new Date(vote.timestamp), undefined, config)}
                      </span>
                    </div>

                    {hasExtendedPredictions && (
                      <div className={`${isTVMode ? 'ml-20 mt-4 pt-4 border-t-2' : 'ml-13 mt-3 pt-3 border-t'} border-slate-200 grid grid-cols-2 md:grid-cols-3 ${isTVMode ? 'gap-4 text-lg' : 'gap-2 text-xs'}`}>
                        {vote.birthDate && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Calendar size={isTVMode ? 20 : 12} className="text-purple-500" />
                            <span>{formatDate(vote.birthDate, undefined, config)}</span>
                          </div>
                        )}
                        {vote.birthTime && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Clock size={isTVMode ? 20 : 12} className="text-purple-500" />
                            <span>{vote.birthTime}</span>
                          </div>
                        )}
                        {vote.weight && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Weight size={isTVMode ? 20 : 12} className="text-purple-500" />
                            <span>{vote.weight}g</span>
                          </div>
                        )}
                        {vote.height && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Ruler size={isTVMode ? 20 : 12} className="text-purple-500" />
                            <span>{vote.height}cm</span>
                          </div>
                        )}
                        {vote.hairColor && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Palette size={isTVMode ? 20 : 12} className="text-amber-500" />
                            <span>{vote.hairColor}</span>
                          </div>
                        )}
                        {vote.eyeColor && (
                          <div className={`flex items-center ${isTVMode ? 'gap-2' : 'gap-1'} text-slate-600`}>
                            <Eye size={isTVMode ? 20 : 12} className="text-emerald-500" />
                            <span>{vote.eyeColor}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
