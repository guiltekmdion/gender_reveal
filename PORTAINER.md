# Déploiement dans Portainer

Ce guide vous explique comment déployer l'application Gender Reveal dans Portainer.

## Prérequis

- Portainer installé et configuré
- Accès à un environnement Docker
- Git (pour cloner le repository)

## Méthode 1: Déploiement via CI/CD GitHub (Recommandé)

Cette méthode permet de déployer automatiquement depuis votre repository GitHub avec mise à jour automatique.

### Étape 1: Configurer l'accès GitHub dans Portainer

1. Dans Portainer, allez dans **Settings** > **Registries**
2. Cliquez sur **Add registry**
3. Sélectionnez **GitHub** comme type
4. Configurez votre token GitHub (Personal Access Token avec permissions `repo`)
5. Enregistrez la configuration

### Étape 2: Créer la Stack avec CI/CD

1. Connectez-vous à Portainer
2. Allez dans **Stacks** (dans le menu de gauche)
3. Cliquez sur **Add stack**
4. Donnez un nom à votre stack (ex: `gender-reveal`)
5. Sélectionnez **Repository** (mode CI/CD)
6. Configurez les paramètres suivants:

#### Configuration du Repository

- **Repository URL**: `https://github.com/votre-username/gender_reveal.git`
  - Remplacez `votre-username` par votre nom d'utilisateur GitHub
  - Ou utilisez l'URL SSH: `git@github.com:votre-username/gender_reveal.git`

- **Repository reference**: `refs/heads/main` (ou `refs/heads/master` selon votre branche principale)

- **Compose path**: `docker-compose.yml`
  - Le fichier docker-compose.yml doit être à la racine du repository

- **Auto-update**: ✅ **Cochez cette option** pour activer le déploiement automatique
  - **Repository authentication**: Sélectionnez votre registry GitHub configurée à l'étape 1

### Étape 3: Configurer les variables d'environnement

Dans la section **Environment variables**, ajoutez ou modifiez les variables suivantes:

```env
PORT=3000
ADMIN_PASSWORD=votre-mot-de-passe-securise
JWT_SECRET=votre-secret-jwt-securise
NEXT_PUBLIC_APP_URL=http://votre-domaine.com
STORAGE_TYPE=file
DATABASE_PATH=./data/gender_reveal.db
```

**⚠️ Important:** 
- Changez `ADMIN_PASSWORD` et `JWT_SECRET` en production!
- Pour générer un JWT_SECRET sécurisé: `openssl rand -base64 32`
- Ajustez `NEXT_PUBLIC_APP_URL` avec votre domaine réel en production

### Étape 4: Déployer

1. Cliquez sur **Deploy the stack**
2. Portainer va cloner le repository, construire l'image Docker et démarrer les conteneurs
3. Surveillez les logs pour vérifier que tout se déroule correctement

### Mise à jour automatique

Avec l'option **Auto-update** activée:
- Portainer surveille automatiquement les changements sur la branche configurée
- Lors d'un push sur GitHub, Portainer redéploie automatiquement la stack
- Vous pouvez aussi forcer une mise à jour manuellement: **Stacks** > votre stack > **Editor** > **Pull and redeploy**

## Méthode 2: Déploiement manuel depuis Git

Si vous préférez un déploiement manuel sans auto-update:

1. Connectez-vous à Portainer
2. Allez dans **Stacks** > **Add stack**
3. Donnez un nom à votre stack
4. Sélectionnez **Repository**
5. Configurez:
   - **Repository URL**: URL de votre repository GitHub
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
   - **Auto-update**: ❌ Décochez cette option
6. Configurez les variables d'environnement
7. Cliquez sur **Deploy the stack**

Pour mettre à jour manuellement:
- **Stacks** > votre stack > **Editor** > **Pull and redeploy**

## Méthode 3: Déploiement depuis fichier local

Si vous avez déjà cloné le repository sur votre serveur:

1. Allez dans **Stacks** > **Add stack**
2. Sélectionnez **Web editor**
3. Copiez-collez le contenu de `docker-compose.yml`
4. Configurez les variables d'environnement
5. Cliquez sur **Deploy the stack**

## Méthode 2: Déploiement via Container

Si vous préférez créer le conteneur manuellement:

1. Allez dans **Containers** > **Add container**
2. Configurez:
   - **Name:** `gender-reveal-app`
   - **Image:** Construisez l'image depuis le Dockerfile ou utilisez une image pré-construite
   - **Port mappings:** `3000:3000`
   - **Volumes:** Créez un volume nommé `gender_reveal_data` et montez-le sur `/app/data`
   - **Environment variables:** Ajoutez toutes les variables nécessaires
3. Cliquez sur **Deploy the container**

## Configuration des volumes

L'application utilise un volume nommé `gender_reveal_data` pour persister les données. Ce volume est automatiquement créé lors du déploiement.

Pour sauvegarder les données:
1. Allez dans **Volumes** dans Portainer
2. Trouvez le volume `gender_reveal_data`
3. Utilisez l'option de sauvegarde/export

## Healthcheck

L'application inclut un healthcheck qui vérifie que l'API répond correctement. Vous pouvez voir le statut dans:
- **Containers** > votre conteneur > **Health**

## Accès à l'application

Une fois déployée, l'application sera accessible sur:
- `http://votre-serveur:3000` (ou le port configuré)

## Mise à jour

### Avec Auto-update activé (CI/CD)

Si vous avez activé l'auto-update lors de la création de la stack:
- Les mises à jour se font automatiquement lors d'un push sur la branche surveillée
- Portainer détecte les changements et redéploie automatiquement
- Aucune action manuelle nécessaire

### Mise à jour manuelle

Pour forcer une mise à jour manuelle:

1. Allez dans **Stacks** > votre stack
2. Cliquez sur **Editor**
3. Cliquez sur **Pull and redeploy**
4. Portainer va récupérer les dernières modifications depuis GitHub et redéployer

### Mise à jour sans Git

Si vous n'utilisez pas Git:
1. Allez dans **Stacks** > votre stack > **Editor**
2. Modifiez le docker-compose.yml directement
3. Cliquez sur **Update the stack**

## Dépannage

### Vérifier les logs
1. Allez dans **Containers** > `gender-reveal-app` > **Logs`

### Redémarrer le conteneur
1. Allez dans **Containers** > `gender-reveal-app` > **Restart**

### Vérifier les variables d'environnement
1. Allez dans **Containers** > `gender-reveal-app` > **Duplicate/Edit**
2. Vérifiez la section **Environment variables**

## Configuration CI/CD - Détails techniques

### Auto-update (Polling)

Portainer utilise un système de polling pour détecter les changements:
- Portainer vérifie périodiquement (toutes les 5 minutes par défaut) si des changements ont été effectués sur la branche surveillée
- Si des changements sont détectés, la stack est automatiquement redéployée
- Le polling est plus simple à configurer que les webhooks et ne nécessite pas d'accès externe à votre serveur

### Structure du repository requise

Pour que le déploiement CI/CD fonctionne, votre repository GitHub doit contenir:
- `docker-compose.yml` à la racine
- `Dockerfile` à la racine
- Tous les fichiers source nécessaires pour le build

### Variables d'environnement sensibles

⚠️ **Important**: Ne commitez jamais vos fichiers `.env` avec des secrets réels dans GitHub!

Utilisez plutôt:
- Les variables d'environnement dans Portainer (recommandé)
- Un fichier `.env` local sur le serveur (si vous n'utilisez pas le mode CI/CD)
- Un gestionnaire de secrets (HashiCorp Vault, etc.) pour la production

### Branches et tags

Vous pouvez configurer Portainer pour surveiller:
- Une branche spécifique: `refs/heads/main`
- Un tag: `refs/tags/v1.0.0`
- Une pull request: `refs/pull/123/head` (non recommandé pour la production)

## Sécurité

- Changez toujours `ADMIN_PASSWORD` et `JWT_SECRET` en production
- Utilisez HTTPS en production (configurez un reverse proxy comme Traefik ou Nginx)
- Limitez l'accès au port 3000 avec un firewall si nécessaire
- Ne commitez jamais de secrets dans votre repository GitHub
- Utilisez des tokens GitHub avec des permissions minimales nécessaires
