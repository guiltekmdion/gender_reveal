import fs from 'fs';
import path from 'path';
import type { IStorage } from './interface';
import type { Vote, AppConfig } from '../storage';

const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

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
  dateFormat: 'DD/MM/YYYY',
};

/**
 * Implémentation FileStorage (fichiers JSON)
 * Ancienne implémentation conservée pour compatibilité
 */
export class FileStorage implements IStorage {
  constructor() {
    // S'assurer que le répertoire data existe
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  getVotes(): Vote[] {
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

  private saveVotes(votes: Vote[]): void {
    try {
      fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving votes:', error);
      throw error;
    }
  }

  addVote(vote: Omit<Vote, 'id' | 'timestamp'>): Vote {
    const votes = this.getVotes();
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
    this.saveVotes(votes);
    return newVote;
  }

  clearVotes(): void {
    this.saveVotes([]);
  }

  getConfig(): AppConfig {
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

  saveConfig(config: Partial<AppConfig>): AppConfig {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
      return newConfig;
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }
}
