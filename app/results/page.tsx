'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Baby, Calendar, Clock, Weight, Ruler, Palette, Eye, ArrowLeft, Users, TrendingUp, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BabyAvatar from '@/components/BabyAvatar';
import PieChart from '@/components/PieChart';
import Histogram from '@/components/Histogram';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import ColorPieChart from '@/components/ColorPieChart';
import NameCloud from '@/components/NameCloud';
import StatCard from '@/components/StatCard';
import QRCode from '@/components/QRCode';
import FunFacts from '@/components/FunFacts';
import MessageCarousel from '@/components/MessageCarousel';
import TeamBattleThermometer from '@/components/TeamBattleThermometer';
import Extremes from '@/components/Extremes';
import Averages from '@/components/Averages';
import LiveNotification from '@/components/LiveNotification';
import BabyPortrait from '@/components/BabyPortrait';
import { formatDate, formatDateTime, getTimezone } from '@/lib/date-utils';
import { computeStats } from '@/lib/stats/engine';
import { usePolling } from '@/lib/hooks/usePolling';
import { maskEmail } from '@/lib/sanitization';
import { toGender } from '@/lib/gender-utils';
import type { Vote, AppConfig } from '@/lib/storage';

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const debugMode = searchParams?.get('debug') === '1';
  
  const [config, setConfig] = useState<AppConfig>({});
  const [clientTime, setClientTime] = useState<Date | null>(null);
  const [latestVote, setLatestVote] = useState<Vote | null>(null);

  // Polling pour les votes avec usePolling hook
  const {
    data: votes,
    error: votesError,
    isRefreshing,
    lastUpdate,
    manualRefresh,
  } = usePolling<Vote[]>({
    fetchFn: async () => {
      const res = await fetch('/api/votes');
      if (!res.ok) throw new Error('Failed to fetch votes');
      const data = await res.json();
      return Array.isArray(data) ? data : (data.votes || []);
    },
    interval: 10000,
    compareFn: (oldData, newData) => {
      // Comparer par IDs pour détecter les nouveaux votes
      if (!oldData || oldData.length !== newData.length) return false;
      const oldIds = new Set(oldData.map(v => v.id));
      return newData.every(v => oldIds.has(v.id));
    },
    onSuccess: (newVotes) => {
      // Détecter nouveau vote pour notification
      if (votes && newVotes.length > votes.length && newVotes.length > 0) {
        const newest = newVotes[0]; // Déjà trié par timestamp DESC
        setLatestVote(newest);
      }
    },
  });

  // Fetch config (une seule fois au chargement)
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  // Mettre à jour le temps client (SSR-safe)
  useEffect(() => {
    setClientTime(new Date());
    const timer = setInterval(() => {
      setClientTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculer les stats avec le moteur centralisé (useMemo pour performance)
  const stats = useMemo(() => {
    if (!votes) return null;
    return computeStats(votes, config);
  }, [votes, config]);

  // Utiliser les stats calculées (ou valeurs par défaut si pas encore chargées)
  const totalVotes = stats?.totalVotes ?? 0;
  const girlVotes = stats?.girlVotes ?? 0;
  const boyVotes = stats?.boyVotes ?? 0;
  const girlPercent = stats?.girlPercent ?? 50;
  const boyPercent = stats?.boyPercent ?? 50;
  const mostCommonGender = stats?.mostCommonGender ?? null;
  const mostCommonHair = stats?.mostCommonHair ?? null;
  const mostCommonEyes = stats?.mostCommonEyes ?? null;
  const averageWeight = stats?.averageWeight ?? null;
  const averageHeight = stats?.averageHeight ?? null;
  const hairColorCounts = stats?.hairColorCounts ?? {};
  const eyeColorCounts = stats?.eyeColorCounts ?? {};
  const dateCounts = stats?.dateCounts ?? {};
  const timeCounts = stats?.timeCounts ?? {};
  const sortedDates = stats?.topDates ?? [];
  const sortedTimes = stats?.topTimes ?? [];
  const weightData = stats?.weightData ?? [];
  const heightData = stats?.heightData ?? [];
  const timeData = stats?.timeData ?? [];

  // Color mappings
  const hairColorMap: Record<string, string> = {
    'Blonds': '#f5e6b3',
    'Bruns': '#8b4513',
    'Châtains': '#a0522d',
    'Roux': '#ff6347',
    'Noirs': '#1a1a1a',
    'Autres': '#cccccc',
  };

  const eyeColorMap: Record<string, string> = {
    'Bleus': '#4682b4',
    'Verts': '#90ee90',
    'Marrons': '#8b4513',
    'Noisette': '#cd853f',
    'Gris': '#a0aec0',
    'Autres': '#cccccc',
  };

  const mostCommonHairHex = mostCommonHair ? hairColorMap[mostCommonHair] || '#f5e6b3' : '#f5e6b3';
  const mostCommonEyeHex = mostCommonEyes ? eyeColorMap[mostCommonEyes] || '#4682b4' : '#4682b4';

  // Format de l'heure de dernière mise à jour (SSR-safe)
  const lastUpdateTime = useMemo(() => {
    if (!lastUpdate || !clientTime) return null;
    const timezone = getTimezone(config);
    try {
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return formatter.format(new Date(lastUpdate));
    } catch {
      return new Date(lastUpdate).toLocaleTimeString('fr-FR');
    }
  }, [lastUpdate, clientTime, config]);

  // Panneau de debug (si ?debug=1)
  const DebugPanel = debugMode && stats ? (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs p-4 rounded-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Total votes: {stats.totalVotes}</div>
        <div>Valid weight count: {stats.validWeightCount}</div>
        <div>Valid height count: {stats.validHeightCount}</div>
        {votesError && <div className="text-red-400">Erreur: {votesError.message}</div>}
        <div>Last update: {lastUpdate ? new Date(lastUpdate).toISOString() : 'N/A'}</div>
        <div>Build: {process.env.NEXT_PUBLIC_BUILD_TIME || 'dev'}</div>
      </div>
    </div>
  ) : null;

  // Filtrer les votes avec poids et taille pour les histogrammes
  const votesWithWeight = useMemo(() => {
    return (votes || []).filter(v => v.weight && v.weight > 0);
  }, [votes]);

  const votesWithHeight = useMemo(() => {
    return (votes || []).filter(v => v.height && v.height > 0);
  }, [votes]);

  // PARTY MODE LAYOUT
  if (config.partyMode) {
    return (
      <>
        {DebugPanel}
      <div className="h-screen w-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col overflow-hidden">
        {/* Header Compact - Hauteur fixe */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200 px-4 py-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 rounded-full border border-green-200">
                <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-purple-500 animate-pulse' : 'bg-green-500 animate-glow'}`}></div>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">En direct</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Party Mode Content - 16:9 optimized - Utilise tout l'espace restant */}
        <div className="flex-1 overflow-hidden p-2">
          <div className="h-full flex flex-col gap-2">
            {/* Ligne du haut - 32% - Battle + Bébé + Fun Facts */}
            <div className="h-[32%] flex gap-2">
              {/* Battle - 30% */}
              <div className="w-[30%]">
                <TeamBattleThermometer 
                  girlVotes={girlVotes} 
                  boyVotes={boyVotes} 
                  orientation="vertical"
                  animated={true}
                />
              </div>
              
              {/* Bébé Portrait - 30% */}
              <div className="w-[30%]">
                <BabyPortrait votes={votes || []} config={config} />
              </div>
              
              {/* Fun Facts avec QR Code - 40% */}
              <div className="flex-1">
                <FunFacts votes={votes || []} config={config} autoRotate={true} intervalSeconds={12} includeQRCode={true} compact={true} />
              </div>
            </div>
            
            {/* Ligne du bas - 68% - Messages à gauche (30%) + Stats à droite (70%) */}
            <div className="h-[68%] flex gap-2">
              {/* Message Carousel en hauteur - 30% de largeur */}
              <div className="w-[30%]">
                <MessageCarousel votes={votes || []} displayDuration={8000} animationType="slide" />
              </div>
              
              {/* Grid Stats Ultra Compactes - 70% de largeur */}
              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-6 auto-rows-fr gap-1 h-full">
                  {/* LIGNE 1 - Stats + Moyennes + Cheveux/Yeux */}
                  {/* Stats Globales - 2 cols */}
                  <div className="col-span-2 row-span-1">
                    <StatCard title="Stats" icon={Users} color="purple" className="p-1.5">
                      <div className="grid grid-cols-2 gap-1.5 text-center w-full">
                        <div className="bg-purple-50 rounded p-2 border border-purple-200">
                          <p className="text-2xl font-black text-purple-600">{totalVotes}</p>
                          <p className="text-[10px] text-purple-500 font-bold uppercase">Votes</p>
                        </div>
                        <div className="bg-pink-50 rounded p-2 border border-pink-200">
                          <p className="text-2xl font-black text-pink-600">{stats?.votesWithMessages ?? 0}</p>
                          <p className="text-[10px] text-pink-500 font-bold uppercase">Messages</p>
                        </div>
                      </div>
                    </StatCard>
                  </div>
                  
                  {/* Moyennes - 2 cols */}
                  <div className="col-span-2 row-span-1">
                    <Averages votes={votes || []} compact={true} />
                  </div>
                  
                  {/* Cheveux + Yeux groupés - 2 cols */}
                  <div className="col-span-2 row-span-1 grid grid-cols-2 gap-1">
                    {/* Cheveux */}
                    {Object.keys(hairColorCounts).length > 0 && (
                      <StatCard title="Cheveux" icon={Palette} color="amber" className="p-1.5">
                        <ColorPieChart 
                          data={hairColorCounts}
                          colors={hairColorMap}
                          title=""
                          size={70}
                          compact={true}
                        />
                      </StatCard>
                    )}
                    
                    {/* Yeux */}
                    {Object.keys(eyeColorCounts).length > 0 && (
                      <StatCard title="Yeux" icon={Eye} color="emerald" className="p-1.5">
                        <ColorPieChart 
                          data={eyeColorCounts}
                          colors={eyeColorMap}
                          title=""
                          size={70}
                          compact={true}
                        />
                      </StatCard>
                    )}
                  </div>
                  
                  {/* LIGNE 2 - Calendar + Dates + Heures */}
                  {/* Calendar Heatmap - 2 cols */}
                  {Object.keys(dateCounts).length > 0 && (
                    <div className="col-span-2 row-span-1 overflow-hidden">
                      <CalendarHeatmap 
                        dateCounts={dateCounts} 
                        dueDate={config.dueDate}
                        config={config}
                        monthsToShow={1}
                        compact={true}
                      />
                    </div>
                  )}
                  
                  {/* Dates populaires - 2 cols */}
                  {sortedDates.length > 0 && (
                    <div className="col-span-2 row-span-1">
                      <StatCard title="Dates" icon={Calendar} color="purple" className="p-1.5">
                        <div className="space-y-1.5 w-full">
                          {sortedDates.slice(0, 2).map((item, index) => (
                            <div key={item.date} className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded border border-slate-200">
                              <span className="font-bold text-purple-600">{index + 1}.</span>
                              <span className="font-semibold text-slate-700 flex-1 text-center truncate">{formatDate(item.date, undefined, config)}</span>
                              <span className="font-bold text-purple-600">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </StatCard>
                    </div>
                  )}
                  
                  {/* Heures populaires - 2 cols */}
                  {sortedTimes.length > 0 && (
                    <div className="col-span-2 row-span-1">
                      <StatCard title="Heures" icon={Clock} color="amber" className="p-1.5">
                        <div className="grid grid-cols-2 gap-1.5 text-xs w-full">
                          {sortedTimes.slice(0, 4).map((item) => (
                            <div key={item.time} className="flex items-center justify-between px-2 py-1.5 bg-amber-50 rounded border border-amber-200">
                              <span className="font-bold text-amber-700">{item.time}</span>
                              <span className="text-amber-600 font-semibold">×{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </StatCard>
                    </div>
                  )}
                  
                  {/* LIGNE 3 - Histogrammes + Due Date */}
                  {/* Histogram Poids */}
                  {votesWithWeight.length > 0 && (
                    <div className="col-span-2 row-span-1">
                      <StatCard title="Poids" icon={Weight} color="purple" className="p-1.5">
                        <Histogram 
                          data={weightData}
                          title=""
                          color="#8b5cf6"
                          unit="g"
                          height={60}
                          isTVMode={false}
                          dataType="weight"
                        />
                      </StatCard>
                    </div>
                  )}
                  
                  {/* Histogram Taille */}
                  {votesWithHeight.length > 0 && (
                    <div className="col-span-2 row-span-1">
                      <StatCard title="Taille" icon={Ruler} color="blue" className="p-1.5">
                        <Histogram 
                          data={heightData}
                          title=""
                          color="#3b82f6"
                          unit="cm"
                          height={60}
                          isTVMode={false}
                          dataType="height"
                        />
                      </StatCard>
                    </div>
                  )}
                  
                  {/* Due Date - 2 cols */}
                  {config.dueDate && (
                    <div className="col-span-2 row-span-1">
                      <StatCard title="Terme" icon={Calendar} color="amber" className="p-1.5">
                        <div className="text-center">
                          <p className="text-2xl font-black text-amber-600 leading-tight">
                            {formatDate(config.dueDate, undefined, config)}
                          </p>
                          <p className="text-[10px] text-amber-500 font-bold mt-1 uppercase">Terme prévu</p>
                        </div>
                      </StatCard>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // NORMAL LAYOUT (pas de party mode)
  return (
    <>
      {DebugPanel}
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col">
      {/* Header compact style VS */}
      <div className="bg-white shadow-lg border-b border-slate-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Badge En direct en coin supérieur droit */}
          <div className="flex justify-between items-center mb-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full border border-green-200">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-purple-500 animate-pulse' : 'bg-green-500 animate-glow'}`}></div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">En direct</span>
              </div>
              {lastUpdateTime && (
                <span className="text-xs text-slate-500">
                  Dernière mise à jour : {lastUpdateTime}
                </span>
              )}
            </div>
          </div>

          {/* Barre de score VS style page principale */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-1">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest px-4 py-2 text-slate-500">
              <span className="text-pink-500">Team Fille ({girlVotes})</span>
              <span className="text-blue-500">Team Garçon ({boyVotes})</span>
            </div>
            
            <div className="h-8 w-full flex rounded-full overflow-hidden bg-slate-100 relative">
              {/* Pink Bar */}
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ease-out flex items-center justify-start pl-3"
                style={{ width: `${girlPercent}%` }}
              >
                {girlPercent > 12 && <span className="text-xs text-white font-bold">{girlPercent}%</span>}
              </div>
              
              {/* Blue Bar */}
              <div 
                className="h-full bg-gradient-to-l from-blue-400 to-blue-600 transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                style={{ width: `${boyPercent}%` }}
              >
                {boyPercent > 12 && <span className="text-xs text-white font-bold">{boyPercent}%</span>}
              </div>

              {/* Center VS Badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md border border-slate-100 z-10">
                <div className="bg-slate-800 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full">
                  VS
                </div>
              </div>
            </div>

            {/* Total votes sous la barre */}
            <div className="text-center py-2">
              <span className="text-sm text-slate-600 font-medium">
                {totalVotes} {totalVotes === 1 ? 'pronostic' : 'pronostics'} {config.babyName && `pour ${config.babyName}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard - Responsive et extensible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 flex-1 overflow-auto">
        {/* Card 1: Votes Fille/Garçon avec PieChart */}
        <StatCard title="Vote Fille / Garçon" icon={Baby} color="white" className="animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <PieChart 
              girlPercent={girlPercent} 
              boyPercent={boyPercent} 
              size={140}
              isTVMode={false}
            />
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-3 border-2 border-pink-200 text-center">
                <div className="text-3xl text-pink-500 mb-1">♀</div>
                <p className="text-2xl font-black text-pink-600">{girlPercent}%</p>
                <p className="text-xs text-pink-600 font-bold">Team Fille</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-3 border-2 border-blue-200 text-center">
                <div className="text-3xl text-blue-500 mb-1">♂</div>
                <p className="text-2xl font-black text-blue-600">{boyPercent}%</p>
                <p className="text-xs text-blue-600 font-bold">Team Garçon</p>
              </div>
            </div>
          </div>
        </StatCard>

        {/* Card 2: Portrait Moyen */}
        {(mostCommonHair || mostCommonEyes) && (
          <StatCard title="Portrait moyen" icon={TrendingUp} color="purple" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-center justify-center h-full">
              <BabyAvatar 
                hairColor={mostCommonHairHex} 
                eyeColor={mostCommonEyeHex} 
                gender={toGender(mostCommonGender)}
                size={120}
              />
              <div className="mt-2 text-center text-xs text-slate-600">
                <span className="font-semibold">{mostCommonGender === 'girl' ? 'Fille' : 'Garçon'}</span>
                {' • '}
                <span className="font-semibold">{mostCommonHair}</span>
                {' • '}
                <span className="font-semibold">{mostCommonEyes}</span>
              </div>
            </div>
          </StatCard>
        )}

        {/* Card 3: Nuage de Prénoms */}
        {stats && !stats.isEmpty && votes && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <NameCloud 
              names={votes.map(v => ({ name: v.name, choice: v.choice }))}
              title="Tous les pronostics"
              isTVMode={false}
              compact={true}
            />
          </div>
        )}

        {/* Card 4: Cheveux */}
        {Object.keys(hairColorCounts).length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <StatCard title="" icon={Palette} color="amber">
              <ColorPieChart
                data={hairColorCounts}
                title="Cheveux"
                icon={Palette}
                colors={hairColorMap}
                size={120}
                isTVMode={false}
                compact={true}
              />
            </StatCard>
          </div>
        )}

        {/* Card 5: Yeux */}
        {Object.keys(eyeColorCounts).length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <StatCard title="" icon={Eye} color="emerald">
              <ColorPieChart
                data={eyeColorCounts}
                title="Yeux"
                icon={Eye}
                colors={eyeColorMap}
                size={120}
                isTVMode={false}
                compact={true}
              />
            </StatCard>
          </div>
        )}

        {/* Card 6: Poids/Taille */}
        {(averageWeight || averageHeight) && (
          <StatCard title="Moyennes" icon={TrendingUp} color="purple" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="grid grid-cols-2 gap-3 h-full items-center">
              {averageWeight && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-3 border-2 border-purple-200 text-center">
                  <Weight className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-purple-700">{averageWeight}g</p>
                  <p className="text-xs text-purple-600 font-bold">Poids</p>
                </div>
              )}
              {averageHeight && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-3 border-2 border-indigo-200 text-center">
                  <Ruler className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-indigo-700">{averageHeight}cm</p>
                  <p className="text-xs text-indigo-600 font-bold">Taille</p>
                </div>
              )}
            </div>
          </StatCard>
        )}

        {/* Card 7: Calendrier */}
        {Object.keys(dateCounts).length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CalendarHeatmap 
              dateCounts={dateCounts}
              dueDate={config.dueDate}
              isTVMode={false}
              config={config}
              monthsToShow={1}
              compact={true}
            />
          </div>
        )}

        {/* Card 8: Top 5 Dates */}
        {sortedDates.length > 0 && (
          <StatCard title="Dates populaires" icon={Calendar} color="purple" className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="space-y-2 overflow-y-auto">
              {sortedDates.slice(0, 5).map((item, index) => (
                <div 
                  key={item.date}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-200">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {formatDate(item.date, undefined, config)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{item.count}</span>
                </div>
              ))}
            </div>
          </StatCard>
        )}

        {/* Card 9: Feed Live - 3 derniers votes */}
        <StatCard title="Votes récents" icon={Users} color="white" className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="space-y-2 overflow-y-auto h-full">
            {stats?.isEmpty || !votes || votes.length === 0 ? (
              <p className="text-center text-slate-400 italic py-8 text-xs">
                Pas encore de votes
              </p>
            ) : (
              (stats?.recentVotes ?? votes.slice(0, 3)).slice(0, 3).map((vote) => {
                const voteTime = new Date(vote.timestamp);
                const isNew = (Date.now() - voteTime.getTime()) < 60000;
                
                return (
                  <div
                    key={vote.id}
                    className="p-2 bg-white rounded-2xl border-2 border-slate-200 shadow-xl"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold
                        ${vote.choice === 'girl' 
                          ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                          : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                      `}>
                        {vote.choice === 'girl' ? '♀' : '♂'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{vote.name}</p>
                        <p className={`text-xs font-medium ${vote.choice === 'girl' ? 'text-pink-400' : 'text-blue-400'}`}>
                          Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                        </p>
                      </div>
                    </div>
                    
                    {vote.message && (
                      <div className="mt-1 p-1.5 bg-purple-50 rounded text-xs text-slate-700 line-clamp-2">
                        💬 {vote.message}
                      </div>
                    )}
                    
                    <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
                      {vote.birthDate && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          📅 {formatDate(vote.birthDate, undefined, config)}
                        </span>
                      )}
                      {vote.weight && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          ⚖️ {vote.weight}g
                        </span>
                      )}
                      {vote.height && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          📏 {vote.height}cm
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </StatCard>

        {/* Card 10: Distribution des poids */}
        {weightData.length > 1 && (
          <StatCard title="Distribution des poids" icon={Weight} color="purple" className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <div className="h-full flex items-center">
              <Histogram 
                data={weightData} 
                title="" 
                unit="g" 
                color="#8b5cf6"
                height={120}
                bins={8}
                isTVMode={false}
                dataType="weight"
              />
            </div>
          </StatCard>
        )}

        {/* Card 11: Distribution des tailles */}
        {heightData.length > 1 && (
          <StatCard title="Distribution des tailles" icon={Ruler} color="blue" className="animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="h-full flex items-center">
              <Histogram 
                data={heightData} 
                title="" 
                unit="cm" 
                color="#6366f1"
                height={120}
                bins={8}
                isTVMode={false}
                dataType="height"
              />
            </div>
          </StatCard>
        )}

        {/* Card 12: Heures de naissance populaires */}
        {sortedTimes.length > 0 && (
          <StatCard title="Heures populaires" icon={Clock} color="amber" className="animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="space-y-2 overflow-y-auto">
              {sortedTimes.slice(0, 8).map((item, index) => (
                <div 
                  key={item.time}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs border border-amber-200">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {item.time}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{item.count}</span>
                </div>
              ))}
            </div>
          </StatCard>
        )}

        {/* Card 13: QR Code pour voter */}
        {config.voteUrl && (
          <StatCard title="Scanner pour voter" icon={QrCode} color="white" className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <QRCode value={config.voteUrl} size={140} />
              <p className="text-xs text-slate-600 text-center px-2">
                Partagez ce QR code pour inviter à voter
              </p>
            </div>
          </StatCard>
        )}

        {/* Card 14: Statistiques globales */}
        <StatCard title="Statistiques" icon={TrendingUp} color="emerald" className="animate-fade-in" style={{ animationDelay: '1.3s' }}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
              <span className="text-sm text-slate-700">Total votes</span>
              <span className="text-lg font-black text-emerald-600">{totalVotes}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Avec prédictions</span>
              <span className="text-lg font-black text-slate-700">
                {stats?.votesWithPredictions ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Avec message</span>
              <span className="text-lg font-black text-slate-700">
                {stats?.votesWithMessages ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Avec email</span>
              <span className="text-lg font-black text-slate-700">
                {stats?.votesWithEmail ?? 0}
              </span>
            </div>
          </div>
        </StatCard>

        {/* Card 15: Info DPA (Date Prévue d'Accouchement) si configurée */}
        {config.dueDate && (
          <StatCard title="Date prévue" icon={Calendar} color="pink" className="animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="text-6xl">📅</div>
              <p className="text-2xl font-black text-purple-700">
                {formatDate(config.dueDate, undefined, config)}
              </p>
              <p className="text-xs text-slate-600">
                {config.babyName || 'Bébé'} attendu(e) pour le
              </p>
            </div>
          </StatCard>
        )}
      </div>
    </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}
