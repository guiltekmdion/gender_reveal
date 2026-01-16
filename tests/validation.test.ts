/**
 * Tests unitaires pour la validation Zod
 * 
 * Pour exécuter : tsx tests/validation.test.ts
 */

import { voteSchema, configSchema, loginSchema } from '../lib/validation';
import { z } from 'zod';

function assertValid<T>(schema: z.ZodSchema<T>, data: unknown, message: string) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`${message}: ${result.error.message}`);
  }
  console.log(`✅ ${message}`);
}

function assertInvalid<T>(schema: z.ZodSchema<T>, data: unknown, message: string) {
  const result = schema.safeParse(data);
  if (result.success) {
    throw new Error(`${message}: Devrait échouer mais a réussi`);
  }
  console.log(`✅ ${message}`);
}

function testVoteSchema() {
  console.log('\n🧪 Test voteSchema...\n');

  // Vote valide minimal
  assertValid(voteSchema, {
    name: 'Jean',
    choice: 'boy'
  }, 'Vote minimal valide');

  // Vote complet valide
  assertValid(voteSchema, {
    name: 'Marie',
    email: 'marie@example.com',
    choice: 'girl',
    birthDate: '2025-06-15',
    birthTime: '14:30',
    weight: 3500,
    height: 50,
    hairColor: 'Blonds',
    eyeColor: 'Bleus'
  }, 'Vote complet valide');

  // Email optionnel vide
  assertValid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    email: ''
  }, 'Email optionnel vide accepté');

  // Email optionnel omis
  assertValid(voteSchema, {
    name: 'Test',
    choice: 'boy'
  }, 'Email optionnel omis accepté');

  // Champs optionnels vides
  assertValid(voteSchema, {
    name: 'Test',
    choice: 'girl',
    birthDate: '',
    birthTime: '',
    hairColor: '',
    eyeColor: ''
  }, 'Champs optionnels vides acceptés');

  // Erreurs de validation
  assertInvalid(voteSchema, {
    name: '',
    choice: 'boy'
  }, 'Nom vide rejeté');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'invalid'
  }, 'Choix invalide rejeté');

  assertInvalid(voteSchema, {
    name: 'Test',
    email: 'invalid-email'
  }, 'Email invalide rejeté');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    birthTime: '25:99'
  }, 'Heure invalide rejetée');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    birthDate: '15-06-2025'
  }, 'Date au mauvais format rejetée');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    birthDate: '2025/06/15'
  }, 'Date avec séparateur invalide rejetée');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    weight: 100
  }, 'Poids trop faible rejeté');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    weight: 20000
  }, 'Poids trop élevé rejeté');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    height: 10
  }, 'Taille trop faible rejetée');

  assertInvalid(voteSchema, {
    name: 'Test',
    choice: 'boy',
    height: 150
  }, 'Taille trop élevée rejetée');

  console.log('\n✅ Tous les tests voteSchema passés\n');
}

function testConfigSchema() {
  console.log('🧪 Test configSchema...\n');

  // Config minimale valide
  assertValid(configSchema, {}, 'Config vide valide');

  // Config complète valide
  assertValid(configSchema, {
    babyName: 'Bébé Test',
    parentNames: 'Papa et Maman',
    girlIcon: '♀',
    boyIcon: '♂',
    girlColor: '#ff69b4',
    boyColor: '#4169e1',
    birthListLink: 'https://example.com/list',
    dueDate: '2025-06-15',
    revealDate: '2025-06-20',
    isRevealed: false,
    actualGender: null,
    dateFormat: 'DD/MM/YYYY',
    voteUrl: 'https://example.com/vote'
  }, 'Config complète valide');

  // Tous les formats de date
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY', 'DD MMMM YYYY', 'DD/MM/YY'];
  dateFormats.forEach(format => {
    assertValid(configSchema, {
      dateFormat: format
    }, `Format de date ${format} valide`);
  });

  // URL optionnelles vides
  assertValid(configSchema, {
    birthListLink: '',
    voteUrl: ''
  }, 'URLs optionnelles vides acceptées');

  // Erreurs de validation
  assertInvalid(configSchema, {
    dateFormat: 'INVALID'
  }, 'Format de date invalide rejeté');

  assertInvalid(configSchema, {
    birthListLink: 'not-a-url'
  }, 'URL invalide rejetée');

  assertInvalid(configSchema, {
    voteUrl: 'not-a-url'
  }, 'voteUrl invalide rejetée');

  assertInvalid(configSchema, {
    actualGender: 'invalid'
  }, 'actualGender invalide rejeté');

  console.log('✅ Tous les tests configSchema passés\n');
}

function testLoginSchema() {
  console.log('🧪 Test loginSchema...\n');

  // Login valide
  assertValid(loginSchema, {
    password: 'secret123'
  }, 'Login valide');

  // Erreurs de validation
  assertInvalid(loginSchema, {
    password: ''
  }, 'Mot de passe vide rejeté');

  assertInvalid(loginSchema, {}, 'Mot de passe manquant rejeté');

  console.log('✅ Tous les tests loginSchema passés\n');
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Démarrage des tests de validation...\n');
  
  try {
    testVoteSchema();
    testConfigSchema();
    testLoginSchema();
    
    console.log('🎉 Tous les tests de validation sont passés avec succès !\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}
