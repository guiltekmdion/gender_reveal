'use client';

import React, { useState, useEffect } from 'react';
import { Baby, Calendar, Clock, Weight, Ruler, Palette, Eye, ArrowLeft, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import BabyAvatar from '@/components/BabyAvatar';
import PieChart from '@/components/PieChart';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import ColorPieChart from '@/components/ColorPieChart';
import NameCloud from '@/components/NameCloud';
import StatCard from '@/components/StatCard';
import { formatDate, formatDateTime } from '@/lib/date-utils';

interface Vote {
  id: number;
  name: string;
  email?: string;
  choice: 'girl' | 'boy';
  timestamp: number;
  message?: string;
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
  dueDate?: string;
}

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);

  // Fetch data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [votesRes, configRes] = await Promise.all([
        fetch('/api/votes'),
        fetch('/api/config')
      ]);
      
      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData.votes || []);
      }
      
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsRefreshing(false);
      setTimeSinceUpdate(0);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeSinceUpdate]);

  // Calculations
  const totalVotes = votes.length;
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;
  const girlPercent = totalVotes > 0 ? Math.round((girlVotes / totalVotes) * 100) : 50;
  const boyPercent = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 50;

  // Average weight and height
  const votesWithWeight = votes.filter(v => v.weight && v.weight > 0);
  const votesWithHeight = votes.filter(v => v.height && v.height > 0);
  const averageWeight = votesWithWeight.length > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / votesWithWeight.length)
    : null;
  const averageHeight = votesWithHeight.length > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / votesWithHeight.length)
    : null;

  // Most common gender, hair, eyes
  const mostCommonGender = girlVotes > boyVotes ? 'girl' : boyVotes > girlVotes ? 'boy' : null;
  
  const hairColorCounts: Record<string, number> = {};
  const eyeColorCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.hairColor) hairColorCounts[v.hairColor] = (hairColorCounts[v.hairColor] || 0) + 1;
    if (v.eyeColor) eyeColorCounts[v.eyeColor] = (eyeColorCounts[v.eyeColor] || 0) + 1;
  });

  const mostCommonHair = Object.keys(hairColorCounts).length > 0
    ? Object.entries(hairColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const mostCommonEyes = Object.keys(eyeColorCounts).length > 0
    ? Object.entries(eyeColorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // Color mappings
  const hairColorMap: Record<string, string> = {
    'Blonds': '#f5e6b3',
    'Bruns': '#8b4513',
    'Châtains': '#a0522d',
    'Roux': '#ff6347',
    'Noirs': '#1a1a1a',
  };

  const eyeColorMap: Record<string, string> = {
    'Bleus': '#4682b4',
    'Verts': '#90ee90',
    'Marrons': '#8b4513',
    'Noisette': '#cd853f',
    'Gris': '#a0aec0',
  };

  const mostCommonHairHex = mostCommonHair ? hairColorMap[mostCommonHair] || '#f5e6b3' : '#f5e6b3';
  const mostCommonEyeHex = mostCommonEyes ? eyeColorMap[mostCommonEyes] || '#4682b4' : '#4682b4';

  // Date counts
  const dateCounts: Record<string, number> = {};
  votes.forEach(v => {
    if (v.birthDate) {
      dateCounts[v.birthDate] = (dateCounts[v.birthDate] || 0) + 1;
    }
  });
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]);

  return (
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
              <span className="text-xs text-slate-500">il y a {timeSinceUpdate}s</span>
            </div>
          </div>

          {/* Barre de score VS style page principale */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-1">
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

      {/* Grid Dashboard 3x3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 flex-1 overflow-auto">
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
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border-2 border-pink-200 text-center">
                <div className="text-3xl text-pink-500 mb-1">♀</div>
                <p className="text-2xl font-black text-pink-600">{girlPercent}%</p>
                <p className="text-xs text-pink-600 font-bold">Team Fille</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200 text-center">
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
                gender={mostCommonGender}
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
        {votes.length > 0 && (
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
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 text-center">
                  <Weight className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-purple-700">{averageWeight}g</p>
                  <p className="text-xs text-purple-600 font-bold">Poids</p>
                </div>
              )}
              {averageHeight && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200 text-center">
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
              {sortedDates.slice(0, 5).map(([date, count], index) => (
                <div 
                  key={date}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-200">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {formatDate(date, undefined, config)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{count}</span>
                </div>
              ))}
            </div>
          </StatCard>
        )}

        {/* Card 9: Feed Live - 3 derniers votes */}
        <StatCard title="Votes récents" icon={Users} color="white" className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="space-y-2 overflow-y-auto h-full">
            {votes.length === 0 ? (
              <p className="text-center text-slate-400 italic py-8 text-xs">
                Aucun vote pour l&apos;instant
              </p>
            ) : (
              votes.slice(0, 3).map((vote) => {
                const voteTime = new Date(vote.timestamp);
                const isNew = (Date.now() - voteTime.getTime()) < 60000;
                
                return (
                  <div
                    key={vote.id}
                    className="p-2 bg-white rounded-xl border border-slate-50 shadow-sm"
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
      </div>
    </div>
  );
}
