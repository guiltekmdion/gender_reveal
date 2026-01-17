/**
 * Utilitaires pour le formatage des dates
 * Supporte plusieurs formats configurables via AppConfig
 * Gère les timezones explicitement pour éviter les décalages
 */

import type { AppConfig } from './storage';

// Formats supportés
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY' | 'DD MMMM YYYY' | 'DD/MM/YY';

/**
 * Récupère le format de date depuis la configuration
 * @param config - Configuration de l'application
 * @returns Format de date (par défaut: 'DD/MM/YYYY')
 */
export function getDateFormat(config?: AppConfig): DateFormat {
  return (config?.dateFormat as DateFormat) || 'DD/MM/YYYY';
}

/**
 * Récupère la timezone depuis la configuration
 * @param config - Configuration de l'application
 * @returns Timezone IANA (par défaut: 'Europe/Paris')
 */
export function getTimezone(config?: AppConfig): string {
  return config?.timezone || 'Europe/Paris';
}

/**
 * Convertit une date string ISO en Date avec timezone explicite
 * @param dateStr - Date au format ISO (YYYY-MM-DD)
 * @param timezone - Timezone IANA (ex: 'Europe/Paris')
 * @returns Date object ajustée pour la timezone
 */
export function parseDateWithTimezone(dateStr: string, timezone: string): Date {
  // Pour une date ISO YYYY-MM-DD, on crée une date à minuit dans la timezone spécifiée
  // On utilise Intl pour obtenir les composants dans la bonne timezone
  const date = new Date(`${dateStr}T00:00:00`);
  
  // Si la date est invalide, retourner une date invalide
  if (isNaN(date.getTime())) {
    return date;
  }
  
  // Pour garantir la cohérence, on formate puis re-parse dans la timezone
  // Cela évite les problèmes de décalage entre serveur UTC et client local
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    
    if (year && month && day) {
      // Créer une date locale qui représente cette date dans la timezone
      return new Date(`${year}-${month}-${day}T00:00:00`);
    }
  } catch (e) {
    // Si la timezone est invalide, utiliser la date telle quelle
    console.warn(`Invalid timezone ${timezone}, using default parsing`);
  }
  
  return date;
}

/**
 * Formate une date selon le format spécifié avec timezone explicite
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée
 */
export function formatDate(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Si c'est une string ISO (YYYY-MM-DD), utiliser la timezone
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateObj = parseDateWithTimezone(date, getTimezone(config));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  const timezone = getTimezone(config);
  
  // Utiliser Intl.DateTimeFormat pour obtenir les composants dans la bonne timezone
  let day: string;
  let month: string;
  let year: string;
  let monthIndex: number;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const parts = formatter.formatToParts(dateObj);
    day = parts.find(p => p.type === 'day')?.value || String(dateObj.getDate()).padStart(2, '0');
    month = parts.find(p => p.type === 'month')?.value || String(dateObj.getMonth() + 1).padStart(2, '0');
    year = parts.find(p => p.type === 'year')?.value || String(dateObj.getFullYear());
    monthIndex = parseInt(month) - 1;
  } catch (e) {
    // Fallback si timezone invalide
    day = String(dateObj.getDate()).padStart(2, '0');
    month = String(dateObj.getMonth() + 1).padStart(2, '0');
    year = String(dateObj.getFullYear());
    monthIndex = dateObj.getMonth();
  }
  
  const yearShort = String(year).slice(-2);

  // Noms des mois en français
  const monthNamesShort = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  const monthNamesLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  switch (selectedFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD MMM YYYY':
      return `${day} ${monthNamesShort[monthIndex]} ${year}`;
    case 'DD MMMM YYYY':
      return `${day} ${monthNamesLong[monthIndex]} ${year}`;
    case 'DD/MM/YY':
      return `${day}/${month}/${yearShort}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Formate une date au format long (avec mois en texte) avec timezone explicite
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée (ex: "26 mai 2026")
 */
export function formatDateLong(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateObj = parseDateWithTimezone(date, getTimezone(config));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  
  // Pour les formats longs, utiliser le format avec mois en texte
  if (selectedFormat === 'DD MMM YYYY' || selectedFormat === 'DD MMMM YYYY') {
    return formatDate(date, selectedFormat, config);
  }

  // Sinon, convertir vers un format long avec timezone
  const timezone = getTimezone(config);
  let day: string;
  let monthIndex: number;
  let year: string;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const parts = formatter.formatToParts(dateObj);
    day = parts.find(p => p.type === 'day')?.value || String(dateObj.getDate()).padStart(2, '0');
    const month = parts.find(p => p.type === 'month')?.value || String(dateObj.getMonth() + 1).padStart(2, '0');
    monthIndex = parseInt(month) - 1;
    year = parts.find(p => p.type === 'year')?.value || String(dateObj.getFullYear());
  } catch (e) {
    day = String(dateObj.getDate()).padStart(2, '0');
    monthIndex = dateObj.getMonth();
    year = String(dateObj.getFullYear());
  }
  
  const monthNamesLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  return `${day} ${monthNamesLong[monthIndex]} ${year}`;
}

/**
 * Formate une date au format court (sans année ou année courte) avec timezone explicite
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée (ex: "26/05" ou "26 mai")
 */
export function formatDateShort(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateObj = parseDateWithTimezone(date, getTimezone(config));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  const timezone = getTimezone(config);
  
  let day: string;
  let month: string;
  let monthIndex: number;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      month: '2-digit',
      day: '2-digit',
    });
    
    const parts = formatter.formatToParts(dateObj);
    day = parts.find(p => p.type === 'day')?.value || String(dateObj.getDate()).padStart(2, '0');
    month = parts.find(p => p.type === 'month')?.value || String(dateObj.getMonth() + 1).padStart(2, '0');
    monthIndex = parseInt(month) - 1;
  } catch (e) {
    day = String(dateObj.getDate()).padStart(2, '0');
    month = String(dateObj.getMonth() + 1).padStart(2, '0');
    monthIndex = dateObj.getMonth();
  }
  
  const monthNamesShort = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  // Si le format utilise des mois en texte, utiliser le format court avec mois
  if (selectedFormat === 'DD MMM YYYY' || selectedFormat === 'DD MMMM YYYY') {
    return `${day} ${monthNamesShort[monthIndex]}`;
  }

  // Sinon, format court numérique
  return `${day}/${month}`;
}

/**
 * Formate une date avec l'heure (pour timestamps) avec timezone explicite
 * @param date - Date à formater (string ISO, Date, ou timestamp number)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date et heure formatées (ex: "26/05/2026 14:30")
 */
export function formatDateTime(date: string | Date | number, format?: DateFormat, config?: AppConfig): string {
  let dateObj: Date;
  
  if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const dateStr = formatDate(dateObj, format, config);
  const timezone = getTimezone(config);
  
  // Utiliser Intl pour obtenir l'heure dans la bonne timezone
  let hours: string;
  let minutes: string;
  
  try {
    const timeFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const timeParts = timeFormatter.formatToParts(dateObj);
    hours = timeParts.find(p => p.type === 'hour')?.value || String(dateObj.getHours()).padStart(2, '0');
    minutes = timeParts.find(p => p.type === 'minute')?.value || String(dateObj.getMinutes()).padStart(2, '0');
  } catch (e) {
    // Fallback si timezone invalide
    hours = String(dateObj.getHours()).padStart(2, '0');
    minutes = String(dateObj.getMinutes()).padStart(2, '0');
  }
  
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Fonctions de compatibilité (dépréciées, utiliser formatDate avec config)
 * @deprecated Utiliser formatDate() avec config à la place
 */
export function formatDateFR(date: string | Date): string {
  return formatDate(date, 'DD/MM/YYYY');
}

/**
 * @deprecated Utiliser formatDateLong() avec config à la place
 */
export function formatDateLongFR(date: string | Date): string {
  return formatDateLong(date, 'DD MMMM YYYY');
}

/**
 * @deprecated Utiliser formatDateShort() avec config à la place
 */
export function formatDateShortFR(date: string | Date): string {
  return formatDateShort(date, 'DD/MM/YY');
}
