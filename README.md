# CesiZen — Back-office

Interface d'administration de CesiZen, construite avec **React 19**, **TypeScript** et **Vite**.

## Prérequis

- Node.js 20+
- L'API `cesizen-api` en cours d'exécution

## Installation

```bash
git clone <repo-url>
cd cesizen-web
npm install
```

### Configuration

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de base de l'API (ex: `http://localhost:5027`) |
| `VITE_API_KEY` | Clé d'API (`x-api-key`) |

### Lancement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans `dist/`.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production |
| `npm run syntax` | Vérification TypeScript sans compilation |
| `npm run lint` | Analyse ESLint |
| `npm run preview` | Prévisualisation du build de production |
