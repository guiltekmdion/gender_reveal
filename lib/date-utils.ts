/**
 * Utilitaires pour le formatage des dates
 * Supporte plusieurs formats configurables via AppConfig
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
 * Formate une date selon le format spécifié
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée
 */
export function formatDate(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
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
      return `${day} ${monthNamesShort[dateObj.getMonth()]} ${year}`;
    case 'DD MMMM YYYY':
      return `${day} ${monthNamesLong[dateObj.getMonth()]} ${year}`;
    case 'DD/MM/YY':
      return `${day}/${month}/${yearShort}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Formate une date au format long (avec mois en texte)
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée (ex: "26 mai 2026")
 */
export function formatDateLong(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  
  // Pour les formats longs, utiliser le format avec mois en texte
  if (selectedFormat === 'DD MMM YYYY' || selectedFormat === 'DD MMMM YYYY') {
    return formatDate(date, selectedFormat, config);
  }

  // Sinon, convertir vers un format long
  const monthNamesLong = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day} ${monthNamesLong[dateObj.getMonth()]} ${year}`;
}

/**
 * Formate une date au format court (sans année ou année courte)
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de date (optionnel, utilise config si non fourni)
 * @param config - Configuration de l'application (optionnel)
 * @returns Date formatée (ex: "26/05" ou "26 mai")
 */
export function formatDateShort(date: string | Date, format?: DateFormat, config?: AppConfig): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const selectedFormat = format || getDateFormat(config);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const monthNamesShort = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  // Si le format utilise des mois en texte, utiliser le format court avec mois
  if (selectedFormat === 'DD MMM YYYY' || selectedFormat === 'DD MMMM YYYY') {
    return `${day} ${monthNamesShort[dateObj.getMonth()]}`;
  }

  // Sinon, format court numérique
  return `${day}/${month}`;
}

/**
 * Formate une date avec l'heure (pour timestamps)
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
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
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
