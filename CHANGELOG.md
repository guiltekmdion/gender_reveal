# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [2.0.0] - 2025-12-26

### 🎨 Ajouté (Major Features)

#### Système BabyAvatar Paperdoll
Architecture modulaire **inspirée de DiceBear** mais 100% personnalisée :
- 6 couches SVG customisables (base, eyes, face, hair, accessory, clothing)
- 3 styles de cheveux (default, short, curly)
- Palettes de 5 couleurs pour cheveux et yeux
- Props React pour customisation dynamique
- Tailles multiples (96px modal, 112px résultats)
- Rendu temps réel des changements de couleur

#### Suite de Tests Playwright (12 tests E2E)
- ✅ Tests de navigation et chargement de page
- ✅ Tests d'interactions (votes, sliders, palettes de couleurs)
- ✅ Tests des workflows de modales (prédictions → email)
- ✅ Tests responsive (mobile 375px + tablette 768px)
- ✅ Tests de la page statistiques
- Scripts npm : `test`, `test:ui`, `test:headed`
- Configuration auto-start du dev server

#### Documentation Complète
- **[DOCUMENTATION.md](docs/DOCUMENTATION.md)** - 10 captures d'écran professionnelles
  - Pages principales et modales
  - Versions desktop et mobile
  - Exemples d'interactions
- **[BABYAVATAR.md](docs/BABYAVATAR.md)** - Documentation technique approfondie
  - Architecture des 6 couches
  - Code source détaillé de chaque composant
  - Comparaison DiceBear vs implémentation custom
  - Exemples d'utilisation
- Script automatique de screenshots (`tests/screenshots.spec.ts`)

### 🔧 Modifié

- **Remplacement des BabyPortrait inline**
  - Ancien : Composants SVG codés en dur dans chaque page
  - Nouveau : Composant réutilisable `components/BabyAvatar.tsx`
  - Utilisé dans `app/page.tsx` (modal) et `app/results/page.tsx` (portrait moyen)

- **README.md enrichi**
  - Liens vers documentation visuelle et technique
  - Section tests Playwright
  - Explication du système paperdoll

### 🐛 Corrigé

- **Workflow des modales** - Les tests révélaient un flux incorrect
  - Correction : "Valider mon vote" → Modal prédictions → "Continuer" → Modal email
  - Les sliders/palettes sont dans la modal de prédictions (non visibles sur page principale)
  
- **Sélecteurs de tests Playwright**
  - Utilisation d'`aria-label` pour les boutons de couleur
  - Sélection via `h3:has-text()` pour les titres de modal
  - Ajout de `.first()` pour éviter les erreurs strict mode
  - `waitForLoadState('networkidle')` pour stabilité

### 📸 Assets Générés

10 captures d'écran automatiques dans `docs/screenshots/` :
1. `01-page-principale.png` - Vue initiale
2. `02-selection-fille.png` - Bouton Fille sélectionné
3. `03-selection-garcon.png` - Bouton Garçon sélectionné
4. `04-modal-predictions.png` - Modal de prédictions
5. `05-modal-predictions-couleurs.png` - Avec couleurs sélectionnées
6. `06-modal-email.png` - Modal d'email
7. `07-page-resultats.png` - Page statistiques
8. `08-page-admin.png` - Panel admin
9. `09-mobile-principale.png` - Mobile (375×667)
10. `10-mobile-modal.png` - Modal mobile

### 🎯 Résultats

- **Tests : 12/12 passés ✅** (100% success rate)
- **Screenshots : 10/10 générés ✅**
- **Documentation : 2 fichiers complets ✅**
- **Composants : Migration BabyAvatar complète ✅**

---

## [Non publié]

### ✨ Ajouté

#### Système de Pronostics Détaillés

Les invités peuvent maintenant faire des pronostics détaillés sur le bébé au-delà du simple choix Fille/Garçon :

- **Date de naissance** - Sélection via date picker
- **Heure de naissance** - Sélection via time picker (format 24h : 00:00-23:59)
- **Poids** - Prédiction en grammes (500-10000g)
- **Taille** - Prédiction en cm (20-100cm)
- **Couleur des cheveux** - Choix parmi : Bruns, Blonds, Roux, Noirs, Châtains
- **Couleur des yeux** - Choix parmi : Bleus, Verts, Marrons, Noisette, Gris

Tous ces champs sont **optionnels** et apparaissent dans une modal après le choix du genre.

![Modal de Pronostics](https://github.com/user-attachments/assets/1c6d5396-81b0-4077-a517-f2994564af0a)

*Interface de saisie des pronostics détaillés*

#### Page de Statistiques et Résultats

Nouvelle page `/results` affichant des statistiques complètes :

**Visualisations des Votes**
- Distribution des votes Fille/Garçon avec barre de progression
- Comptage détaillé par équipe (Team Fille vs Team Garçon)

**Moyennes Calculées**
- Poids moyen prédit (en grammes)
- Taille moyenne prédite (en cm)
- Couleur de cheveux la plus populaire
- Couleur d'yeux la plus populaire

**Liste Complète des Participants**
- Tous les votants avec leurs prédictions détaillées
- Affichage avec icônes pour chaque type de prédiction
- Horodatage de chaque vote

![Page de Statistiques](https://github.com/user-attachments/assets/b80c9471-bb1e-41d7-a8e6-4876ac50eae4)

*Dashboard des statistiques et pronostics*

#### Améliorations du Panel Admin

- Affichage de tous les détails de prédictions pour chaque vote
- Grille organisée montrant : date, heure, poids, taille, couleurs
- Lien rapide vers la page de statistiques

### 🔧 Technique

**Modèle de Données**
- Extension de l'interface `Vote` avec 6 nouveaux champs optionnels
- Validation Zod avec contraintes appropriées :
  - Poids : 500-10000g
  - Taille : 20-100cm
  - Heure : format HH:mm valide (00:00-23:59)

**API**
- Mise à jour de l'endpoint `/api/votes` pour gérer les données étendues
- Compatibilité ascendante maintenue - les anciens votes continuent de fonctionner

**Interface Utilisateur**
- Modal de prédictions avec champs de formulaire intuitifs
- Date picker et time picker natifs
- Dropdowns pour les choix de couleurs
- Design cohérent avec le thème violet/rose existant

### 📊 Calculs Statistiques

- **Moyennes** : Calculées uniquement sur les votes ayant rempli le champ concerné
- **Plus Populaires** : Utilise le comptage de fréquence pour trouver les valeurs modales
- **Pourcentages** : Calculés dynamiquement en temps réel

### 🌍 Localisation

Tous les nouveaux éléments d'interface sont en français :
- Labels de formulaire en français
- Messages d'aide et placeholders
- Titres et descriptions des statistiques

### 🔒 Sécurité

- Validation stricte de toutes les entrées utilisateur
- Parsing sécurisé des nombres avec `parseInt(value, 10)` et vérification NaN
- Validation du format d'heure (regex pour 00:00-23:59)
- Aucune vulnérabilité détectée (scan CodeQL passé)

### ♿ Accessibilité

- Labels appropriés pour tous les champs de formulaire
- Support de la navigation au clavier
- Messages d'erreur clairs
- Indicateurs de champs optionnels

## Notes de Version

### Compatibilité

✅ **Rétrocompatible** - Les votes existants sans prédictions continuent de fonctionner
✅ **Stockage fichier** - Pas de migration nécessaire, utilise `data/votes.json`
✅ **Champs optionnels** - Les utilisateurs peuvent voter sans remplir les prédictions

### Structure des Fichiers Modifiés

```
Fichiers modifiés :
├── lib/storage.ts           # Extension du modèle de données
├── lib/validation.ts        # Schémas de validation
├── app/api/votes/route.ts   # Endpoint API mis à jour
├── app/page.tsx             # Page principale avec modal
├── app/admin/page.tsx       # Panel admin amélioré
└── app/results/page.tsx     # ⭐ NOUVEAU - Page de statistiques
```

### Tests et Qualité

- ✅ Build réussi (0 erreurs)
- ✅ Linting passé (0 avertissements)
- ✅ Compilation TypeScript réussie
- ✅ Scan de sécurité passé (0 vulnérabilités)
- ✅ Tests manuels effectués

---

## Versions Antérieures

*Ce fichier changelog démarre avec la version actuelle. Les versions précédentes seront documentées lors des prochaines releases.*
