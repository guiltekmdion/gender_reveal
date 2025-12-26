import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
}

const DEFAULT_CONFIG: AppConfig = {
  babyName: 'Bébé',
  parentNames: 'Papa & Maman',
  girlIcon: 'Crown',
  boyIcon: 'Gamepad2',
  girlColor: '#ec4899',
  boyColor: '#3b82f6',
  birthListLink: '',
  dueDate: '',
  revealDate: '',
  isRevealed: false,
  actualGender: null,
};

// Votes operations
export function getVotes(): Vote[] {
  try {
    if (fs.existsSync(VOTES_FILE)) {
      const data = fs.readFileSync(VOTES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading votes:', error);
  }
  return [];
}

export function saveVotes(votes: Vote[]): void {
  try {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving votes:', error);
    throw error;
  }
}

export function addVote(vote: Omit<Vote, 'id' | 'timestamp'>): Vote {
  const votes = getVotes();
  const newVote: Vote = {
    name: vote.name,
    email: vote.email,
    choice: vote.choice,
    birthDate: vote.birthDate,
    birthTime: vote.birthTime,
    weight: vote.weight,
    height: vote.height,
    hairColor: vote.hairColor,
    eyeColor: vote.eyeColor,
    id: Date.now(),
    timestamp: Date.now(),
  };
  votes.unshift(newVote);
  saveVotes(votes);
  return newVote;
}

export function clearVotes(): void {
  saveVotes([]);
}

// Config operations
export function getConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  try {
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return newConfig;
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}
