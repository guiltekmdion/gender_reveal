/**
 * Moteur de calcul centralisé pour les statistiques
 * Source de vérité unique pour Party Mode et Normal Mode
 * Gère tous les cas limites, normalisations et validations
 */

import type { Vote, AppConfig } from '../storage';
import type { ComputedStats } from './types';
import { normalizeColor, normalizeName } from '../normalization';
import { computeTimeMode } from './median';
import { computeWeightBins, computeHeightBins, computeTimeBins } from './histogram';

// Mapping des couleurs normalisées
const HAIR_COLOR_MAP: Record<string, string> = {
  'Blond': 'Blonds',
  'Blonde': 'Blonds',
  'Blonds': 'Blonds',
  'Brun': 'Bruns',
  'Brune': 'Bruns',
  'Bruns': 'Bruns',
  'Chatain': 'Châtains',
  'Châtain': 'Châtains',
  'Châtains': 'Châtains',
  'Roux': 'Roux',
  'Rousse': 'Roux',
  'Noir': 'Noirs',
  'Noire': 'Noirs',
  'Noirs': 'Noirs',
};

const EYE_COLOR_MAP: Record<string, string> = {
  'Bleu': 'Bleus',
  'Bleue': 'Bleus',
  'Bleus': 'Bleus',
  'Vert': 'Verts',
  'Verte': 'Verts',
  'Verts': 'Verts',
  'Marron': 'Marrons',
  'Marrons': 'Marrons',
  'Noisette': 'Noisette',
  'Gris': 'Gris',
  'Grise': 'Gris',
};

// Plages de validation
const WEIGHT_MIN = 500;
const WEIGHT_MAX = 6000;
const HEIGHT_MIN = 20;
const HEIGHT_MAX = 65;

/**
 * Filtre et valide les votes pour les statistiques
 * @param votes - Votes bruts
 * @returns Votes validés avec outliers filtrés
 */
function filterValidVotes(votes: Vote[]): {
  validVotes: Vote[];
  filteredCount: number;
} {
  const validVotes: Vote[] = [];
  let filteredCount = 0;

  for (const vote of votes) {
    let isValid = true;

    // Valider le poids
    if (vote.weight !== undefined && vote.weight !== null) {
      if (vote.weight < WEIGHT_MIN || vote.weight > WEIGHT_MAX) {
        console.warn(`Vote ${vote.id}: poids invalide ${vote.weight}g (hors plage ${WEIGHT_MIN}-${WEIGHT_MAX}g)`);
        isValid = false;
      }
    }

    // Valider la taille
    if (vote.height !== undefined && vote.height !== null) {
      if (vote.height < HEIGHT_MIN || vote.height > HEIGHT_MAX) {
        console.warn(`Vote ${vote.id}: taille invalide ${vote.height}cm (hors plage ${HEIGHT_MIN}-${HEIGHT_MAX}cm)`);
        isValid = false;
      }
    }

    // Valider l'heure (format HH:mm, heure 0-23)
    if (vote.birthTime) {
      const timeMatch = vote.birthTime.match(/^(\d{1,2}):/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1], 10);
        if (hour < 0 || hour > 23) {
          console.warn(`Vote ${vote.id}: heure invalide ${vote.birthTime}`);
          isValid = false;
        }
      }
    }

    if (isValid) {
      validVotes.push(vote);
    } else {
      filteredCount++;
    }
  }

  return { validVotes, filteredCount };
}

/**
 * Calcule les pourcentages avec arrondi cohérent
 * Arrondit un seul, l'autre = 100 - first pour garantir 100%
 * @param first - Premier pourcentage
 * @param second - Deuxième pourcentage
 * @returns Tuple [firstPercent, secondPercent] garantissant first + second = 100
 */
function computeCoherentPercentages(first: number, second: number, total: number): [number, number] {
  if (total === 0) {
    return [50, 50]; // Égalité par défaut
  }

  const firstPercent = Math.round((first / total) * 100);
  const secondPercent = 100 - firstPercent; // Garantit que la somme = 100

  return [firstPercent, secondPercent];
}

/**
 * Trouve la valeur la plus commune avec gestion des égalités
 * @param counts - Objet avec counts par valeur
 * @returns Valeur la plus commune ou null, avec tie-break stable
 */
function findMostCommon(counts: Record<string, number>): string | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return null;
  }

  // Trier par count décroissant, puis par valeur croissante (tie-break stable)
  const sorted = entries.sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });

  const maxCount = sorted[0][1];
  const ties = sorted.filter(([_, count]) => count === maxCount);

  // Si égalité, retourner la première (tie-break stable)
  return sorted[0][0];
}

/**
 * Calcule toutes les statistiques depuis un snapshot de votes
 * @param votes - Votes (doit être un snapshot cohérent)
 * @param config - Configuration de l'application
 * @returns Statistiques calculées
 */
export function computeStats(votes: Vote[], config: AppConfig): ComputedStats {
  // Cas spécial : aucun vote
  if (votes.length === 0) {
    return {
      totalVotes: 0,
      girlVotes: 0,
      boyVotes: 0,
      girlPercent: 50,
      boyPercent: 50,
      mostCommonGender: null,
      mostCommonHair: null,
      mostCommonEyes: null,
      averageWeight: null,
      averageHeight: null,
      validWeightCount: 0,
      validHeightCount: 0,
      hairColorCounts: {},
      eyeColorCounts: {},
      dateCounts: {},
      timeCounts: {},
      topDates: [],
      topTimes: [],
      weightData: [],
      heightData: [],
      timeData: [],
      votesWithPredictions: 0,
      votesWithMessages: 0,
      votesWithEmail: 0,
      recentVotes: [],
      isEmpty: true,
    };
  }

  // Filtrer les votes valides
  const { validVotes } = filterValidVotes(votes);

  // Totaux
  const totalVotes = validVotes.length;
  const girlVotes = validVotes.filter(v => v.choice === 'girl').length;
  const boyVotes = validVotes.filter(v => v.choice === 'boy').length;

  // Pourcentages avec arrondi cohérent
  const [girlPercent, boyPercent] = computeCoherentPercentages(girlVotes, boyVotes, totalVotes);

  // Most common gender avec gestion des égalités
  let mostCommonGender: 'girl' | 'boy' | 'tie' | null = null;
  if (girlVotes > boyVotes) {
    mostCommonGender = 'girl';
  } else if (boyVotes > girlVotes) {
    mostCommonGender = 'boy';
  } else if (totalVotes > 0) {
    mostCommonGender = 'tie';
  }

  // Normaliser et compter les couleurs
  const hairColorCounts: Record<string, number> = {};
  const eyeColorCounts: Record<string, number> = {};

  validVotes.forEach(vote => {
    if (vote.hairColor) {
      const normalized = normalizeColor(vote.hairColor, HAIR_COLOR_MAP);
      if (normalized) {
        const mapped = HAIR_COLOR_MAP[normalized] || normalized;
        hairColorCounts[mapped] = (hairColorCounts[mapped] || 0) + 1;
      }
    }

    if (vote.eyeColor) {
      const normalized = normalizeColor(vote.eyeColor, EYE_COLOR_MAP);
      if (normalized) {
        const mapped = EYE_COLOR_MAP[normalized] || normalized;
        eyeColorCounts[mapped] = (eyeColorCounts[mapped] || 0) + 1;
      }
    }
  });

  // Ajouter bucket "Autres" pour les couleurs non listées
  const knownHairColors = new Set(Object.keys(HAIR_COLOR_MAP).map(k => HAIR_COLOR_MAP[k] || k));
  const knownEyeColors = new Set(Object.keys(EYE_COLOR_MAP).map(k => EYE_COLOR_MAP[k] || k));

  Object.keys(hairColorCounts).forEach(color => {
    if (!knownHairColors.has(color) && color !== 'Autres') {
      hairColorCounts['Autres'] = (hairColorCounts['Autres'] || 0) + hairColorCounts[color];
      delete hairColorCounts[color];
    }
  });

  Object.keys(eyeColorCounts).forEach(color => {
    if (!knownEyeColors.has(color) && color !== 'Autres') {
      eyeColorCounts['Autres'] = (eyeColorCounts['Autres'] || 0) + eyeColorCounts[color];
      delete eyeColorCounts[color];
    }
  });

  const mostCommonHair = findMostCommon(hairColorCounts);
  const mostCommonEyes = findMostCommon(eyeColorCounts);

  // Moyennes avec compteurs de validité
  const votesWithWeight = validVotes.filter(v => v.weight !== undefined && v.weight !== null && v.weight > 0);
  const votesWithHeight = validVotes.filter(v => v.height !== undefined && v.height !== null && v.height > 0);

  const validWeightCount = votesWithWeight.length;
  const validHeightCount = votesWithHeight.length;

  const averageWeight = validWeightCount > 0
    ? Math.round(votesWithWeight.reduce((sum, v) => sum + (v.weight || 0), 0) / validWeightCount)
    : null;

  const averageHeight = validHeightCount > 0
    ? Math.round(votesWithHeight.reduce((sum, v) => sum + (v.height || 0), 0) / validHeightCount)
    : null;

  // Distributions de dates et heures
  const dateCounts: Record<string, number> = {};
  const timeCounts: Record<string, number> = {};

  validVotes.forEach(vote => {
    if (vote.birthDate) {
      dateCounts[vote.birthDate] = (dateCounts[vote.birthDate] || 0) + 1;
    }
    if (vote.birthTime) {
      timeCounts[vote.birthTime] = (timeCounts[vote.birthTime] || 0) + 1;
    }
  });

  // Top dates et heures avec tie-break stable
  const topDates = Object.entries(dateCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]); // Tie-break stable
    })
    .map(([date, count]) => ({ date, count }));

  const topTimes = Object.entries(timeCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]); // Tie-break stable
    })
    .map(([time, count]) => ({ time, count }));

  // Données pour histogrammes
  const weightData = votesWithWeight.map(v => v.weight || 0);
  const heightData = votesWithHeight.map(v => v.height || 0);
  const timeData = validVotes.filter(v => v.birthTime).map(v => v.birthTime!);

  // Votes avec prédictions (au moins une prédiction valide)
  const votesWithPredictions = validVotes.filter(v => 
    (v.birthDate && v.birthDate.trim() !== '') ||
    (v.weight !== undefined && v.weight !== null && v.weight > 0) ||
    (v.height !== undefined && v.height !== null && v.height > 0)
  ).length;

  const votesWithMessages = validVotes.filter(v => v.message && v.message.trim().length > 0).length;
  const votesWithEmail = validVotes.filter(v => v.email && v.email.trim().length > 0).length;

  // Derniers votes (triés par timestamp DESC)
  const recentVotes = [...validVotes].sort((a, b) => b.timestamp - a.timestamp);

  return {
    totalVotes,
    girlVotes,
    boyVotes,
    girlPercent,
    boyPercent,
    mostCommonGender,
    mostCommonHair,
    mostCommonEyes,
    averageWeight,
    averageHeight,
    validWeightCount,
    validHeightCount,
    hairColorCounts,
    eyeColorCounts,
    dateCounts,
    timeCounts,
    topDates,
    topTimes,
    weightData,
    heightData,
    timeData,
    votesWithPredictions,
    votesWithMessages,
    votesWithEmail,
    recentVotes,
    isEmpty: false,
  };
}
