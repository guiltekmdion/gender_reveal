'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Calendar, Clock, Weight, Ruler, ArrowLeft, Users, Palette, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BabyAvatar from '@/components/BabyAvatar';
import Histogram from '@/components/Histogram';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import ColorPieChart from '@/components/ColorPieChart';
import StatCard from '@/components/StatCard';
import { MessageCircle } from 'lucide-react';
import { sanitizeMessage, cleanMessage } from '@/lib/sanitization';
import { detectSentiment } from '@/lib/emoji-detector';
import QRCode from '@/components/QRCode';
import TeamBattleThermometer from '@/components/TeamBattleThermometer';
import BabyPortrait from '@/components/BabyPortrait';
import { formatDate, formatDateTime, getTimezone } from '@/lib/date-utils';
import { computeStats } from '@/lib/stats/engine';
import { usePolling } from '@/lib/hooks/usePolling';
import type { Vote, AppConfig } from '@/lib/storage';

function ResultsV2PartyPageContent() {
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
  const averageWeight = stats?.averageWeight ?? null;
  const averageHeight = stats?.averageHeight ?? null;
  const dateCounts = stats?.dateCounts ?? {};
  const timeCounts = stats?.timeCounts ?? {};
  const hairColorCounts = stats?.hairColorCounts ?? {};
  const eyeColorCounts = stats?.eyeColorCounts ?? {};
  const sortedDates = stats?.topDates ?? [];
  const sortedTimes = stats?.topTimes ?? [];
  const weightData = stats?.weightData ?? [];
  const heightData = stats?.heightData ?? [];

  // Get top date and time
  const topDate = sortedDates.length > 0 && sortedDates[0] ? sortedDates[0].date : null;
  const topTime = sortedTimes.length > 0 && sortedTimes[0] ? sortedTimes[0].time : null;

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

  // Calculer les couleurs moyennes pour Team Fille et Team Garçon
  const girlHairColorCounts: Record<string, number> = {};
  const girlEyeColorCounts: Record<string, number> = {};
  const boyHairColorCounts: Record<string, number> = {};
  const boyEyeColorCounts: Record<string, number> = {};

  (votes || []).forEach(v => {
    if (v.choice === 'girl') {
      if (v.hairColor) girlHairColorCounts[v.hairColor] = (girlHairColorCounts[v.hairColor] || 0) + 1;
      if (v.eyeColor) girlEyeColorCounts[v.eyeColor] = (girlEyeColorCounts[v.eyeColor] || 0) + 1;
    } else if (v.choice === 'boy') {
      if (v.hairColor) boyHairColorCounts[v.hairColor] = (boyHairColorCounts[v.hairColor] || 0) + 1;
      if (v.eyeColor) boyEyeColorCounts[v.eyeColor] = (boyEyeColorCounts[v.eyeColor] || 0) + 1;
    }
  });

  // Trouver les couleurs les plus communes pour chaque équipe
  const girlMostCommonHair = Object.keys(girlHairColorCounts).length > 0
    ? Object.entries(girlHairColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const girlMostCommonEyes = Object.keys(girlEyeColorCounts).length > 0
    ? Object.entries(girlEyeColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const boyMostCommonHair = Object.keys(boyHairColorCounts).length > 0
    ? Object.entries(boyHairColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const boyMostCommonEyes = Object.keys(boyEyeColorCounts).length > 0
    ? Object.entries(boyEyeColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // Convertir en valeurs hex
  const girlHairHex = girlMostCommonHair ? (hairColorMap[girlMostCommonHair] || '#8b6f47') : undefined;
  const girlEyesHex = girlMostCommonEyes ? (eyeColorMap[girlMostCommonEyes] || '#5b4636') : undefined;
  const boyHairHex = boyMostCommonHair ? (hairColorMap[boyMostCommonHair] || '#8b6f47') : undefined;
  const boyEyesHex = boyMostCommonEyes ? (eyeColorMap[boyMostCommonEyes] || '#5b4636') : undefined;

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

  // Get recent votes for Info Live
  const recentVotes = useMemo(() => {
    if (!votes || votes.length === 0) return [];
    return votes.slice(0, 5);
  }, [votes]);

  // Get messages votes (with messages) sorted by timestamp DESC (newest first)
  const messagesVotes = useMemo(() => {
    if (!votes) return [];
    return votes
      .filter(v => v.message && v.message.trim().length > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Limiter à 20 messages les plus récents
  }, [votes]);

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

  return (
    <>
      {DebugPanel}
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-md border-b border-slate-200 p-4 flex-shrink-0">
          <div className="max-w-[98%] xl:max-w-[1800px] mx-auto flex justify-between items-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full border border-green-200">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">En direct</span>
              </div>
              {lastUpdateTime && (
                <span className="text-xs text-slate-500">
                  Dernière mise à jour : {lastUpdateTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="max-w-[98%] xl:max-w-[1800px] mx-auto p-6">
          {/* CSS Grid Principal : Sidebar + Zone Principale */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            
            {/* SIDEBAR - QR Code + Messages (Chat scrollable) */}
            <aside className="md:block">
              <div className="space-y-4 md:sticky md:top-6">
                {/* QR Code */}
                {config.voteUrl && (
                  <div className="bg-white rounded-2xl shadow-md p-4">
                    <div className="flex flex-col items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-2">
                        Scanner pour voter
                      </h3>
                      <QRCode value={config.voteUrl} size={180} />
                    </div>
                  </div>
                )}
                
                {/* Messages List - Empilement du haut vers le bas */}
                <div className="bg-white rounded-2xl shadow-md p-4 md:h-[calc(100vh-340px)] overflow-y-auto max-h-[400px] md:max-h-none flex flex-col">
                  <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-black text-purple-700 uppercase tracking-wider">
                      Messages
                    </h3>
                    {messagesVotes.length > 0 && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({messagesVotes.length})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {messagesVotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageCircle className="w-12 h-12 text-purple-300 mb-3" />
                        <p className="text-sm text-slate-400 font-medium">
                          Aucun message pour l&apos;instant
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Laissez un petit mot avec votre vote !
                        </p>
                      </div>
                    ) : (
                      messagesVotes.map((vote, index) => {
                        const emoji = detectSentiment(vote.message || '');
                        return (
                          <div
                            key={vote.id}
                            className="animate-slide-in-up bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200 shadow-sm"
                            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                          >
                            {/* Header avec avatar et nom */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                                vote.choice === 'girl' 
                                  ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                                  : 'bg-gradient-to-br from-blue-400 to-blue-600'
                              }`}>
                                {vote.choice === 'girl' ? '♀' : '♂'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">
                                  {vote.name}
                                </p>
                                <p className={`text-xs font-bold ${
                                  vote.choice === 'girl' ? 'text-pink-500' : 'text-blue-500'
                                }`}>
                                  Team {vote.choice === 'girl' ? 'Fille' : 'Garçon'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Message */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 mb-2">
                              <div className="flex items-start gap-2">
                                <span className="text-lg flex-shrink-0">{emoji}</span>
                                <p 
                                  className="text-xs text-slate-700 leading-relaxed flex-1"
                                  dangerouslySetInnerHTML={{ 
                                    __html: `&ldquo;${sanitizeMessage(cleanMessage(vote.message || '', 150))}&rdquo;` 
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Timestamp */}
                            <p className="text-[10px] text-slate-400 text-right">
                              {formatDateTime(new Date(vote.timestamp), undefined, config)}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* ZONE PRINCIPALE */}
            <div className="space-y-6">
              
              {/* A. BATTLE BAR - Pleine largeur avec Avatars */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  {/* Avatar Fille */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2 order-1 md:order-1">
                    <div className="w-16 h-16 md:w-20 md:h-20">
                      <BabyAvatar 
                        gender="girl"
                        hairColor={girlHairHex}
                        eyeColor={girlEyesHex}
                        size={64}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-black text-pink-600">{girlPercent}%</p>
                      <p className="text-xs font-bold text-pink-500 uppercase">Team Fille</p>
                      <p className="text-xs text-slate-600 font-medium">({girlVotes} votes)</p>
                    </div>
                  </div>

                  {/* Thermomètre Battle */}
                  <div className="flex-1 w-full order-3 md:order-2">
                    <TeamBattleThermometer 
                      girlVotes={girlVotes} 
                      boyVotes={boyVotes} 
                      orientation="horizontal"
                      animated={true}
                    />
                  </div>

                  {/* Avatar Garçon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2 order-2 md:order-3">
                    <div className="w-16 h-16 md:w-20 md:h-20">
                      <BabyAvatar 
                        gender="boy"
                        hairColor={boyHairHex}
                        eyeColor={boyEyesHex}
                        size={64}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-black text-blue-600">{boyPercent}%</p>
                      <p className="text-xs font-bold text-blue-500 uppercase">Team Garçon</p>
                      <p className="text-xs text-slate-600 font-medium">({boyVotes} votes)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* B-C-D : Portrait | KPIs 2x2 | Info Live */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* B. PORTRAIT */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <BabyPortrait votes={votes || []} config={config} />
                </div>

                {/* C. KPIs 2x2 */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-slate-700" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Indicateurs</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Poids */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 text-center">
                      <Weight className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-4xl font-black text-purple-700 mb-1">
                        {averageWeight ? `${averageWeight}g` : '—'}
                      </p>
                      <p className="text-xs text-purple-600 font-bold uppercase">Poids</p>
                    </div>

                    {/* Taille */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-200 text-center">
                      <Ruler className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-4xl font-black text-indigo-700 mb-1">
                        {averageHeight ? `${averageHeight}cm` : '—'}
                      </p>
                      <p className="text-xs text-indigo-600 font-bold uppercase">Taille</p>
                    </div>

                    {/* Date */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200 text-center">
                      <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-xl font-black text-amber-700 mb-1 truncate">
                        {topDate ? formatDate(topDate, undefined, config) : '—'}
                      </p>
                      <p className="text-xs text-amber-600 font-bold uppercase">Date</p>
                    </div>

                    {/* Heure */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 text-center">
                      <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-4xl font-black text-emerald-700 mb-1">
                        {topTime || '—'}
                      </p>
                      <p className="text-xs text-emerald-600 font-bold uppercase">Heure</p>
                    </div>
                  </div>
                </div>

                {/* D. INFO LIVE */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">En Direct</h3>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-[300px]">
                    {recentVotes.length === 0 ? (
                      <p className="text-center text-slate-400 italic text-sm py-8">
                        Pas encore de votes
                      </p>
                    ) : (
                      recentVotes.map((vote) => (
                        <div
                          key={vote.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${
                            vote.choice === 'girl' 
                              ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                              : 'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            {vote.choice === 'girl' ? '♀' : '♂'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">
                              {vote.name}
                            </p>
                            <p className={`text-xs font-bold ${
                              vote.choice === 'girl' ? 'text-pink-600' : 'text-blue-600'
                            }`}>
                              vient de voter
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* E-F : Calendrier | Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* E. CALENDRIER */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <CalendarHeatmap 
                    dateCounts={dateCounts}
                    dueDate={config.dueDate}
                    isTVMode={false}
                    config={config}
                    monthsToShow={1}
                    compact={false}
                  />
                </div>

                {/* F. GRAPHIQUES */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
                    Distribution
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Histogram Poids */}
                    {weightData.length > 0 && (
                      <StatCard title="Poids" icon={Weight} color="purple" className="p-4">
                        <Histogram 
                          data={weightData}
                          title=""
                          color="#8b5cf6"
                          unit="g"
                          height={120}
                          isTVMode={false}
                          dataType="weight"
                        />
                      </StatCard>
                    )}

                    {/* Pie Chart Cheveux */}
                    {Object.keys(hairColorCounts).length > 0 && (
                      <StatCard title="Cheveux" icon={Palette} color="amber" className="p-4">
                        <div className="flex items-center justify-center h-full">
                          <ColorPieChart
                            data={hairColorCounts}
                            colors={hairColorMap}
                            title=""
                            size={140}
                            isTVMode={false}
                            compact={true}
                          />
                        </div>
                      </StatCard>
                    )}

                    {/* Histogram Taille */}
                    {heightData.length > 0 && (
                      <StatCard title="Taille" icon={Ruler} color="blue" className="p-4">
                        <Histogram 
                          data={heightData}
                          title=""
                          color="#3b82f6"
                          unit="cm"
                          height={120}
                          isTVMode={false}
                          dataType="height"
                        />
                      </StatCard>
                    )}

                    {/* Pie Chart Yeux */}
                    {Object.keys(eyeColorCounts).length > 0 && (
                      <StatCard title="Yeux" icon={Eye} color="emerald" className="p-4">
                        <div className="flex items-center justify-center h-full">
                          <ColorPieChart
                            data={eyeColorCounts}
                            colors={eyeColorMap}
                            title=""
                            size={140}
                            isTVMode={false}
                            compact={true}
                          />
                        </div>
                      </StatCard>
                    )}
                  </div>

                  {weightData.length === 0 && heightData.length === 0 && 
                   Object.keys(hairColorCounts).length === 0 && Object.keys(eyeColorCounts).length === 0 && (
                    <p className="text-center text-slate-400 italic text-sm py-8">
                      Pas encore de données de distribution
                    </p>
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

export default function ResultsV2PartyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    }>
      <ResultsV2PartyPageContent />
    </Suspense>
  );
}
