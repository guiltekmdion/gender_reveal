# 🎀 Gender Reveal App

Une application Next.js adorable et mobile-first pour organiser un gender reveal interactif avec pronostics des invités.

## ✨ Fonctionnalités

- 🎨 **Design magnifique** - Interface mobile-first avec animations et effets visuels
- 👥 **Système de votes** - Les invités peuvent voter pour Fille ou Garçon
- 📊 **Statistiques en temps réel** - Visualisation des pourcentages de votes
- 🔐 **Panel admin sécurisé** - Configuration facile avec mot de passe
- ⚙️ **Personnalisation complète** :
  - Noms des parents et du bébé
  - Couleurs et icônes
  - Lien vers la liste de naissance
  - Révélation du sexe
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
```

### Accès à l'administration

1. Rendez-vous sur `/admin`
2. Entrez le mot de passe défini dans `ADMIN_PASSWORD`
3. Configurez votre application :
   - Noms des parents
   - Nom du bébé
   - Lien vers la liste de naissance
   - Révélation du sexe (optionnel)

## 📱 Utilisation

### Page publique

Les invités peuvent :
- Entrer leur prénom
- Voter pour Fille ou Garçon
- Voir les statistiques en temps réel
- Consulter tous les votes
- Accéder à la liste de naissance (si configurée)

### Panel admin

Les administrateurs peuvent :
- Voir les statistiques détaillées
- Configurer les informations de l'événement
- Gérer les votes (visualiser, supprimer)
- Activer la révélation du sexe

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
│   ├── page.tsx       # Page principale (publique)
│   └── globals.css    # Styles globaux
├── lib/
│   ├── auth.ts        # Logique d'authentification
│   └── storage.ts     # Gestion des données
├── data/              # Stockage des données (gitignored)
├── Dockerfile         # Configuration Docker
├── docker-compose.yml # Configuration Docker Compose
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
