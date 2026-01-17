/**
 * Utilitaires de normalisation des données
 * Normalise les heures, couleurs, prénoms pour garantir la cohérence
 */

/**
 * Normalise une heure au format canonique HH:mm
 * Gère les variations : "14", "14h", "14:00", "14:30", "2h30", etc.
 * @param time - Heure à normaliser (string)
 * @returns Heure normalisée au format HH:mm ou null si invalide
 */
export function normalizeTime(time: string | undefined | null): string | null {
  if (!time || typeof time !== 'string') {
    return null;
  }

  // Trim et nettoyage
  let cleaned = time.trim().toLowerCase();

  // Supprimer les espaces
  cleaned = cleaned.replace(/\s+/g, '');

  // Si vide après nettoyage
  if (!cleaned) {
    return null;
  }

  // Pattern 1: Format déjà correct HH:mm ou H:mm
  const hhmmPattern = /^(\d{1,2}):(\d{2})$/;
  const match1 = cleaned.match(hhmmPattern);
  if (match1) {
    const hours = parseInt(match1[1], 10);
    const minutes = parseInt(match1[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  // Pattern 2: Format avec 'h' ou 'H' : "14h", "14h30", "2h30", "14H30"
  const hPattern = /^(\d{1,2})h?(\d{2})?$/i;
  const match2 = cleaned.match(hPattern);
  if (match2) {
    const hours = parseInt(match2[1], 10);
    const minutes = match2[2] ? parseInt(match2[2], 10) : 0;
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  // Pattern 3: Juste un nombre (heures) : "14", "2"
  const hoursOnlyPattern = /^(\d{1,2})$/;
  const match3 = cleaned.match(hoursOnlyPattern);
  if (match3) {
    const hours = parseInt(match3[1], 10);
    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, '0')}:00`;
    }
  }

  // Si aucun pattern ne correspond, retourner null
  return null;
}

/**
 * Normalise une couleur (cheveux ou yeux)
 * Gère les variations de casse, accents, synonymes
 * @param color - Couleur à normaliser
 * @param colorMap - Mapping des couleurs normalisées (optionnel)
 * @returns Couleur normalisée ou null si invalide
 */
export function normalizeColor(color: string | undefined | null, colorMap?: Record<string, string>): string | null {
  if (!color || typeof color !== 'string') {
    return null;
  }

  // Trim et nettoyage
  let cleaned = color.trim();

  // Si vide après trim
  if (!cleaned) {
    return null;
  }

  // Normaliser la casse (première lettre majuscule, reste minuscule)
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();

  // Normaliser les accents et caractères spéciaux
  const accentMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
  };

  let normalized = '';
  for (const char of cleaned) {
    normalized += accentMap[char.toLowerCase()] || char;
  }

  // Appliquer le mapping personnalisé si fourni
  if (colorMap && colorMap[normalized]) {
    return colorMap[normalized];
  }

  return normalized;
}

/**
 * Normalise un prénom pour le nuage de mots
 * Supprime la ponctuation, normalise la casse, trim
 * @param name - Prénom à normaliser
 * @returns Prénom normalisé ou null si invalide
 */
export function normalizeName(name: string | undefined | null): string | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  // Trim
  let cleaned = name.trim();

  // Si vide après trim
  if (!cleaned) {
    return null;
  }

  // Supprimer la ponctuation en fin (points, virgules, etc.)
  cleaned = cleaned.replace(/[.,;:!?]+$/, '');

  // Normaliser la casse (première lettre majuscule, reste minuscule)
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();

  // Supprimer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Si trop court (moins de 2 caractères), ignorer
  if (cleaned.length < 2) {
    return null;
  }

  return cleaned;
}

/**
 * Normalise une date ISO pour garantir le format YYYY-MM-DD
 * @param date - Date à normaliser (string ISO)
 * @returns Date normalisée au format YYYY-MM-DD ou null si invalide
 */
export function normalizeDate(date: string | undefined | null): string | null {
  if (!date || typeof date !== 'string') {
    return null;
  }

  // Trim
  const cleaned = date.trim();

  // Pattern ISO YYYY-MM-DD
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = cleaned.match(isoPattern);
  
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    // Validation basique
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return cleaned; // Déjà au bon format
    }
  }

  // Si le format n'est pas ISO, essayer de parser avec Date
  const dateObj = new Date(cleaned);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}
