/**
 * Utilitaires pour les médianes, notamment pour les heures circulaires
 * Les heures sont circulaires (23h et 01h sont proches), donc la médiane naïve ne fonctionne pas
 */

/**
 * Calcule le mode (valeur la plus fréquente) pour les heures
 * Plus robuste que la médiane pour des données circulaires
 * @param times - Tableau d'heures au format HH:mm
 * @returns Heure la plus fréquente ou null si aucune donnée
 */
export function computeTimeMode(times: string[]): string | null {
  if (times.length === 0) {
    return null;
  }

  const counts: Record<string, number> = {};
  
  times.forEach(time => {
    if (time) {
      counts[time] = (counts[time] || 0) + 1;
    }
  });
  
  if (Object.keys(counts).length === 0) {
    return null;
  }
  
  // Trouver le maximum avec tie-break stable (ordre alphabétique)
  const entries = Object.entries(counts);
  const sorted = entries.sort((a, b) => {
    // D'abord par count décroissant
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    // En cas d'égalité, par valeur croissante (tie-break stable)
    return a[0].localeCompare(b[0]);
  });
  
  return sorted[0][0];
}

/**
 * Calcule la fenêtre la plus dense pour les heures
 * Utile quand plusieurs heures sont proches (ex: entre 1h et 3h)
 * @param times - Tableau d'heures au format HH:mm
 * @param windowSize - Taille de la fenêtre en heures (défaut: 3)
 * @returns Objet avec heure de début, fin et count, ou null
 */
export function computeTimeDenseWindow(times: string[], windowSize: number = 3): { start: string; end: string; count: number } | null {
  if (times.length === 0) {
    return null;
  }

  // Convertir les heures en nombres (0-23)
  const hours = times
    .map(time => {
      if (!time) return null;
      const match = time.match(/^(\d{1,2}):/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((h): h is number => h !== null && h >= 0 && h < 24);
  
  if (hours.length === 0) {
    return null;
  }
  
  // Tester chaque fenêtre circulaire
  let maxCount = 0;
  let bestStart = 0;
  
  for (let start = 0; start < 24; start++) {
    let count = 0;
    
    for (const hour of hours) {
      // Gérer la circularité : une fenêtre de 3h peut aller de 22h à 1h
      let inWindow = false;
      if (start + windowSize <= 24) {
        // Fenêtre normale
        inWindow = hour >= start && hour < start + windowSize;
      } else {
        // Fenêtre qui dépasse minuit
        inWindow = hour >= start || hour < (start + windowSize) % 24;
      }
      
      if (inWindow) {
        count++;
      }
    }
    
    if (count > maxCount) {
      maxCount = count;
      bestStart = start;
    }
  }
  
  const end = (bestStart + windowSize) % 24;
  const startStr = `${String(bestStart).padStart(2, '0')}:00`;
  const endStr = `${String(end).padStart(2, '0')}:00`;
  
  return {
    start: startStr,
    end: endStr,
    count: maxCount
  };
}

/**
 * Calcule une médiane simple pour les valeurs numériques
 * @param values - Tableau de nombres
 * @returns Médiane ou null si aucune donnée
 */
export function computeMedian(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    // Pair : moyenne des deux valeurs centrales
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    // Impair : valeur centrale
    return sorted[mid];
  }
}
