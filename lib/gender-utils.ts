/**
 * Utilitaires pour la conversion des types de genre
 * Convertit les types de ComputedStats vers les types attendus par les composants
 */

/**
 * Type de genre pour les composants UI (sans 'tie')
 */
export type Gender = 'girl' | 'boy';

/**
 * Type de genre depuis ComputedStats (peut inclure 'tie' et null)
 */
export type StatsGender = 'girl' | 'boy' | 'tie' | null;

/**
 * Convertit un genre depuis ComputedStats vers le type Gender attendu par les composants
 * 'tie' et null sont convertis en undefined
 */
export function toGender(gender: StatsGender | undefined): Gender | undefined {
  if (gender === 'girl' || gender === 'boy') {
    return gender;
  }
  return undefined;
}
