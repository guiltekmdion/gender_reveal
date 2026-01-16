/**
 * Types et interfaces pour le stockage
 * Exportés pour compatibilité avec le code existant
 */
export interface Vote {
  id: number;
  name: string;
  email?: string;
  choice: 'girl' | 'boy';
  timestamp: number;
  // Extended predictions
  birthDate?: string; // ISO date string
  birthTime?: string; // HH:mm format
  weight?: number; // in grams
  height?: number; // in cm
  hairColor?: string;
  eyeColor?: string;
}

export interface AppConfig {
  babyName?: string;
  parentNames?: string;
  girlIcon?: string;
  boyIcon?: string;
  girlColor?: string;
  boyColor?: string;
  birthListLink?: string;
  dueDate?: string;
  revealDate?: string;
  isRevealed?: boolean;
  actualGender?: 'girl' | 'boy' | null;
  // Actual birth details (for scoring/comparison)
  actualBirthDate?: string;
  actualBirthTime?: string;
  actualWeight?: number;
  actualHeight?: number;
  actualHairColor?: string;
  actualEyeColor?: string;
  // Date format configuration
  dateFormat?: string; // Format de date: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY', 'DD MMMM YYYY', 'DD/MM/YY'
  // Vote URL for QR code
  voteUrl?: string; // URL pour voter (affichée en QR code)
  // TV Mode for 4K display
  tvMode?: boolean; // Mode TV optimisé pour affichage 4K
}

/**
 * Instance singleton du storage
 * Utilise le pattern Strategy pour basculer entre FileStorage et DBStorage
 */
let storageInstance: ReturnType<typeof import('./storage/interface').getStorage> | null = null;

function getStorageInstance() {
  if (!storageInstance) {
    const { getStorage } = require('./storage/interface');
    storageInstance = getStorage();
  }
  return storageInstance;
}

/**
 * Fonctions de compatibilité pour le code existant
 * Délèguent à l'implémentation de stockage appropriée
 */
export function getVotes() {
  return getStorageInstance().getVotes();
}

export function addVote(vote: Omit<Vote, 'id' | 'timestamp'>): Vote {
  return getStorageInstance().addVote(vote);
}

export function clearVotes(): void {
  return getStorageInstance().clearVotes();
}

export function getConfig(): AppConfig {
  return getStorageInstance().getConfig();
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  return getStorageInstance().saveConfig(config);
}
