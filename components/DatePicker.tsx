'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate, getDateFormat, type DateFormat } from '@/lib/date-utils';
import type { AppConfig } from '@/lib/storage';

interface DatePickerProps {
  value: string; // Format ISO (YYYY-MM-DD)
  onChange: (value: string) => void; // Retourne format ISO
  config?: AppConfig;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Convertit une date ISO (YYYY-MM-DD) vers le format configuré
 */
function isoToFormat(isoDate: string, format: DateFormat): string {
  if (!isoDate) return '';
  const date = new Date(isoDate + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const yearShort = String(year).slice(-2);

  const monthNamesShort = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  const monthNamesLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return isoDate; // Déjà au bon format
    case 'DD MMM YYYY':
      return `${day} ${monthNamesShort[date.getMonth()]} ${year}`;
    case 'DD MMMM YYYY':
      return `${day} ${monthNamesLong[date.getMonth()]} ${year}`;
    case 'DD/MM/YY':
      return `${day}/${month}/${yearShort}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Convertit une date du format configuré vers ISO (YYYY-MM-DD)
 */
function formatToIso(formattedDate: string, format: DateFormat): string {
  if (!formattedDate.trim()) return '';

  let day: string, month: string, year: string;

  try {
    switch (format) {
      case 'DD/MM/YYYY':
      case 'DD/MM/YY': {
        const parts = formattedDate.split('/');
        if (parts.length !== 3) return '';
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
        if (format === 'DD/MM/YY' && year.length === 2) {
          // Convertir année courte en année complète (assume 2000-2099)
          year = '20' + year;
        }
        break;
      }
      case 'MM/DD/YYYY': {
        const parts = formattedDate.split('/');
        if (parts.length !== 3) return '';
        month = parts[0].padStart(2, '0');
        day = parts[1].padStart(2, '0');
        year = parts[2];
        break;
      }
      case 'YYYY-MM-DD':
        // Déjà au format ISO
        return formattedDate;
      case 'DD MMM YYYY':
      case 'DD MMMM YYYY': {
        const monthNamesShort = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
        const monthNamesLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        
        const parts = formattedDate.split(' ').filter(p => p.trim());
        if (parts.length < 3) return '';
        day = parts[0].padStart(2, '0');
        const monthName = parts[1].toLowerCase();
        let monthIndex = monthNamesLong.findIndex(m => m.toLowerCase() === monthName);
        if (monthIndex === -1) {
          monthIndex = monthNamesShort.findIndex(m => m.toLowerCase() === monthName);
        }
        if (monthIndex === -1) return '';
        month = String(monthIndex + 1).padStart(2, '0');
        year = parts[2];
        break;
      }
      default:
        return '';
    }

    // Validation de la date
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    if (isNaN(date.getTime())) return '';
    
    // Vérifier que la date correspond bien aux valeurs parsées
    if (date.getDate() !== parseInt(day) || date.getMonth() + 1 !== parseInt(month)) {
      return '';
    }

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Composant DatePicker personnalisé qui respecte le format de date configuré
 */
export default function DatePicker({
  value,
  onChange,
  config,
  label,
  className = '',
  placeholder,
  required = false,
}: DatePickerProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [showNativePicker, setShowNativePicker] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const format = getDateFormat(config);

  // Synchroniser la valeur affichée avec la valeur ISO
  useEffect(() => {
    if (value) {
      setDisplayValue(isoToFormat(value, format));
    } else {
      setDisplayValue('');
    }
  }, [value, format]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;
    setDisplayValue(newDisplayValue);
    
    // Essayer de convertir vers ISO
    const isoValue = formatToIso(newDisplayValue, format);
    if (isoValue) {
      onChange(isoValue);
    } else if (!newDisplayValue.trim()) {
      // Si le champ est vide, permettre la suppression
      onChange('');
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    // Sur focus, montrer le date picker natif pour faciliter la sélection
    if (nativeInputRef.current) {
      nativeInputRef.current.showPicker?.();
    }
  };

  const handleNativePickerClick = () => {
    setShowNativePicker(true);
    setTimeout(() => {
      nativeInputRef.current?.showPicker?.();
    }, 0);
  };

  // Pour les formats avec mois en texte, utiliser seulement le date picker natif
  const isTextMonthFormat = format === 'DD MMM YYYY' || format === 'DD MMMM YYYY';
  const isNumericFormat = !isTextMonthFormat;

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {isNumericFormat ? (
          <>
            {/* Input texte pour la saisie dans le format configuré (formats numériques) */}
            <input
              type="text"
              value={displayValue}
              onChange={handleDisplayChange}
              onFocus={handleFocus}
              placeholder={placeholder || `Format: ${format}`}
              className={`w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all ${className}`}
            />
            
            {/* Icône calendrier cliquable pour ouvrir le date picker natif */}
            <button
              type="button"
              onClick={handleNativePickerClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
              aria-label="Ouvrir le calendrier"
            >
              <Calendar size={18} />
            </button>

            {/* Date picker natif caché pour la sélection visuelle */}
            <input
              ref={nativeInputRef}
              type="date"
              value={value || ''}
              onChange={handleNativeChange}
              className="absolute inset-0 opacity-0 pointer-events-none"
              aria-hidden="true"
              tabIndex={-1}
            />
          </>
        ) : (
          <>
            {/* Pour les formats avec mois en texte, afficher la date formatée et permettre la sélection via le date picker */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayValue}
                readOnly
                placeholder="Cliquez sur le calendrier"
                className={`flex-1 text-sm border-2 border-slate-200 rounded-lg px-3 py-2 pr-10 bg-slate-50 cursor-pointer ${className}`}
                onClick={handleNativePickerClick}
              />
              
              <button
                type="button"
                onClick={handleNativePickerClick}
                className="text-slate-400 hover:text-purple-600 transition-colors p-2"
                aria-label="Ouvrir le calendrier"
              >
                <Calendar size={18} />
              </button>
            </div>

            {/* Date picker natif pour la sélection */}
            <input
              ref={nativeInputRef}
              type="date"
              value={value || ''}
              onChange={handleNativeChange}
              className="absolute inset-0 opacity-0 pointer-events-none"
              aria-hidden="true"
              tabIndex={-1}
            />
          </>
        )}
      </div>

      {/* Aide contextuelle */}
      <p className="text-[10px] text-slate-400 mt-1">
        {isNumericFormat ? (
          <>
            Format attendu : {format}
            {format === 'DD/MM/YYYY' && ' (ex: 26/05/2026)'}
            {format === 'MM/DD/YYYY' && ' (ex: 05/26/2026)'}
            {format === 'YYYY-MM-DD' && ' (ex: 2026-05-26)'}
            {format === 'DD/MM/YY' && ' (ex: 26/05/26)'}
            {' - Cliquez sur le calendrier pour sélectionner'}
          </>
        ) : (
          <>
            Format : {format} (ex: {displayValue || '26 mai 2026'}) - Cliquez sur le calendrier pour sélectionner
          </>
        )}
      </p>
    </div>
  );
}
