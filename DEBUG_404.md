# Debug 404 - Checklist

Si vous obtenez toujours une erreur 404, vérifiez ces points dans l'ordre :

## 1. Vérifier que le conteneur est démarré et fonctionne

```bash
docker ps | grep gender-reveal-app
docker logs gender-reveal-app --tail 50
```

Le conteneur doit être en état "Up" et les logs ne doivent pas montrer d'erreurs.

## 2. Tester directement le conteneur (bypass Traefik)

```bash
# Depuis le serveur
docker exec gender-reveal-app curl -f http://localhost:3000/api/config

# Ou depuis l'extérieur si les ports sont exposés
curl http://votre-serveur:3000/api/config
```

Si cela fonctionne, le problème vient de Traefik, pas de l'application.

## 3. Vérifier le réseau proxy

```bash
docker network inspect proxy | grep -A 10 gender-reveal
```

Le conteneur `gender-reveal-app` doit apparaître dans la liste des conteneurs connectés au réseau `proxy`.

## 4. Vérifier les labels Traefik

```bash
docker inspect gender-reveal-app | grep -A 30 Labels
```

Vérifiez que tous les labels Traefik sont présents et corrects.

## 5. Vérifier le dashboard Traefik

Accédez au dashboard Traefik (généralement sur le port 8080) et vérifiez :

- **HTTP Routers** : Le router `gender-reveal-http` doit être présent
- **HTTPS Routers** : Le router `gender-reveal` doit être présent
- **Services** : Le service `gender-reveal` doit être présent et montrer le port 3000
- **Middlewares** : Les middlewares `https-redirect` et `gender-headers` doivent être présents

## 6. Vérifier les logs Traefik

```bash
docker logs traefik --tail 100 | grep -i gender
```

Cherchez des erreurs liées à `gender-reveal` ou `gender.guiltek.cloud`.

## 7. Vérifier le DNS

```bash
nslookup gender.guiltek.cloud
# ou
dig gender.guiltek.cloud
```

Le domaine doit pointer vers votre serveur.

## 8. Tester avec curl depuis l'extérieur

```bash
# Test HTTP (devrait rediriger vers HTTPS)
curl -I http://gender.guiltek.cloud

# Test HTTPS
curl -I https://gender.guiltek.cloud
```

## 9. Vérifier les entrypoints Traefik

Dans la configuration Traefik, vérifiez que les entrypoints s'appellent bien `web` et `websecure`.

Si vos entrypoints ont des noms différents, modifiez les labels dans docker-compose.yml :
- `web` → votre entrypoint HTTP
- `websecure` → votre entrypoint HTTPS

## 10. Redémarrer les services

```bash
# Dans Portainer ou en ligne de commande
docker compose down
docker compose up -d

# Attendre quelques secondes puis vérifier
docker logs gender-reveal-app --tail 20
docker logs traefik --tail 20 | grep gender
```

## 11. Vérifier la configuration Next.js

Next.js peut avoir besoin de headers spécifiques quand il est derrière un proxy. Vérifiez que `next.config.ts` est correct :

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
};
```

## 12. Test direct du port

Si les ports sont exposés dans docker-compose.yml, testez directement :
```bash
curl http://votre-serveur:3000
```

Si cela fonctionne mais pas via Traefik, le problème vient de la configuration Traefik.

## Solutions courantes

### Problème : Service non trouvé
**Solution** : Vérifiez que le label `traefik.http.routers.gender-reveal.service=gender-reveal` correspond au service défini avec `traefik.http.services.gender-reveal.loadbalancer.server.port=3000`

### Problème : Entrypoint non trouvé
**Solution** : Vérifiez les noms des entrypoints dans votre configuration Traefik et ajustez les labels si nécessaire.

### Problème : Réseau non connecté
**Solution** : Vérifiez que le conteneur est bien connecté au réseau `proxy` :
```bash
docker network connect proxy gender-reveal-app
```

### Problème : Certificat SSL
**Solution** : Si HTTPS ne fonctionne pas, vérifiez que le certresolver `myresolver` est bien configuré dans Traefik.
