# Session Context - Workout Tracker

## Session State
- **Current feature**: Coach IA complet avec intégration séance
- **Current objective**: Coaching live + création auto de programmes
- **Phase**: Intégration fonctionnalités avancées
- **Date**: 2026-01-08

## Completed
- ✅ Setup projet (Vite + React + TypeScript + Tailwind v3)
- ✅ Types + Utils (id, date, defaultReps)
- ✅ Hook useLocalStorage + WorkoutContext
- ✅ Routing (React Router) + Layout + Navigation bottom
- ✅ Composants UI réutilisables (Button, Card, Input, Select, Modal, ConfirmModal)
- ✅ Page Config complète (CRUD Exercices + Programmes)
- ✅ Composant Timer avec auto-start et progress circle
- ✅ Composant SetLogger avec boutons +1/-1
- ✅ Page ActiveSession complète :
  - Sélection exercice + programme
  - Calcul valeur par défaut selon pattern
  - Système +1/-1 pour ajuster reps
  - Timer entre séries (auto-start)
  - Résumé des séries complétées
  - Sauvegarde session + redirection Dashboard
- ✅ Dashboard interactif :
  - 4 StatsCards (séances, reps, séries, dernière séance)
  - Graphique de progression SVG (10 dernières séances)
  - Liste des 5 dernières séances avec détails
  - Stats additionnelles (exercice favori, records)
  - Message d'onboarding si pas de données
- ✅ Page Historique complète :
  - Liste TOUTES les séances (tri ASC/DESC)
  - Filtres multiples (exercice, programme, période 7j/30j)
  - Modal détail séance (stats, progression, suppression)
  - Statistiques par exercice (toggle vue liste/stats)
  - Barre de progression vers objectif par séance
- ✅ Dark Mode complet :
  - ThemeContext avec détection préférence système
  - Persistance localStorage
  - Toggle dans page Config
  - Styles dark:* Tailwind sur tous les composants
- ✅ PWA (Progressive Web App) :
  - manifest.json avec métadonnées app
  - Meta tags PWA dans index.html
  - Icône SVG + générateur d'icônes PNG (generate-icons.html)
  - App installable sur mobile/desktop
- ✅ Service Worker pour mode hors ligne :
  - sw.js avec stratégie Network First + Cache Fallback
  - Enregistrement automatique au démarrage
  - Cache des assets essentiels
  - Fallback hors ligne
- ✅ Notifications Push :
  - Hook useNotifications avec gestion permissions
  - Rappel quotidien programmable à 18h
  - Toggle activation dans page Config
  - Support Service Worker + fallback Notification API
  - Persistance état dans localStorage
- ✅ Coach IA avec **Gemini (Google AI)** - GRATUIT :
  - **Infrastructure** :
    - Types TypeScript (ChatMessage, PerformanceAnalysis, ProgramSuggestion, etc.)
    - Service Gemini API (sendMessage, analyzePerformance, suggestProgram, getLiveCoaching)
    - Migration OpenAI → Gemini pour quota gratuit (15 req/min, 1M tokens/jour)
    - AICoachContext (gestion messages, analyses, suggestions, settings)
    - Hook useAICoach (facade pour utiliser le coach facilement)
  - **Interface Chat** :
    - Page Coach (/coach) avec navigation dédiée (🤖)
    - ChatInterface avec historique messages et boutons suggestions
    - ChatMessage (bulles user/assistant avec timestamps)
    - ChatInput (auto-expandable, Enter pour envoyer, Shift+Enter nouvelle ligne)
    - Animation "typing..." pendant réponse IA
  - **Configuration** :
    - APIKeySettings dans page Config
    - Input sécurisé pour clé API Google/Gemini (type password)
    - Lien vers Google AI Studio (aistudio.google.com/app/apikey)
    - Sélection modèle (Gemini 2.5 Flash, 2.5 Pro, 3 Flash Preview, Auto latest)
    - Toggle activer/désactiver coach IA
    - Toggle guidage temps réel
    - Bouton "Tester connexion" avec validation API Gemini
    - Informations quota gratuit (15 req/min, 1M tokens/jour)
    - Persistance settings dans localStorage

## Bugs Found
- ✅ FIXED: Tailwind v4 incompatible avec PostCSS → downgrade v3
- ✅ FIXED: TypeScript TS1484 (imports types) → ajout `import type`
- ✅ FIXED: Import useEffect inutilisé dans ActiveSession
- ✅ FIXED: Card component manquait onClick prop
- ✅ FIXED: Variable program inutilisée dans History
- ✅ FIXED: TypeScript TS2353 (vibrate option) → retiré de showNotification
- ✅ FIXED: Noms de modèles Gemini incorrects → testés via API, corrigés (2.5-flash, 2.5-pro, 3-flash-preview)
- ✅ FIXED: **Erreur Gemini "single turn requests end with a user role"**
  - **Cause racine** : React setState async → `coach.messages` ne contenait pas le nouveau message user lors de l'appel API
  - **Solution** :
    1. `useAICoach.ts` : inclusion explicite du nouveau message dans `messagesWithNew`
    2. `geminiService.ts` : validations défensives (fusion messages consécutifs, vérification premier/dernier message = user)
- ✅ FIXED: Scrollbar visible dans textarea du chat → ajout `overflow-hidden`

## New Features (Session 2026-01-08)
- ✅ **Coaching live pendant les séances** :
  - Messages d'encouragement du coach IA pendant le temps de repos
  - Feedback personnalisé à la fin de chaque séance
  - Écran de feedback avec animation avant redirection
- ✅ **Contexte enrichi pour Gemini** :
  - L'IA connaît maintenant l'historique des séances
  - Stats globales (nb séances, reps total, exercices)
  - Liste des exercices et programmes configurés
  - 10 dernières séances avec détails
- ✅ **Création automatique de programmes** :
  - Quand le coach suggère un programme, bouton "Créer ce programme"
  - Crée automatiquement le programme ET les exercices dans le système
  - Message de confirmation avec lien vers l'onglet Séance

## Current Issues
- ⚠️ SÉCURITÉ : Régénérer la clé API Gemini (exposée dans la conversation)

## Next Steps
1. **TESTER les nouvelles améliorations** :
   - ✅ Build passe sans erreurs
   - ⚠️ IMPORTANT : Régénérer une nouvelle clé API Gemini pour sécurité
   - Tester Coach IA (Config → entrer clé API → tester connexion → /coach pour chat)
   - Tester Dark Mode (toggle + persistance)
   - Tester Service Worker (mode hors ligne)
   - Tester Notifications (permission + rappel)
   - Générer et placer les icônes PNG (ouvrir generate-icons.html)
   - Tester PWA (installer l'app)
2. **TESTER l'app complète end-to-end** :
   - Config → créer exercices/programmes + toggles
   - Séance Active → faire une séance complète
   - Dashboard → vérifier stats et graphique
   - Historique → vérifier filtres et détails
3. Améliorations futures :
   - Export données (CSV/JSON)
   - Graphiques plus avancés
   - Sync cloud (optionnel)
4. Plus tard : Chatbot GPT pour adaptation programme

## Architecture Decisions
- Context API (pas Redux) pour simplicité
- localStorage pour persistance (pas de backend)
- Bottom navigation (mobile-first)
- Modals pour formulaires (UX propre)
- Pattern pyramidal calculé dynamiquement depuis exercice.goal

## Dev Server
- URL: http://localhost:5177
- Last test: ✅ Build passe (npm run build - 600ms)
- HMR: ✅ Améliorations chargées sans erreur
- État: 🟢 Serveur tourne en background

## Files Modified (This Session)
**Créés (Séance Active)** :
- session-context.md (fichier de tracking)
- src/components/ui/Timer.tsx (timer avec progress circle)
- src/components/session/SetLogger.tsx (système +1/-1)
- src/pages/ActiveSession.tsx (page complète avec 3 états: setup/active/resting)

**Créés (Dashboard)** :
- src/components/dashboard/StatsCard.tsx (carte de stat avec icône/couleur)
- src/components/dashboard/ProgressChart.tsx (graphique SVG progression)
- src/components/dashboard/RecentSessions.tsx (liste 5 dernières séances)
- src/pages/Dashboard.tsx (page complète avec calculs stats)

**Créés (Historique)** :
- src/components/history/SessionDetailModal.tsx (modal détail séance)
- src/components/history/ExerciseStats.tsx (stats par exercice)
- src/pages/History.tsx (page avec filtres + tri + liste)

**Créés (Améliorations moyen terme)** :
- src/context/ThemeContext.tsx (Dark Mode)
- src/hooks/useNotifications.ts (Notifications Push)
- public/manifest.json (PWA)
- public/sw.js (Service Worker)
- public/icon.svg (icône app)
- generate-icons.html (outil générateur d'icônes PNG)

**Modifiés** :
- src/components/ui/Card.tsx (ajout onClick prop)
- src/pages/Config.tsx (ajout toggles Dark Mode + Notifications)
- src/main.tsx (ajout ThemeProvider + enregistrement Service Worker)
- index.html (ajout meta tags PWA + manifest)
- tailwind.config.js (ajout darkMode: 'class')

**Créés (Coach IA MVP)** :
- src/types/coach.ts (types TypeScript pour coach - modèles Gemini)
- src/services/geminiService.ts (API Google Gemini - GRATUIT)
- src/context/AICoachContext.tsx (context global coach)
- src/hooks/useAICoach.ts (hook facade coach)
- src/components/coach/ChatMessage.tsx (bulle de message)
- src/components/coach/ChatInput.tsx (zone de saisie auto-expandable)
- src/components/coach/ChatInterface.tsx (interface chat complète)
- src/components/coach/APIKeySettings.tsx (paramètres API Google)
- src/pages/Coach.tsx (page dédiée au chat)

**Modifiés (Coach IA MVP)** :
- src/main.tsx (ajout AICoachProvider)
- src/App.tsx (ajout route /coach)
- src/components/layout/Navigation.tsx (ajout bouton Coach IA)
- src/pages/Config.tsx (section Assistant IA)

**Total nouvelles lignes** : ~2600 lignes (+800 pour coach IA)
