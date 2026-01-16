/**
 * Tests manuels pour le système de stockage (DBStorage et migrations)
 * 
 * Pour exécuter : tsx tests/storage.test.ts
 * 
 * Note: Ces tests sont des tests manuels simples pour valider le fonctionnement.
 * Pour des tests automatisés complets, utilisez Playwright E2E.
 */

import path from 'path';
import fs from 'fs';
import { DBStorage } from '../lib/storage/database';
import { FileStorage } from '../lib/storage/file';
import { initializeDatabase } from '../lib/storage/migrations';
import type { Vote, AppConfig } from '../lib/storage';

// Base de données de test
const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test_gender_reveal.db');

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function testDBStorage() {
  console.log('\n🧪 Test DBStorage...\n');

  // Initialiser la base de données de test
  initializeDatabase(TEST_DB_PATH);
  const storage = new DBStorage();
  
  // Override le chemin pour utiliser la base de test
  (storage as any).dbPath = TEST_DB_PATH;
  (storage as any).db.close();
  (storage as any).db = require('better-sqlite3')(TEST_DB_PATH);

  try {
    // Test 1: Votes vides initialement
    const votes = storage.getVotes();
    assert(votes.length === 0, 'Votes vides initialement');

    // Test 2: Ajouter un vote
    const vote: Omit<Vote, 'id' | 'timestamp'> = {
      name: 'Test User',
      email: 'test@example.com',
      choice: 'girl',
      birthDate: '2024-12-25',
      birthTime: '14:30',
      weight: 3500,
      height: 52,
      hairColor: 'Blonds',
      eyeColor: 'Bleus',
    };

    const addedVote = storage.addVote(vote);
    assert(addedVote.id !== undefined, 'Vote ajouté avec ID');
    assert(addedVote.timestamp !== undefined, 'Vote ajouté avec timestamp');
    assert(addedVote.name === 'Test User', 'Nom du vote correct');

    // Test 3: Récupérer les votes
    const allVotes = storage.getVotes();
    assert(allVotes.length === 1, 'Un vote récupéré');
    assert(allVotes[0].name === 'Test User', 'Nom du vote récupéré correct');

    // Test 4: Configuration par défaut
    const config = storage.getConfig();
    assert(config.babyName === 'Bébé', 'Configuration par défaut correcte');

    // Test 5: Sauvegarder configuration
    const newConfig: Partial<AppConfig> = {
      babyName: 'Test Baby',
    };
    const savedConfig = storage.saveConfig(newConfig);
    assert(savedConfig.babyName === 'Test Baby', 'Configuration sauvegardée');

    // Test 6: Clear votes
    storage.clearVotes();
    const clearedVotes = storage.getVotes();
    assert(clearedVotes.length === 0, 'Votes supprimés');

    console.log('\n✅ Tous les tests DBStorage passés\n');
  } finally {
    storage.close();
    // Nettoyer
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  }
}

function testMigrations() {
  console.log('🧪 Test Migrations...\n');

  const TEST_MIGRATION_DB = path.join(process.cwd(), 'data', 'test_migration.db');

  try {
    // Test: Initialiser la base de données
    initializeDatabase(TEST_MIGRATION_DB);
    assert(fs.existsSync(TEST_MIGRATION_DB), 'Base de données créée');

    // Test: Vérifier les tables
    const Database = require('better-sqlite3');
    const db = new Database(TEST_MIGRATION_DB);
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('votes', 'config', 'schema_migrations')
    `).all();
    db.close();

    assert(tables.length === 3, 'Tables créées correctement');

    console.log('✅ Tous les tests Migrations passés\n');
  } finally {
    // Nettoyer
    if (fs.existsSync(TEST_MIGRATION_DB)) {
      fs.unlinkSync(TEST_MIGRATION_DB);
    }
  }
}

function testCompatibility() {
  console.log('🧪 Test Compatibilité FileStorage vs DBStorage...\n');

  const fileStorage = new FileStorage();
  const dbStorage = new DBStorage();

  // Vérifier que les deux implémentent les mêmes méthodes
  assert(typeof fileStorage.getVotes === 'function', 'FileStorage.getVotes existe');
  assert(typeof fileStorage.addVote === 'function', 'FileStorage.addVote existe');
  assert(typeof fileStorage.clearVotes === 'function', 'FileStorage.clearVotes existe');
  assert(typeof fileStorage.getConfig === 'function', 'FileStorage.getConfig existe');
  assert(typeof fileStorage.saveConfig === 'function', 'FileStorage.saveConfig existe');

  assert(typeof dbStorage.getVotes === 'function', 'DBStorage.getVotes existe');
  assert(typeof dbStorage.addVote === 'function', 'DBStorage.addVote existe');
  assert(typeof dbStorage.clearVotes === 'function', 'DBStorage.clearVotes existe');
  assert(typeof dbStorage.getConfig === 'function', 'DBStorage.getConfig existe');
  assert(typeof dbStorage.saveConfig === 'function', 'DBStorage.saveConfig existe');

  dbStorage.close();

  console.log('✅ Tous les tests de compatibilité passés\n');
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Démarrage des tests de stockage...\n');
  
  try {
    testDBStorage();
    testMigrations();
    testCompatibility();
    
    console.log('🎉 Tous les tests sont passés avec succès !\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}
