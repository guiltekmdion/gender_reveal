# Configuration Build pour Portainer

## Optimisations du docker-compose.yml

Le fichier `docker-compose.yml` a été optimisé pour le build dans Portainer avec les fonctionnalités suivantes :

### 1. Cache Docker BuildKit
```yaml
build:
  args:
    - BUILDKIT_INLINE_CACHE=1
  cache_from:
    - gender-reveal-app:latest
```

Cela permet à Portainer de :
- Utiliser le cache Docker entre les builds
- Accélérer les builds successifs
- Réduire la consommation de bande passante

### 2. Configuration Traefik
- Réseau `proxy` (externe)
- Certificats SSL automatiques avec `myresolver`
- Redirection HTTP → HTTPS
- Security headers (HSTS, XSS protection, etc.)

### 3. Variables d'environnement
Toutes les variables peuvent être surchargées dans Portainer :
- `ADMIN_PASSWORD` : Mot de passe admin
- `JWT_SECRET` : Secret JWT (générez-en un fort !)
- `NEXT_PUBLIC_APP_URL` : URL publique de l'application
- `STORAGE_TYPE` : Type de stockage (`file` ou `database`)
- `DATABASE_PATH` : Chemin vers la base de données

### 4. Healthcheck
Le conteneur inclut un healthcheck qui vérifie que l'API répond correctement.

## Déploiement dans Portainer

### Via CI/CD GitHub (Recommandé)

1. **Stacks** > **Add stack**
2. Sélectionnez **Repository**
3. Configurez :
   - **Repository URL** : `https://github.com/votre-username/gender_reveal.git`
   - **Repository reference** : `refs/heads/main`
   - **Compose path** : `docker-compose.yml`
   - **Auto-update** : ✅ Activé
4. Ajoutez les variables d'environnement
5. **Deploy the stack**

### Build dans Portainer

Portainer va :
1. Cloner le repository GitHub
2. Utiliser le cache Docker si disponible
3. Builder l'image avec le Dockerfile
4. Démarrer le conteneur avec Traefik
5. Vérifier le healthcheck

## Dépannage Build

### Build échoue

Si le build échoue dans Portainer :

1. **Vérifiez les logs** dans Portainer : **Stacks** > votre stack > **Logs**
2. **Vérifiez les erreurs TypeScript** : Le build peut échouer si le code TypeScript a des erreurs
3. **Vérifiez les dépendances** : Assurez-vous que `package.json` est correct
4. **Vérifiez le Dockerfile** : Le Dockerfile doit être présent dans le repository

### Build lent

Pour accélérer les builds :
- Le cache Docker est automatiquement utilisé
- Les layers Docker sont mis en cache entre les builds
- Seuls les fichiers modifiés déclenchent un rebuild

### Variables d'environnement manquantes

Assurez-vous de définir toutes les variables nécessaires dans Portainer :
- `ADMIN_PASSWORD` (obligatoire)
- `JWT_SECRET` (obligatoire)
- `NEXT_PUBLIC_APP_URL` (recommandé)

## Notes importantes

- Le `.dockerignore` exclut les fichiers inutiles pour optimiser le contexte de build
- Le Dockerfile utilise un build multi-stage pour réduire la taille de l'image finale
- L'application est en mode `standalone` Next.js pour une image optimale
- Le volume `gender_reveal_data` persiste les données entre les redéploiements
