# Plan de déploiement — cesizen-web

## 1. Architecture

cesizen-web est une application **React 19 / Vite** packagée dans un conteneur Docker (nginx). Elle consomme l'API REST `cesizen-api`.

```
Développeur → GitHub (push) → GitHub Actions (CI/CD) → GHCR (registry d'images) → Serveur (docker-compose)
```

## 2. Environnements

| Environnement | Branche source | Image Docker | Port |
|---|---|---|---|
| Développement local | `dev` | — (Vite dev server) | 5173 |
| Préprod | merge sur `dev` | `ghcr.io/cesizen-tma/cesizen-web:preprod` | 3001 |
| Production | merge sur `main` | `ghcr.io/cesizen-tma/cesizen-web:prod` | 3000 |

### Flux de branches

```
feature/* ──► dev ──► main
                │         │
             preprod     prod
```

Toute fonctionnalité est développée sur une branche `feature/` ou `fix/`, intégrée dans `dev` via Pull Request, puis promue en `main` pour la production.

## 3. Pipeline CI/CD

### 3.1 CI — Non-régression (`.github/workflows/ci.yml`)

**Déclencheur :** push sur toute branche sauf `main`, pull request vers `dev` ou `main`.

| Étape | Commande | Rôle |
|---|---|---|
| Installation | `npm ci` | Dépendances reproductibles (lockfile) |
| Vérification TypeScript | `npx tsc --noEmit` | Typage statique |
| Lint | `npm run lint` | Respect des règles ESLint |
| Tests | `npm run test` | Vitest — unitaires + composants |
| Build | `npm run build` | Vérification que le bundle compile |

La pipeline échoue et bloque le merge si l'une des étapes ne passe pas.

### 3.2 Déploiement préprod (`.github/workflows/deploy-preprod.yml`)

**Déclencheur :** push sur `dev`.

| Étape | Description |
|---|---|
| 1. Tests | Rejeu complet de la CI |
| 2. Build Docker | `docker build` avec les secrets d'environnement `preprod` |
| 3. Push GHCR | `docker push ghcr.io/cesizen-tma/cesizen-web:preprod` |
| 4. *(Manuel)* Déploiement | `docker compose -f docker-compose.preprod.yml pull && up -d` |

### 3.3 Déploiement production (`.github/workflows/deploy-prod.yml`)

**Déclencheur :** push sur `main`.

| Étape | Description |
|---|---|
| 1. Tests | Rejeu complet de la CI |
| 2. Build Docker | Build avec les secrets `prod` |
| 3. Push GHCR | Tags `:prod` et `:latest` |
| 4. Tag sémantique | Création automatique d'un tag `vX.Y.Z` (workflow `release.yml`) |
| 5. *(Manuel)* Déploiement | `docker compose -f docker-compose.prod.yml pull && up -d` |

## 4. Versioning sémantique

Les releases sont taguées automatiquement à chaque merge sur `main` via `anothrNick/github-tag-action`.

| Mention dans le message de commit | Effet |
|---|---|
| `#major` | Bump majeur : `1.0.0 → 2.0.0` |
| `#minor` | Bump mineur : `1.0.0 → 1.1.0` |
| *(aucune mention)* | Bump patch : `1.0.0 → 1.0.1` |

Les images Docker sont également taguées avec la version sémantique dans GHCR, permettant de retrouver et restaurer n'importe quelle version passée.

## 5. Ressources nécessaires

### 5.1 Secrets GitHub

#### Secrets d'organisation (`CESIZEN-tma`)

| Secret | Usage |
|---|---|
| `GH_NUGET_USERNAME` | Authentification NuGet privé (utilisé par cesizen-api) |
| `GH_NUGET_TOKEN` | Token PAT GitHub pour NuGet |

#### Secrets d'environnement `preprod`

| Secret | Description |
|---|---|
| `VITE_API_BASE_URL` | URL de l'API préprod |
| `VITE_API_KEY` | Clé d'API préprod |

#### Secrets d'environnement `prod`

| Secret | Description |
|---|---|
| `VITE_API_BASE_URL` | URL de l'API production |
| `VITE_API_KEY` | Clé d'API production |

### 5.2 Infrastructure serveur

- Docker Engine installé sur le serveur cible
- Accès au registre GHCR : `docker login ghcr.io -u <github_user> -p <PAT>`
- Fichiers `.env.preprod` / `.env.prod` présents sur le serveur (templates dans `cesizen-infra`)

### 5.3 Dépendances externes

| Dépendance | Version | Rôle |
|---|---|---|
| Node.js | 20 LTS | Runtime de build |
| React | 19 | Framework UI |
| Vite | 6 | Bundler |
| Vitest | 3 | Framework de tests |
| Docker | 24+ | Conteneurisation |

## 6. Procédure de rollback

En cas d'incident en production, revenir à une version précédente :

```bash
# Lister les tags disponibles dans GHCR
docker pull ghcr.io/cesizen-tma/cesizen-web:vX.Y.Z

# Retagger comme version courante
docker tag ghcr.io/cesizen-tma/cesizen-web:vX.Y.Z ghcr.io/cesizen-tma/cesizen-web:prod

# Relancer le service
docker compose -f docker-compose.prod.yml up -d cesizen-web
```

## 7. Cohérence avec le projet

| Contrainte | Solution retenue |
|---|---|
| Projet scolaire CESI | Environnements preprod et prod distincts, secrets séparés par environnement |
| Equipe réduite | Pipeline automatisée, déploiement manuel maîtrisé pour garder le contrôle |
| Pas de serveur dédié | docker-compose sur VM ou machine hôte, images portables via GHCR |
| Coût maîtrisé | GHCR gratuit pour dépôts publics, GitHub Actions inclus |
