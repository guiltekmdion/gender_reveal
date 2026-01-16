# 🎀 Gender Reveal App

Une application Next.js adorable et mobile-first pour organiser un gender reveal interactif avec pronostics des invités.

> 📸 **[Voir la documentation complète avec captures d'écran](docs/DOCUMENTATION.md)**

## ✨ Fonctionnalités

- 🎨 **Design magnifique** - Interface mobile-first avec animations et effets visuels
- 👥 **Système de votes** - Les invités peuvent voter pour Fille ou Garçon
- 🎯 **Pronostics détaillés** - Prédictions sur date (avec indicateur J-/J+), heure, poids, taille, couleurs des cheveux et yeux avec aperçu en temps réel
- 👶 **Avatar bébé personnalisé** - Système paperdoll inspiré de DiceBear avec 6 couches SVG modulaires
- 📊 **Statistiques en temps réel** - Visualisation des pourcentages de votes, moyennes des pronostics, roues de couleurs interactives (rafraîchissement auto toutes les 10s)
- 📈 **Page de résultats** - Dashboard complet avec statistiques et liste des participants
- 🔐 **Panel admin sécurisé** - Configuration facile avec mot de passe
- 🧪 **Tests automatisés** - 12 tests Playwright E2E (100% pass rate)
- ⚙️ **Personnalisation complète** :
  - Noms des parents et du bébé
  - Date du terme (pour indicateur J-/J+ dans les prédictions)
  - Couleurs et icônes
  - Lien vers la liste de naissance
  - Révélation du sexe avec page spéciale dédiée
- 🐳 **Dockerisé** - Déploiement simple et rapide
- 💾 **Persistance des données** - Stockage local sans base de données externe

## 🚀 Installation

### Méthode 1 : Docker (Recommandée)

```bash
# Cloner le repository
git clone https://github.com/guiltekmdion/gender_reveal.git
cd gender_reveal

# Créer le fichier .env
cp .env.example .env

# Éditer le .env et changer le mot de passe admin
nano .env

# Lancer avec Docker Compose
docker-compose up -d
```

L'application sera disponible sur http://localhost:3000

### Méthode 2 : Développement local

```bash
# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.example .env.local

# Éditer et changer le mot de passe admin
# ADMIN_PASSWORD=votre_mot_de_passe_securise

# Créer le dossier data
mkdir data

# Lancer le serveur de développement
npm run dev

# Lancer les tests
npm run test          # Tests Playwright
npm run test:ui       # Interface graphique
npm run test:headed   # Mode visible

# Éditer le .env.local et changer le mot de passe admin
nano .env.local

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 🔧 Configuration

### Variables d'environnement

Éditez le fichier `.env` ou `.env.local` :

```env
# Mot de passe administrateur
ADMIN_PASSWORD=VotreMotDePasse123

# Clé secrète JWT (générez une clé aléatoire longue)
JWT_SECRET=votre-cle-secrete-tres-longue-et-aleatoire

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Type de stockage : 'file' (JSON) ou 'sqlite' (base de données)
# Par défaut: 'file' pour compatibilité ascendante
STORAGE_TYPE=file

# Chemin vers la base de données SQLite (uniquement si STORAGE_TYPE=sqlite)
DATABASE_PATH=./data/gender_reveal.db
```

### Migration vers Base de Données SQLite

Pour une utilisation à long terme, l'application supporte SQLite avec persistance via volume Docker.

**Migration des données existantes :**

```bash
# Migrer les données JSON vers SQLite
npm run migrate:to-db
```

**Activer SQLite :**

Ajoutez dans votre `.env` ou `docker-compose.yml` :

```env
STORAGE_TYPE=sqlite
DATABASE_PATH=./data/gender_reveal.db
```

Le volume Docker `./data:/app/data` garantit la persistance de la base de données.

> 📖 **[Guide de migration complet](docs/MIGRATION.md)** - Instructions détaillées et dépannage

### Accès à l'administration

1. Rendez-vous sur `/admin`
2. Entrez le mot de passe défini dans `ADMIN_PASSWORD`
3. Configurez votre application :
   - Noms des parents
   - Nom du bébé
   - Lien vers la liste de naissance
   - **Format de date** : Choisissez parmi 6 formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD MMM YYYY, DD MMMM YYYY, DD/MM/YY)
   - Date du terme
   - Révélation du sexe (optionnel)

### Configuration du Format de Date

Dans le panel admin, vous pouvez choisir le format d'affichage des dates pour toute l'application :

- **DD/MM/YYYY** (26/05/2026) - Format français - Par défaut
- **MM/DD/YYYY** (05/26/2026) - Format américain
- **YYYY-MM-DD** (2026-05-26) - Format ISO
- **DD MMM YYYY** (26 mai 2026) - Format long français
- **DD MMMM YYYY** (26 mai 2026) - Format très long
- **DD/MM/YY** (26/05/26) - Format court

Le format choisi s'applique automatiquement à :
- **Date pickers** - Les champs de saisie de date affichent et acceptent le format configuré
- Dates de naissance dans les prédictions
- Dates populaires dans les statistiques
- Timestamps des votes
- Date du terme dans les modales et l'admin
- Toutes les dates affichées dans l'application

## 📱 Utilisation

### Page publique

Les invités peuvent :
- Entrer leur prénom
- Voter pour Fille ou Garçon
- **Faire des pronostics détaillés** (obligatoires dans la modal) :
  - Date de naissance (préremplie avec la date du terme si configurée)
  - Indicateur J-/J+ montrant les jours avant/après le terme
  - Heure de naissance (format 24h)
  - Poids (slider 500-6000g, valeur par défaut 3300g)
  - Taille (slider 25-60cm, valeur par défaut 50cm)
  - Couleur des cheveux (5 options avec aperçu)
  - Couleur des yeux (5 options avec aperçu)
  - Aperçu du bébé en temps réel (BabyAvatar)
- Voir les statistiques en temps réel (rafraîchissement auto toutes les 10s)
- Consulter tous les votes avec horodatage
- Accéder à la liste de naissance (si configurée)
- Voir la page de révélation du sexe (si activée par l'admin)

![Modal de Pronostics](https://github.com/user-attachments/assets/1c6d5396-81b0-4077-a517-f2994564af0a)

### Page de statistiques

La page `/results` affiche :
- Distribution des votes Fille/Garçon avec compteurs détaillés
- **Portrait moyen du bébé** (BabyAvatar avec prédictions les plus fréquentes)
- Moyennes des pronostics (poids, taille) calculées dynamiquement
- **Roues de couleurs interactives** (pie charts) pour cheveux et yeux avec pourcentages
- **Top 5 des dates de naissance** les plus populaires
- Liste complète des participants avec tous leurs pronostics détaillés
- Horodatage de chaque vote

## 📚 Documentation

- **[Documentation Visuelle avec Screenshots](docs/DOCUMENTATION.md)** - Captures d'écran détaillées de toutes les pages et modales
- **[Système BabyAvatar Technique](docs/BABYAVATAR.md)** - Architecture complète du système paperdoll SVG inspiré de DiceBear
- **[Guide de Migration SQLite](docs/MIGRATION.md)** - Instructions pour migrer vers SQLite
- **[Changelog](CHANGELOG.md)** - Historique des versions et modifications

![Page de Statistiques](https://github.com/user-attachments/assets/b80c9471-bb1e-41d7-a8e6-4876ac50eae4)

### Panel admin

Les administrateurs peuvent :
- Voir les statistiques détaillées en temps réel (total, Team Fille, Team Garçon)
- Consulter tous les pronostics de chaque participant avec détails complets
- **Configurer les informations de l'événement** :
  - Surnom du bébé
  - Noms des parents
  - Lien vers la liste de naissance
  - **Date du terme** (utilisée pour l'indicateur J-/J+ dans les prédictions)
- **Gérer la révélation du sexe** :
  - Activer/désactiver la révélation
  - Sélectionner le sexe réel (Fille/Garçon)
  - Affiche une page spéciale de révélation quand activée
- Gérer les votes (visualiser avec tous les détails, supprimer tous les votes)
- Accès rapide aux pages publique et statistiques

## 🎨 Personnalisation

L'application est conçue pour être facilement personnalisable :

- **Couleurs** : Modifiez les couleurs dans le panel admin ou dans `app/globals.css`
- **Icônes** : Utilise lucide-react pour une large collection d'icônes
- **Textes** : Tous les textes peuvent être modifiés dans les composants

## 📦 Structure du projet

```
gender_reveal/
├── app/
│   ├── api/           # Routes API
│   │   ├── auth/      # Authentification
│   │   ├── config/    # Configuration
│   │   └── votes/     # Gestion des votes
│   ├── admin/         # Panel d'administration
│   ├── results/       # Page de statistiques
│   ├── page.tsx       # Page principale (publique)
│   └── globals.css    # Styles globaux
├── lib/
│   ├── auth.ts        # Logique d'authentification
│   ├── storage.ts     # Gestion des données
│   └── validation.ts  # Schémas de validation
├── data/              # Stockage des données (gitignored)
├── Dockerfile         # Configuration Docker
├── docker-compose.yml # Configuration Docker Compose
├── CHANGELOG.md       # Historique des versions
└── README.md          # Ce fichier
```

## 🔒 Sécurité

- Authentification par mot de passe pour l'administration
- Token JWT pour les sessions admin
- Validation des entrées côté serveur
- Pas de données sensibles exposées côté client

## 🐳 Déploiement

### Docker

```bash
# Build l'image
docker build -t gender-reveal .

# Lancer le container
docker run -p 3000:3000 \
  -e ADMIN_PASSWORD=VotreMotDePasse \
  -e JWT_SECRET=VotreCleSecrete \
  -v $(pwd)/data:/app/data \
  gender-reveal
```

### Docker Compose

```bash
docker-compose up -d
```

### Vercel / Netlify

L'application peut être déployée sur Vercel ou Netlify. Assurez-vous de :

1. Configurer les variables d'environnement
2. Utiliser une solution de stockage persistant (ex: base de données)
3. Modifier `lib/storage.ts` pour utiliser la base de données choisie

## 🛠️ Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linter
npm run lint
```

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 💖 Crédits

Développé avec amour pour célébrer l'arrivée de nouveaux bébés ! 🍼

---

Fait avec ❤️ et Next.js
