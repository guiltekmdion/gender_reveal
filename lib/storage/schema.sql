-- Table pour stocker les votes
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  choice TEXT NOT NULL CHECK(choice IN ('girl', 'boy')),
  timestamp INTEGER NOT NULL,
  message TEXT,
  birthDate TEXT,
  birthTime TEXT,
  weight INTEGER,
  height INTEGER,
  hairColor TEXT,
  eyeColor TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON votes(timestamp);
CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes(choice);

-- Table pour stocker la configuration (key-value store)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Table pour suivre les migrations de schéma
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
