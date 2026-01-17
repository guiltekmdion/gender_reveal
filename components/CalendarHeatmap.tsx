'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface CalendarHeatmapProps {
  dateCounts: Record<string, number>; // Format: { "YYYY-MM-DD": count }
  dueDate?: string; // Format: "YYYY-MM-DD"
  isTVMode?: boolean;
  config?: { dateFormat?: string };
  monthsToShow?: number;
  compact?: boolean;
}

export default function CalendarHeatmap({ 
  dateCounts, 
  dueDate, 
  isTVMode = false,
  config,
  monthsToShow,
  compact = false
}: CalendarHeatmapProps) {
  // Obtenir la plage de dates à afficher
  const getDateRange = () => {
    const dates = Object.keys(dateCounts);
    if (dates.length === 0 && dueDate) {
      // Si pas de votes mais une date prévue, afficher 2 mois autour
      const due = new Date(dueDate);
      const start = new Date(due);
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const end = new Date(due);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Dernier jour du mois
      return { start, end };
    }
    
    if (dates.length === 0) return null;
    
    const dateObjects = dates.map(d => new Date(d));
    const start = new Date(Math.min(...dateObjects.map(d => d.getTime())));
    const end = new Date(Math.max(...dateObjects.map(d => d.getTime())));
    
    // Étendre de 2 semaines avant/après
    start.setDate(start.getDate() - 14);
    end.setDate(end.getDate() + 14);
    
    // Aligner sur le début/fin du mois
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    
    return { start, end };
  };

  const range = getDateRange();
  if (!range) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-200 text-center text-slate-400">
        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aucune date prédite pour l&apos;instant</p>
      </div>
    );
  }

  // Générer les mois à afficher
  const months: Array<{ year: number; month: number; startDate: Date; endDate: Date }> = [];
  const current = new Date(range.start);
  let monthCount = 0;
  const maxMonths = monthsToShow || (compact ? 1 : 999);
  while (current <= range.end && monthCount < maxMonths) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    months.push({ year, month, startDate, endDate });
    current.setMonth(current.getMonth() + 1);
    monthCount++;
  }

  // Obtenir le maximum de votes pour la normalisation des couleurs
  const maxCount = Math.max(...Object.values(dateCounts), 1);
  
  // Fonction pour obtenir l'intensité de couleur
  const getColorIntensity = (count: number) => {
    if (count === 0) return 0;
    // Normaliser entre 0.2 et 1.0 pour avoir toujours une couleur visible
    const intensity = 0.2 + (count / maxCount) * 0.8;
    return Math.min(intensity, 1);
  };

  // Fonction pour obtenir la couleur basée sur l'intensité
  const getColor = (count: number, isDueDate: boolean) => {
    if (isDueDate) {
      // Date prévue en jaune/orange avec bordure
      return {
        bg: 'bg-gradient-to-br from-amber-100 to-orange-100',
        border: 'border-2 border-amber-400',
        text: 'text-amber-700',
      };
    }
    
    if (count === 0) {
      return {
        bg: 'bg-slate-50',
        border: 'border border-slate-200',
        text: 'text-slate-400',
      };
    }
    
    const intensity = getColorIntensity(count);
    
    // Dégrader de vert clair (peu de votes) à violet foncé (beaucoup de votes)
    if (intensity < 0.4) {
      return {
        bg: 'bg-green-100',
        border: 'border border-green-200',
        text: 'text-green-700',
      };
    } else if (intensity < 0.6) {
      return {
        bg: 'bg-blue-100',
        border: 'border border-blue-200',
        text: 'text-blue-700',
      };
    } else if (intensity < 0.8) {
      return {
        bg: 'bg-purple-200',
        border: 'border border-purple-300',
        text: 'text-purple-700',
      };
    } else {
      return {
        bg: 'bg-purple-400',
        border: 'border-2 border-purple-500',
        text: 'text-purple-900',
      };
    }
  };

  // Obtenir le premier jour de la semaine (0 = dimanche, 1 = lundi, etc.)
  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Générer les jours du mois avec les jours vides au début
  const generateDays = (year: number, month: number) => {
    const firstDay = getFirstDayOfWeek(year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ day: number; date: string; count: number; isDueDate: boolean }> = [];
    
    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: '', count: 0, isDueDate: false });
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = dateCounts[dateStr] || 0;
      const isDueDate = dueDate === dateStr;
      days.push({ day, date: dateStr, count, isDueDate });
    }
    
    return days;
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className={`bg-white rounded-2xl shadow-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30 ${compact ? 'p-2' : (isTVMode ? 'p-2' : 'p-3')} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] animate-fade-in`}>
      <h2 className={`${compact ? 'text-xs' : (isTVMode ? 'text-xs' : 'text-sm')} font-bold text-slate-800 ${compact ? 'mb-1' : (isTVMode ? 'mb-0.5' : 'mb-2')} flex items-center gap-1`}>
        <CalendarIcon size={compact ? 12 : (isTVMode ? 11 : 14)} />
        Calendrier des dates prédites
      </h2>
      
      <div className={compact ? 'space-y-1' : (isTVMode ? 'space-y-2' : 'space-y-3')}>
        {months.map(({ year, month }) => {
          const days = generateDays(year, month);
          const monthName = monthNames[month];
          
          return (
            <div key={`${year}-${month}`} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {/* En-tête du mois */}
              <div className={`bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 ${compact ? 'p-1' : (isTVMode ? 'p-1' : 'p-2')}`}>
                <h3 className={`${compact ? 'text-[9px]' : (isTVMode ? 'text-[10px]' : 'text-xs')} font-bold text-purple-700 text-center`}>
                  {monthName} {year}
                </h3>
              </div>
              
              {/* En-tête des jours de la semaine */}
              <div className={`grid grid-cols-7 gap-0.5 ${compact ? 'p-0.5' : (isTVMode ? 'p-0.5' : 'p-1')} bg-slate-50 border-b border-slate-200`}>
                {dayNames.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`${compact ? 'text-[7px]' : (isTVMode ? 'text-[8px]' : 'text-[9px]')} font-bold text-slate-600 text-center`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grille des jours */}
              <div className={`grid grid-cols-7 gap-0.5 ${compact ? 'p-0.5' : (isTVMode ? 'p-0.5' : 'p-1')}`}>
                {days.map(({ day, date, count, isDueDate }, idx) => {
                  const colors = getColor(count, isDueDate);
                  
                  if (day === 0) {
                    return <div key={idx} className="aspect-square" />;
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={`aspect-square ${colors.bg} ${colors.border} rounded transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer flex flex-col items-center justify-center relative group ${isTVMode ? 'p-0.5' : 'p-1'}`}
                      title={date ? `${formatDate(date, undefined, config)}\n${count} vote${count > 1 ? 's' : ''}${isDueDate ? '\n📅 Date prévue' : ''}` : ''}
                    >
                      <span className={`${colors.text} ${isTVMode ? 'text-[9px]' : 'text-[10px]'} font-bold leading-none`}>
                        {day}
                      </span>
                      {count > 0 && (
                        <span className={`${colors.text} ${isTVMode ? 'text-[7px]' : 'text-[8px]'} font-black leading-none mt-0.5`}>
                          {count}
                        </span>
                      )}
                      {isDueDate && (
                        <span className={`absolute ${isTVMode ? 'top-0 right-0' : 'top-0.5 right-0.5'} ${isTVMode ? 'text-[7px]' : 'text-[8px]'}`}>
                          📅
                        </span>
                      )}
                      {/* Tooltip au survol */}
                      {count > 0 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {count} vote{count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Légende */}
      <div className={`mt-2 pt-2 border-t border-slate-200 ${isTVMode ? 'space-y-0.5' : 'space-y-1'}`}>
        <div className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600 font-medium text-center mb-1`}>
          Légende :
        </div>
        <div className={`flex items-center justify-center ${isTVMode ? 'gap-1' : 'gap-2'} flex-wrap`}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></div>
            <span className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600`}>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600`}>1-2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
            <span className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600`}>3-4</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
            <span className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600`}>5+</span>
          </div>
          {dueDate && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400"></div>
              <span className={`${isTVMode ? 'text-[8px]' : 'text-[9px]'} text-slate-600`}>📅 Prévu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
