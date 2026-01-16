import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

/**
 * Liste des migrations à appliquer dans l'ordre
 */
const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db: Database.Database) => {
      // Créer les tables de base
      db.exec(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          choice TEXT NOT NULL CHECK(choice IN ('girl', 'boy')),
          timestamp INTEGER NOT NULL,
          birthDate TEXT,
          birthTime TEXT,
          weight INTEGER,
          height INTEGER,
          hairColor TEXT,
          eyeColor TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON votes(timestamp);
        CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes(choice);

        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          applied_at INTEGER NOT NULL
        );
      `);
    },
  },
];

/**
 * Récupère la version actuelle de la base de données
 */
export function getCurrentVersion(db: Database.Database): number {
  try {
    const stmt = db.prepare('SELECT MAX(version) as version FROM schema_migrations');
    const result = stmt.get() as { version: number | null };
    return result.version || 0;
  } catch {
    // Si la table n'existe pas, retourner 0
    return 0;
  }
}

/**
 * Marque une migration comme appliquée
 */
function markMigrationApplied(db: Database.Database, version: number): void {
  const stmt = db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)');
  stmt.run(version, Date.now());
}

/**
 * Applique toutes les migrations en attente
 */
export function runMigrations(dbPath: string): void {
  const db = new Database(dbPath);
  
  try {
    // S'assurer que la table schema_migrations existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );
    `);

    const currentVersion = getCurrentVersion(db);
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('Database is up to date');
      return;
    }

    console.log(`Applying ${pendingMigrations.length} migration(s)...`);

    const transaction = db.transaction(() => {
      for (const migration of pendingMigrations) {
        console.log(`Applying migration ${migration.version}: ${migration.name}`);
        migration.up(db);
        markMigrationApplied(db, migration.version);
      }
    });

    transaction();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Initialise la base de données et applique les migrations
 */
export function initializeDatabase(dbPath: string): void {
  const dataDir = path.dirname(dbPath);
  
  // S'assurer que le répertoire existe
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Appliquer les migrations
  runMigrations(dbPath);
}
