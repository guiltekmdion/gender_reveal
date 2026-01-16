import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { IStorage } from './interface';
import type { Vote, AppConfig } from '../storage';

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
 * Implémentation SQLite du stockage
 * Utilise better-sqlite3 pour des performances optimales
 */
export class DBStorage implements IStorage {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    
    // S'assurer que le répertoire data existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Chemin de la base de données
    this.dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'gender_reveal.db');
    
    // Ouvrir la connexion à la base de données
    this.db = new Database(this.dbPath);
    
    // Activer les foreign keys et optimisations
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    // Le schéma est initialisé via les migrations dans getStorage()
    // Cette méthode est conservée pour compatibilité mais ne fait rien
    // car les migrations sont déjà appliquées avant la création de l'instance
    this.initializeSchema();
  }

  /**
   * Initialise le schéma de la base de données
   * Les migrations sont gérées par migrations.ts
   */
  private initializeSchema(): void {
    // Le schéma est initialisé via les migrations dans getStorage()
    // Cette méthode est conservée pour compatibilité mais ne fait rien
    // car les migrations sont déjà appliquées avant la création de l'instance
  }

  /**
   * Récupère tous les votes, triés par timestamp décroissant
   */
  getVotes(): Vote[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM votes 
        ORDER BY timestamp DESC
      `);
      
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email || undefined,
        choice: row.choice as 'girl' | 'boy',
        timestamp: row.timestamp,
        birthDate: row.birthDate || undefined,
        birthTime: row.birthTime || undefined,
        weight: row.weight || undefined,
        height: row.height || undefined,
        hairColor: row.hairColor || undefined,
        eyeColor: row.eyeColor || undefined,
      }));
    } catch (error) {
      console.error('Error getting votes from database:', error);
      throw error;
    }
  }

  /**
   * Ajoute un nouveau vote avec transaction
   */
  addVote(vote: Omit<Vote, 'id' | 'timestamp'>): Vote {
    const transaction = this.db.transaction(() => {
      const stmt = this.db.prepare(`
        INSERT INTO votes (name, email, choice, timestamp, birthDate, birthTime, weight, height, hairColor, eyeColor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const timestamp = Date.now();
      const result = stmt.run(
        vote.name,
        vote.email || null,
        vote.choice,
        timestamp,
        vote.birthDate || null,
        vote.birthTime || null,
        vote.weight || null,
        vote.height || null,
        vote.hairColor || null,
        vote.eyeColor || null
      );

      return {
        id: Number(result.lastInsertRowid),
        name: vote.name,
        email: vote.email,
        choice: vote.choice,
        timestamp,
        birthDate: vote.birthDate,
        birthTime: vote.birthTime,
        weight: vote.weight,
        height: vote.height,
        hairColor: vote.hairColor,
        eyeColor: vote.eyeColor,
      };
    });

    try {
      return transaction();
    } catch (error) {
      console.error('Error adding vote to database:', error);
      throw error;
    }
  }

  /**
   * Supprime tous les votes
   */
  clearVotes(): void {
    try {
      const stmt = this.db.prepare('DELETE FROM votes');
      stmt.run();
    } catch (error) {
      console.error('Error clearing votes from database:', error);
      throw error;
    }
  }

  /**
   * Récupère la configuration
   */
  getConfig(): AppConfig {
    try {
      const stmt = this.db.prepare('SELECT key, value FROM config');
      const rows = stmt.all() as Array<{ key: string; value: string }>;

      if (rows.length === 0) {
        return DEFAULT_CONFIG;
      }

      // Reconstruire l'objet config depuis les paires key-value
      const config: any = { ...DEFAULT_CONFIG };
      
      for (const row of rows) {
        try {
          const value = JSON.parse(row.value);
          config[row.key] = value;
        } catch {
          // Si ce n'est pas du JSON, utiliser la valeur telle quelle
          config[row.key] = row.value;
        }
      }

      return config as AppConfig;
    } catch (error) {
      console.error('Error getting config from database:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Sauvegarde la configuration (merge partiel)
   */
  saveConfig(config: Partial<AppConfig>): AppConfig {
    const transaction = this.db.transaction(() => {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };

      // Sauvegarder chaque clé dans la table config
      const stmt = this.db.prepare(`
        INSERT INTO config (key, value) 
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      for (const [key, value] of Object.entries(newConfig)) {
        stmt.run(key, JSON.stringify(value));
      }

      return newConfig;
    });

    try {
      return transaction();
    } catch (error) {
      console.error('Error saving config to database:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion à la base de données
   * Utile pour les tests ou l'arrêt propre
   */
  close(): void {
    this.db.close();
  }
}
