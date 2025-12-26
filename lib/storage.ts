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
  choice: 'girl' | 'boy';
  timestamp: number;
}

export interface AppConfig {
  babyName?: string;
  parentNames?: string;
  girlIcon?: string;
  boyIcon?: string;
  girlColor?: string;
  boyColor?: string;
  birthListLink?: string;
  revealDate?: string;
  isRevealed?: boolean;
  actualGender?: 'girl' | 'boy' | null;
}

const DEFAULT_CONFIG: AppConfig = {
  babyName: 'Bébé',
  parentNames: 'Papa & Maman',
  girlIcon: 'Crown',
  boyIcon: 'Gamepad2',
  girlColor: '#ec4899',
  boyColor: '#3b82f6',
  birthListLink: '',
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
    ...vote,
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
