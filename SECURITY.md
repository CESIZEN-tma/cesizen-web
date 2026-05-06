# Plan de sécurisation — cesizen-web

> Plan de sécurité global disponible dans [cesizen-infra/SECURITY.md](https://github.com/CESIZEN-tma/cesizen-infra/blob/main/SECURITY.md).
> Ce document couvre les vulnérabilités spécifiques à l'application web React.

---

## 1. Contexte

cesizen-web est une Single Page Application React 19 / Vite servie via nginx. Elle communique exclusivement avec `cesizen-api` et gère l'authentification côté client via JWT.

---

## 2. Vulnérabilités spécifiques — Web

| ID  | Vulnérabilité                              | P | I | Criticité | Statut         |
|-----|--------------------------------------------|---|---|-----------|----------------|
| W01 | Token JWT stocké dans localStorage         | 2 | 3 | **6**     | ⚠️ Risque résiduel |
| W02 | XSS (Cross-Site Scripting)                 | 1 | 2 | **2**     | ✅ Mitigé (React) |
| W03 | Absence de Content Security Policy (CSP)  | 2 | 2 | **4**     | ❌ À configurer |
| W04 | Clickjacking                               | 1 | 1 | **1**     | ⚠️ À configurer |
| W05 | Fuite de la clé API dans le bundle         | 2 | 2 | **4**     | ⚠️ Partiel      |
| W06 | Dépendances npm vulnérables                | 2 | 2 | **4**     | ⚠️ Monitoring (Dependabot + npm audit) |

---

## 3. Mesures en place

### Authentification
- Token JWT stocké en mémoire dans le contexte React (`useAuth`) — non persisté au rechargement
- Refresh token géré côté API, pas exposé dans le bundle

### Protection XSS
- React échappe automatiquement les variables dans le JSX
- Pas d'usage de `dangerouslySetInnerHTML`

### Variables d'environnement
- La clé API (`VITE_API_KEY`) est injectée au build via les secrets GitHub par environnement (preprod/prod)
- Elle n'est pas commité dans le code source

### CI / Supply chain
- `npm audit` à chaque push (détection de vulnérabilités dans les dépendances)
- Dependabot configuré pour alertes hebdomadaires
- Trivy scan de l'image Docker à chaque déploiement

---

## 4. Actions correctives prioritaires

### Content Security Policy (W03) — ÉLEVÉ
Ajouter dans la configuration nginx :
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.cesizen.fr;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Token storage (W01) — ÉLEVÉ
Si HTTPS est configuré, migrer vers des `httpOnly` cookies pour stocker les tokens. Cela les rend inaccessibles au JavaScript.

---

## 5. Procédure de gestion de crise

En cas d'incident, se référer à la procédure complète dans [cesizen-infra/SECURITY.md](https://github.com/CESIZEN-tma/cesizen-infra/blob/main/SECURITY.md).

**Action immédiate spécifique :**
```bash
# Rollback de la version web sans impacter l'API ni la DB
docker pull ghcr.io/cesizen-tma/cesizen-web:vX.Y.Z
docker compose -f docker-compose.prod.yml up -d cesizen-web
```
