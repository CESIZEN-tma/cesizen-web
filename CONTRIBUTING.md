# Guide de contribution — cesizen-web

## 1. Stratégie de branches

```
main          ← production (protégée, merge via PR uniquement)
  └── dev     ← intégration / préprod (protégée, merge via PR uniquement)
        └── feature/<nom>   ← développement d'une fonctionnalité
        └── fix/<nom>        ← correction de bug
        └── chore/<nom>      ← maintenance, dépendances, config
```

**Règles :**
- On ne pousse jamais directement sur `main` ou `dev`.
- Toute modification passe par une Pull Request.
- Une PR doit être approuvée avant d'être mergée.
- La CI doit passer (tests + lint + build) avant tout merge.

## 2. Conventions de commits

Format : `type: description courte`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (dépendances, config, CI) |
| `docs` | Documentation uniquement |
| `refactor` | Refactoring sans changement de comportement |
| `test` | Ajout ou modification de tests |
| `style` | Formatage, espaces (pas de changement logique) |

**Exemples :**
```
feat: add breathing exercise configuration screen
fix: correct token refresh loop on 401 response
chore: upgrade vitest to v3
```

**Versioning sémantique :** pour contrôler le bump de version lors du merge sur `main` :
- `#major` dans le message → v1.0.0 → v2.0.0
- `#minor` dans le message → v1.0.0 → v1.1.0
- *(défaut)* → bump patch automatique

## 3. Gestion des tickets (GitHub Issues)

### Créer un ticket

Tout bug, évolution ou tâche est tracé dans **GitHub Issues** du repo `cesizen-web`.

**Labels disponibles :**

| Label | Couleur | Usage |
|---|---|---|
| `bug` | Rouge | Comportement incorrect |
| `enhancement` | Bleu | Nouvelle fonctionnalité ou amélioration |
| `chore` | Gris | Maintenance technique |
| `documentation` | Jaune | Documentation manquante ou incorrecte |
| `critical` | Rouge foncé | Bloquant, à traiter en priorité |
| `help wanted` | Vert | Ticket ouvert à contribution |

**Structure d'un ticket :**
```
Titre : [BUG] Le formulaire de login ne valide pas l'email

Description :
- Environnement : preprod / prod / local
- Étapes pour reproduire :
  1. ...
  2. ...
- Comportement attendu : ...
- Comportement observé : ...
- Capture d'écran (si applicable)
```

### Workflow d'un ticket

```
Open → In Progress → In Review → Done
```

| Statut | Signification |
|---|---|
| `Open` | Ticket créé, non assigné ou en attente |
| `In Progress` | Assigné à un développeur, branche créée |
| `In Review` | Pull Request ouverte, en attente de relecture |
| `Done` | PR mergée, ticket fermé |

### Lier un ticket à une PR

Dans le corps de la Pull Request :
```
Closes #42
```
GitHub fermera automatiquement le ticket au merge.

## 4. Processus de Pull Request

1. Créer une branche depuis `dev` : `git checkout -b feature/mon-feature`
2. Développer et committer selon les conventions
3. Pousser la branche : `git push origin feature/mon-feature`
4. Ouvrir une PR vers `dev` sur GitHub
5. Remplir le template de PR (description, tickets liés, checklist)
6. Attendre la validation CI + revue de code
7. Merger (squash ou merge commit selon la préférence)

## 5. Commandes utiles

```bash
# Lancer les tests
npm run test

# Vérifier les types TypeScript
npx tsc --noEmit

# Lancer le linter
npm run lint

# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```
