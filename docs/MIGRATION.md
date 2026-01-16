# Guide de Migration vers SQLite

Ce guide explique comment migrer votre application de Gender Reveal du stockage JSON vers SQLite pour une meilleure robustesse et performance.

## Pourquoi migrer vers SQLite ?

- **Performance** : SQLite est plus rapide pour les requêtes complexes et les grandes quantités de données
- **Robustesse** : Transactions ACID garantissant l'intégrité des données
- **Scalabilité** : Meilleure gestion des volumes importants de votes
- **Persistance** : Volume Docker garantit la persistance des données

## Prérequis

- Docker et Docker Compose installés
- Volume Docker configuré pour `/app/data`
- Données existantes dans `data/votes.json` et `data/config.json` (optionnel)

## Étapes de Migration

### 1. Sauvegarder les données existantes (recommandé)

Avant de migrer, faites une copie de vos données :

```bash
# Depuis le répertoire du projet
cp -r data data.backup
```

### 2. Installer les dépendances

```bash
npm install
```

Cela installera `better-sqlite3` et ses types TypeScript.

### 3. Exécuter le script de migration

Le script de migration va :
- Lire les données depuis les fichiers JSON
- Créer la base de données SQLite
- Migrer tous les votes et la configuration
- Afficher un rapport détaillé

```bash
npm run migrate:to-db
```

**Exemple de sortie :**

```
🚀 Démarrage de la migration vers SQLite...

📦 Initialisation de la base de données...
✅ Base de données initialisée

📥 Migration des votes...
✅ 42 vote(s) migré(s)

⚙️  Migration de la configuration...
✅ Configuration migrée

==================================================
📊 RAPPORT DE MIGRATION
==================================================
✅ Votes migrés: 42
✅ Configuration: Migrée

✅ Migration terminée sans erreur

💡 Pour utiliser SQLite, définissez STORAGE_TYPE=sqlite dans votre .env
==================================================
```

### 4. Configurer l'application pour utiliser SQLite

#### Option A : Variables d'environnement locales

Créez un fichier `.env.local` :

```env
STORAGE_TYPE=sqlite
DATABASE_PATH=./data/gender_reveal.db
```

#### Option B : Docker Compose

Modifiez votre `docker-compose.yml` ou créez un fichier `.env` :

```env
STORAGE_TYPE=sqlite
DATABASE_PATH=./data/gender_reveal.db
```

Puis redémarrez le conteneur :

```bash
docker-compose down
docker-compose up -d
```

### 5. Vérifier la migration

1. Accédez à l'application : http://localhost:3000
2. Vérifiez que tous les votes sont présents
3. Testez l'ajout d'un nouveau vote
4. Vérifiez la configuration dans `/admin`

## Structure de la Base de Données

La base SQLite est créée dans `data/gender_reveal.db` (ou le chemin spécifié dans `DATABASE_PATH`).

### Tables

- **votes** : Tous les votes avec leurs prédictions détaillées
- **config** : Configuration de l'application (format key-value)
- **schema_migrations** : Suivi des versions de schéma

### Index

- `idx_votes_timestamp` : Pour trier rapidement par date
- `idx_votes_choice` : Pour filtrer rapidement par genre

## Persistance avec Docker

Le volume Docker `./data:/app/data` garantit que :
- La base de données SQLite est persistée sur l'hôte
- Les données survivent aux redémarrages du conteneur
- Les backups peuvent être effectués en copiant le dossier `data/`

## Rollback vers JSON

Si vous souhaitez revenir au stockage JSON :

1. Modifiez `STORAGE_TYPE=file` dans votre `.env`
2. Redémarrez l'application
3. Les fichiers JSON existants seront utilisés (la base SQLite ne sera pas supprimée)

## Dépannage

### Erreur : "better-sqlite3 not found"

```bash
npm install
```

### Erreur : "Cannot find module './storage/interface'"

Assurez-vous d'avoir compilé le projet :

```bash
npm run build
```

### La base de données est vide après migration

1. Vérifiez que les fichiers JSON existent dans `data/`
2. Vérifiez les permissions du répertoire `data/`
3. Relancez le script de migration

### Erreur de permissions Docker

Assurez-vous que le volume Docker a les bonnes permissions :

```bash
sudo chown -R $USER:$USER ./data
```

## Migration Automatique

L'application détecte automatiquement le type de stockage au démarrage :
- Si `STORAGE_TYPE=sqlite`, la base de données est initialisée automatiquement
- Les migrations de schéma sont appliquées automatiquement
- Aucune action manuelle n'est requise après la première migration

## Support

Pour toute question ou problème, consultez :
- Le README.md pour la configuration générale
- Les logs Docker : `docker-compose logs app`
- Les logs de l'application dans la console
