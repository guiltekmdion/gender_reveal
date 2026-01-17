/**
 * Utilitaires pour les histogrammes avec bins fixes
 * Garantit la cohérence des graphiques entre les rafraîchissements
 */

/**
 * Calcule les bins fixes pour les poids (par tranche de 100g)
 * @param data - Données de poids en grammes
 * @returns Objet avec bins et counts
 */
export function computeWeightBins(data: number[]): { bins: string[]; counts: number[] } {
  if (data.length === 0) {
    return { bins: [], counts: [] };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Arrondir min vers le bas à la centaine inférieure, max vers le haut
  const minBin = Math.floor(min / 100) * 100;
  const maxBin = Math.ceil(max / 100) * 100;
  
  // Créer les bins par tranche de 100g
  const bins: string[] = [];
  const counts: number[] = [];
  
  for (let bin = minBin; bin < maxBin; bin += 100) {
    const binLabel = `${bin}-${bin + 99}g`;
    bins.push(binLabel);
    
    // Compter les valeurs dans ce bin
    const count = data.filter(w => w >= bin && w < bin + 100).length;
    counts.push(count);
  }
  
  return { bins, counts };
}

/**
 * Calcule les bins fixes pour les tailles (par tranche de 1cm ou 2cm selon la plage)
 * @param data - Données de taille en cm
 * @returns Objet avec bins et counts
 */
export function computeHeightBins(data: number[]): { bins: string[]; counts: number[] } {
  if (data.length === 0) {
    return { bins: [], counts: [] };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // Si la plage est petite (< 10cm), utiliser des bins de 1cm, sinon 2cm
  const binSize = range < 10 ? 1 : 2;
  
  // Arrondir min vers le bas, max vers le haut
  const minBin = Math.floor(min / binSize) * binSize;
  const maxBin = Math.ceil(max / binSize) * binSize;
  
  const bins: string[] = [];
  const counts: number[] = [];
  
  for (let bin = minBin; bin < maxBin; bin += binSize) {
    const binLabel = binSize === 1 
      ? `${bin}cm`
      : `${bin}-${bin + binSize - 1}cm`;
    bins.push(binLabel);
    
    // Compter les valeurs dans ce bin
    const count = data.filter(h => h >= bin && h < bin + binSize).length;
    counts.push(count);
  }
  
  return { bins, counts };
}

/**
 * Calcule les bins fixes pour les heures (24 bins, un par heure)
 * @param data - Données d'heures au format HH:mm
 * @returns Objet avec bins (0-23) et counts
 */
export function computeTimeBins(data: string[]): { bins: string[]; counts: number[] } {
  const bins: string[] = [];
  const counts: number[] = [];
  
  // Initialiser tous les bins à 0
  for (let hour = 0; hour < 24; hour++) {
    bins.push(`${String(hour).padStart(2, '0')}:00`);
    counts.push(0);
  }
  
  // Compter les votes par heure
  data.forEach(time => {
    if (!time) return;
    
    // Extraire l'heure du format HH:mm
    const match = time.match(/^(\d{1,2}):/);
    if (match) {
      const hour = parseInt(match[1], 10);
      if (hour >= 0 && hour < 24) {
        counts[hour]++;
      }
    }
  });
  
  return { bins, counts };
}
