/**
 * Dataset de test mockable pour les tests et développement
 * Accessible via ?mock=1 dans l'URL
 */

import type { Vote } from '../storage';

/**
 * Génère un dataset de test avec cas limites
 * @returns Tableau de votes de test
 */
export function generateMockVotes(): Vote[] {
  const baseTime = Date.now();
  const votes: Vote[] = [];

  // Cas 1: 0 vote (retourné par computeStats si vide)
  
  // Cas 2: 1 vote
  votes.push({
    id: 1,
    name: 'Test',
    choice: 'girl',
    timestamp: baseTime - 10000,
    message: 'Premier vote !',
    birthDate: '2026-05-28',
    birthTime: '14:00',
    weight: 3200,
    height: 50,
    hairColor: 'Blonds',
    eyeColor: 'Bleus',
  });

  // Cas 3: Égalité parfaite (50/50)
  for (let i = 0; i < 5; i++) {
    votes.push({
      id: 2 + i,
      name: `Fille${i + 1}`,
      choice: 'girl',
      timestamp: baseTime - 9000 + i * 1000,
    });
  }
  for (let i = 0; i < 5; i++) {
    votes.push({
      id: 7 + i,
      name: `Garçon${i + 1}`,
      choice: 'boy',
      timestamp: baseTime - 8000 + i * 1000,
    });
  }

  // Cas 4: Outliers (poids/taille hors plage normale)
  votes.push({
    id: 12,
    name: 'OutlierPoids',
    choice: 'boy',
    timestamp: baseTime - 7000,
    weight: 4500, // Légèrement hors plage mais acceptable
    height: 55,
  });

  // Cas 5: Dates extrêmes
  votes.push({
    id: 13,
    name: 'DateExtreme',
    choice: 'girl',
    timestamp: baseTime - 6000,
    birthDate: '2026-06-15',
    birthTime: '23:30',
  });

  // Cas 6: Unicode et caractères spéciaux
  votes.push({
    id: 14,
    name: 'José María',
    choice: 'boy',
    timestamp: baseTime - 5000,
    message: '¡Felicitaciones! 🎉',
  });

  // Cas 7: Heures variées (pour tester la circularité)
  const hours = ['00:00', '06:00', '12:00', '18:00', '23:59'];
  hours.forEach((hour, i) => {
    votes.push({
      id: 15 + i,
      name: `Heure${i + 1}`,
      choice: i % 2 === 0 ? 'girl' : 'boy',
      timestamp: baseTime - 4000 + i * 1000,
      birthTime: hour,
    });
  });

  // Cas 8: Couleurs avec variations (pour tester normalisation)
  const colorVariations = [
    { hair: 'Blond', eye: 'Bleu' },
    { hair: 'Blonde', eye: 'Bleue' },
    { hair: 'Brun', eye: 'Marron' },
    { hair: 'Brune', eye: 'Marrons' },
    { hair: 'Chatain', eye: 'Vert' },
    { hair: 'Châtain', eye: 'Verte' },
  ];
  colorVariations.forEach((colors, i) => {
    votes.push({
      id: 20 + i,
      name: `Couleur${i + 1}`,
      choice: 'girl',
      timestamp: baseTime - 3000 + i * 1000,
      hairColor: colors.hair,
      eyeColor: colors.eye,
    });
  });

  // Cas 9: Messages longs (pour tester clamp)
  votes.push({
    id: 26,
    name: 'MessageLong',
    choice: 'boy',
    timestamp: baseTime - 2000,
    message: 'A'.repeat(300), // Message très long
  });

  // Cas 10: Prénoms avec variations (pour tester normalisation)
  const nameVariations = ['Max', 'max', 'MAX', 'Max.', 'Maxime'];
  nameVariations.forEach((name, i) => {
    votes.push({
      id: 27 + i,
      name,
      choice: 'boy',
      timestamp: baseTime - 1000 + i * 1000,
    });
  });

  return votes;
}
