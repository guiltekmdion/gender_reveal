/**
 * Types pour les statistiques calculées
 * Source de vérité unique pour Party Mode et Normal Mode
 */

import type { Vote } from '../storage';

/**
 * Statistiques calculées à partir des votes
 */
export interface ComputedStats {
  // Totaux
  totalVotes: number;
  girlVotes: number;
  boyVotes: number;
  girlPercent: number;
  boyPercent: number;
  
  // Most common (avec gestion des égalités)
  mostCommonGender: 'girl' | 'boy' | 'tie' | null;
  mostCommonHair: string | null;
  mostCommonEyes: string | null;
  
  // Moyennes (avec compteurs de validité)
  averageWeight: number | null;
  averageHeight: number | null;
  validWeightCount: number;
  validHeightCount: number;
  
  // Distributions
  hairColorCounts: Record<string, number>;
  eyeColorCounts: Record<string, number>;
  dateCounts: Record<string, number>;
  timeCounts: Record<string, number>;
  
  // Top N (triés avec tie-break stable)
  topDates: Array<{ date: string; count: number }>;
  topTimes: Array<{ time: string; count: number }>;
  
  // Données pour histogrammes (avec bins fixes)
  weightData: number[];
  heightData: number[];
  timeData: string[];
  
  // Votes avec prédictions
  votesWithPredictions: number;
  votesWithMessages: number;
  votesWithEmail: number;
  
  // Derniers votes (triés par timestamp DESC)
  recentVotes: Vote[];
  
  // État vide
  isEmpty: boolean;
}
