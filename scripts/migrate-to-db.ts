#!/usr/bin/env tsx

/**
 * Script de migration des données JSON vers SQLite
 * 
 * Usage: npm run migrate:to-db
 * 
 * Ce script :
 * 1. Lit les données depuis les fichiers JSON existants
 * 2. Initialise la base de données SQLite
 * 3. Migre tous les votes et la configuration
 * 4. Affiche un rapport de migration
 */

import path from 'path';
import fs from 'fs';
import { FileStorage } from '../lib/storage/file';
import { DBStorage } from '../lib/storage/database';
import { initializeDatabase } from '../lib/storage/migrations';

const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'gender_reveal.db');

interface MigrationReport {
  votesMigrated: number;
  configMigrated: boolean;
  errors: string[];
}

function migrateData(): MigrationReport {
  const report: MigrationReport = {
    votesMigrated: 0,
    configMigrated: false,
    errors: [],
  };

  console.log('🚀 Démarrage de la migration vers SQLite...\n');

  // Vérifier que les fichiers JSON existent
  if (!fs.existsSync(VOTES_FILE) && !fs.existsSync(CONFIG_FILE)) {
    console.log('⚠️  Aucun fichier JSON trouvé. La base de données sera initialisée vide.');
    return report;
  }

  try {
    // 1. Initialiser la base de données
    console.log('📦 Initialisation de la base de données...');
    initializeDatabase(DB_PATH);
    console.log('✅ Base de données initialisée\n');

    // 2. Créer les instances de stockage
    const fileStorage = new FileStorage();
    const dbStorage = new DBStorage();

    // 3. Migrer les votes
    console.log('📥 Migration des votes...');
    try {
      const votes = fileStorage.getVotes();
      
      if (votes.length === 0) {
        console.log('ℹ️  Aucun vote à migrer');
      } else {
        // Vérifier si la base de données contient déjà des votes
        const existingVotes = dbStorage.getVotes();
        if (existingVotes.length > 0) {
          console.log(`⚠️  La base de données contient déjà ${existingVotes.length} vote(s).`);
          console.log('   Les votes existants seront conservés, les nouveaux seront ajoutés.');
        }

        // Migrer chaque vote
        for (const vote of votes) {
          try {
            // Vérifier si le vote existe déjà (par id)
            const exists = existingVotes.some(v => v.id === vote.id);
            if (!exists) {
              dbStorage.addVote({
                name: vote.name,
                email: vote.email,
                choice: vote.choice,
                birthDate: vote.birthDate,
                birthTime: vote.birthTime,
                weight: vote.weight,
                height: vote.height,
                hairColor: vote.hairColor,
                eyeColor: vote.eyeColor,
              });
              report.votesMigrated++;
            }
          } catch (error) {
            const errorMsg = `Erreur lors de la migration du vote ${vote.id}: ${error instanceof Error ? error.message : String(error)}`;
            report.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
        console.log(`✅ ${report.votesMigrated} vote(s) migré(s)\n`);
      }
    } catch (error) {
      const errorMsg = `Erreur lors de la lecture des votes: ${error instanceof Error ? error.message : String(error)}`;
      report.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}\n`);
    }

    // 4. Migrer la configuration
    console.log('⚙️  Migration de la configuration...');
    try {
      const config = fileStorage.getConfig();
      const currentDbConfig = dbStorage.getConfig();
      
      // Ne migrer que si la config JSON est différente de la config par défaut
      const hasCustomConfig = Object.keys(config).some(key => {
        const defaultValue = (fileStorage as any).DEFAULT_CONFIG?.[key];
        return config[key as keyof typeof config] !== defaultValue;
      });

      if (hasCustomConfig) {
        dbStorage.saveConfig(config);
        report.configMigrated = true;
        console.log('✅ Configuration migrée\n');
      } else {
        console.log('ℹ️  Configuration par défaut, pas de migration nécessaire\n');
      }
    } catch (error) {
      const errorMsg = `Erreur lors de la migration de la configuration: ${error instanceof Error ? error.message : String(error)}`;
      report.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}\n`);
    }

    // Fermer la connexion à la base de données
    dbStorage.close();

  } catch (error) {
    const errorMsg = `Erreur fatale lors de la migration: ${error instanceof Error ? error.message : String(error)}`;
    report.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
    throw error;
  }

  return report;
}

function printReport(report: MigrationReport): void {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RAPPORT DE MIGRATION');
  console.log('='.repeat(50));
  console.log(`✅ Votes migrés: ${report.votesMigrated}`);
  console.log(`${report.configMigrated ? '✅' : 'ℹ️ '} Configuration: ${report.configMigrated ? 'Migrée' : 'Non migrée (défaut)'}`);
  
  if (report.errors.length > 0) {
    console.log(`\n⚠️  Erreurs rencontrées: ${report.errors.length}`);
    report.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ Migration terminée sans erreur');
  }
  
  console.log('\n💡 Pour utiliser SQLite, définissez STORAGE_TYPE=sqlite dans votre .env');
  console.log('='.repeat(50) + '\n');
}

// Exécuter la migration
if (require.main === module) {
  try {
    const report = migrateData();
    printReport(report);
    
    if (report.errors.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Migration échouée:', error);
    process.exit(1);
  }
}

export { migrateData, printReport };
