# Dépannage Traefik - Erreur 404

Si vous obtenez une erreur 404 avec Traefik, voici les points à vérifier :

## 1. Vérifier les Entrypoints Traefik

Les entrypoints dans le docker-compose.yml utilisent `web` et `websecure`. Vérifiez que votre Traefik utilise les mêmes noms.

Pour vérifier vos entrypoints Traefik :
```bash
docker logs traefik 2>&1 | grep -i entrypoint
```

Ou consultez le dashboard Traefik : `http://votre-serveur:8080` (ou le port du dashboard)

### Si vos entrypoints sont différents

Si vos entrypoints s'appellent `http` et `https` au lieu de `web` et `websecure`, modifiez les labels dans docker-compose.yml :

```yaml
- "traefik.http.routers.gender-reveal.entrypoints=https"
- "traefik.http.routers.gender-reveal-http.entrypoints=http"
```

## 2. Vérifier le réseau Traefik

Assurez-vous que le réseau `traefik` existe :

```bash
docker network ls | grep traefik
```

Si le réseau n'existe pas, créez-le :
```bash
docker network create traefik
```

Si votre réseau Traefik a un nom différent, modifiez la section `networks` dans docker-compose.yml.

## 3. Vérifier que le conteneur est sur le bon réseau

```bash
docker inspect gender-reveal-app | grep -A 10 Networks
```

Le conteneur doit être connecté au réseau `traefik`.

## 4. Vérifier les logs Traefik

```bash
docker logs traefik --tail 50
```

Cherchez des erreurs liées à `gender-reveal` ou `gender.guiltek.cloud`.

## 5. Vérifier que le service répond

Testez directement le conteneur :
```bash
docker exec gender-reveal-app curl -f http://localhost:3000/api/config
```

Si cela fonctionne, le problème vient de la configuration Traefik.

## 6. Vérifier le dashboard Traefik

Accédez au dashboard Traefik et vérifiez :
- Que le router `gender-reveal` apparaît
- Que le service `gender-reveal-service` est configuré
- Que le port 3000 est correctement mappé

## 7. Configuration alternative (sans redirection HTTPS)

Si vous voulez tester sans HTTPS d'abord, utilisez cette configuration simplifiée :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.gender-reveal.rule=Host(`gender.guiltek.cloud`)"
  - "traefik.http.routers.gender-reveal.entrypoints=websecure"
  - "traefik.http.routers.gender-reveal.service=gender-reveal-service"
  - "traefik.http.services.gender-reveal-service.loadbalancer.server.port=3000"
```

## 8. Vérifier le DNS

Assurez-vous que `gender.guiltek.cloud` pointe bien vers votre serveur :

```bash
nslookup gender.guiltek.cloud
# ou
dig gender.guiltek.cloud
```

## 9. Redémarrer les services

Après modification, redémarrez :
```bash
docker compose down
docker compose up -d
```

Et vérifiez les logs :
```bash
docker compose logs -f gender-reveal-app
docker logs -f traefik
```

## 10. Configuration avec entrypoints personnalisés

Si vos entrypoints Traefik ont des noms différents, créez un fichier `.env` avec :

```env
TRAEFIK_HTTP_ENTRYPOINT=web
TRAEFIK_HTTPS_ENTRYPOINT=websecure
```

Et modifiez docker-compose.yml pour utiliser ces variables (nécessite une modification des labels).
