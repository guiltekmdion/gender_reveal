import type { Vote, AppConfig } from '../storage';

/**
 * Interface pour les différentes implémentations de stockage
 * Permet de basculer entre FileStorage et DBStorage via Strategy pattern
 */
export interface IStorage {
  /**
   * Récupère tous les votes
   */
  getVotes(): Vote[];

  /**
   * Ajoute un nouveau vote
   */
  addVote(vote: Omit<Vote, 'id' | 'timestamp'>): Vote;

  /**
   * Supprime tous les votes
   */
  clearVotes(): void;

  /**
   * Récupère la configuration
   */
  getConfig(): AppConfig;

  /**
   * Sauvegarde la configuration (merge partiel)
   */
  saveConfig(config: Partial<AppConfig>): AppConfig;
}

/**
 * Factory pour obtenir l'implémentation de stockage appropriée
 * Basé sur la variable d'environnement STORAGE_TYPE
 * 
 * @returns Instance de IStorage (FileStorage ou DBStorage)
 */
export function getStorage(): IStorage {
  const storageType = process.env.STORAGE_TYPE || 'file';

  if (storageType === 'sqlite') {
    // Import dynamique pour éviter les erreurs si better-sqlite3 n'est pas installé
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DBStorage } = require('./database');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initializeDatabase } = require('./migrations');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    // Initialiser la base de données et appliquer les migrations
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'gender_reveal.db');
    initializeDatabase(dbPath);
    
    return new DBStorage();
  }

  // Par défaut, utiliser FileStorage (compatibilité ascendante)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FileStorage } = require('./file');
  return new FileStorage();
}
