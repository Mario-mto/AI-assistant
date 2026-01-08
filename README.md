# Workout Tracker - Calisthenics

Application de suivi d'entraînement pour la musculation au poids du corps (calisthenics). Conçue pour le mobile avec un coach IA intégré.

## Fonctionnalités

### Entraînement
- **Exercices personnalisables** : Créez vos exercices avec objectifs et temps de repos
- **Programmes** : Regroupez vos exercices en programmes d'entraînement
- **Séance guidée** : Timer automatique entre les séries avec son et vibration
- **Pattern pyramidal** : Calcul automatique des répétitions décroissantes

### Suivi
- **Dashboard** : Statistiques globales et graphique de progression
- **Historique** : Toutes vos séances avec filtres et détails
- **Records** : Suivi de vos meilleures performances

### Coach IA (Gemini)
- **Chat intelligent** : Posez vos questions sur l'entraînement
- **Analyse de performance** : L'IA analyse votre progression
- **Création de programmes** : Le coach peut créer des programmes adaptés
- **Coaching live** : Encouragements pendant les séances

### Extras
- **Mode hors-ligne** : Fonctionne sans connexion internet (PWA)
- **Dark Mode** : Interface sombre pour le confort
- **Notifications** : Rappels d'entraînement configurables
- **Installable** : Ajoutez l'app sur votre écran d'accueil

## Utilisation

1. Ouvrez l'app sur votre téléphone
2. Ajoutez-la à votre écran d'accueil (optionnel mais recommandé)
3. Configurez vos exercices dans l'onglet **Config**
4. Lancez une séance dans l'onglet **Séance**

## Configuration du Coach IA

Le coach IA utilise **Google Gemini** (gratuit).

1. Allez sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Créez une clé API gratuite
3. Dans l'app, allez dans **Config** > **Assistant IA**
4. Collez votre clé API
5. Cliquez sur **Tester la connexion**

**Quota gratuit** : 15 requêtes/minute, 1 million de tokens/jour

## Installation locale (développeurs)

### Prérequis
- Node.js 18+
- npm

### Installation

```bash
# Cloner le repo
git clone https://github.com/votre-username/workout-tracker.git
cd workout-tracker

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérifier le code |

## Déploiement sur Vercel

### Option 1 : Via GitHub (recommandé)

1. Poussez le code sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com)
3. Importez votre repo GitHub
4. Vercel détecte automatiquement Vite
5. Cliquez sur **Deploy**

### Option 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

## Stack technique

- **Frontend** : React 19 + TypeScript
- **Styling** : Tailwind CSS 3
- **Routing** : React Router 7
- **Build** : Vite (Rolldown)
- **IA** : Google Gemini API
- **Storage** : localStorage (pas de backend)

## Structure du projet

```
src/
├── components/
│   ├── ui/           # Composants réutilisables (Button, Card, Timer...)
│   ├── coach/        # Interface du coach IA
│   ├── dashboard/    # Composants du tableau de bord
│   ├── history/      # Composants de l'historique
│   ├── layout/       # Navigation et layout
│   └── session/      # Composants de séance active
├── context/          # Contexts React (Workout, Theme, AICoach)
├── hooks/            # Hooks personnalisés
├── pages/            # Pages de l'application
├── services/         # Services (Gemini API)
├── types/            # Types TypeScript
└── utils/            # Fonctions utilitaires
```

## Contribuer

Les contributions sont les bienvenues ! Voir `docs/future-features.md` pour les idées de fonctionnalités à implémenter.

## Licence

MIT
