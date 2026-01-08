# Future Features - Workout Tracker

## Fonctionnalités pratiques

### Export/Import des données
- Export en JSON (backup complet)
- Export en CSV (pour Excel/Google Sheets)
- Import pour restaurer les données
- **Fichiers concernés** : Nouvelle page ou section dans Config, nouveau service `exportService.ts`

### Notes par séance
- Champ texte optionnel à la fin de chaque séance
- Tags prédéfinis : fatigue, blessure, motivation haute/basse
- Affichage dans l'historique et le détail de séance
- **Fichiers concernés** : `types/index.ts` (ajouter `notes` à Session), `ActiveSession.tsx`, `SessionDetailModal.tsx`

### Rappels personnalisables
- Choisir l'heure du rappel (pas juste 18h)
- Choisir les jours (ex: Lun/Mer/Ven)
- Plusieurs rappels possibles
- **Fichiers concernés** : `useNotifications.ts`, `Config.tsx`

---

## Gamification

### Système de streaks
- Compteur de jours consécutifs d'entraînement
- Affichage sur le Dashboard (flamme + nombre)
- Alerte si le streak est en danger (pas encore entraîné aujourd'hui)
- Record de streak le plus long
- **Fichiers concernés** : `Dashboard.tsx`, nouveau composant `StreakCounter.tsx`

### Badges / Achievements
Exemples de badges :
- "Centurion" : 100 reps d'un exercice en une séance
- "Marathonien" : 30 jours de streak
- "Diversifié" : 5 exercices différents en une semaine
- "Matinal" : Séance avant 8h
- "Nocturne" : Séance après 21h
- "Premier pas" : Première séance complétée
- "Habitué" : 10 séances complétées
- "Vétéran" : 100 séances complétées

**Fichiers concernés** : Nouveau type `Badge`, nouveau service `achievementsService.ts`, nouveau composant `BadgeList.tsx`, page ou modal dédiée

### Records personnels avec célébration
- Détecter automatiquement un nouveau record (max reps, max séries)
- Animation/confetti quand un record est battu
- Historique des records par exercice
- **Fichiers concernés** : `ActiveSession.tsx`, nouveau composant `RecordCelebration.tsx`

---

## Analyse avancée

### Volume total
- Calcul : séries × reps par exercice
- Graphique du volume par semaine/mois
- Comparaison semaine actuelle vs précédente
- **Fichiers concernés** : `Dashboard.tsx`, `ProgressChart.tsx`

### Graphique de progression par exercice
- Sélecteur d'exercice sur le Dashboard
- Courbe de progression spécifique à cet exercice
- Moyenne mobile pour lisser les variations
- **Fichiers concernés** : `ProgressChart.tsx` (paramétrable), `Dashboard.tsx`

### Prédiction d'objectif
- Basée sur la progression actuelle
- "À ce rythme, tu atteins [objectif] dans X semaines"
- Affichage dans le détail de l'exercice
- **Fichiers concernés** : Nouveau service `predictionService.ts`, `ExerciseStats.tsx`

---

## Entraînement

### Mode HIIT/Tabata
- Timer spécial avec intervalles configurables
- Travail : X secondes / Repos : Y secondes
- Nombre de rounds
- Son différent pour travail vs repos
- **Fichiers concernés** : Nouveau composant `HIITTimer.tsx`, nouvelle page ou mode dans `ActiveSession.tsx`

### Superset
- Lier 2+ exercices ensemble
- Enchaînement automatique sans pause entre les exercices
- Pause seulement après le superset complet
- **Fichiers concernés** : `types/index.ts` (Programme avec supersets), `ActiveSession.tsx`

### Échauffement guidé
- Liste d'échauffements par type d'exercice
- Timer pour chaque mouvement d'échauffement
- Option de skip
- **Fichiers concernés** : Nouveau composant `WarmupGuide.tsx`, données statiques d'échauffements

---

## Social (optionnel)

### Partage de stats
- Générer une image avec les stats de la séance
- Design optimisé pour Instagram Stories
- Bouton de partage natif (Web Share API)
- **Fichiers concernés** : Nouveau service `shareService.ts`, composant `ShareCard.tsx`, utilisation de html2canvas ou similar

### Profils multiples
- Sélection de profil au lancement
- Données séparées par profil
- Switch rapide entre profils
- **Fichiers concernés** : Nouveau contexte `ProfileContext.tsx`, modification de `useLocalStorage` pour préfixer par profil

---

## Priorités suggérées

### Facile (1-2h)
1. Notes par séance
2. Rappels personnalisables
3. Volume total sur Dashboard

### Moyen (2-4h)
4. Export/Import JSON
5. Système de streaks
6. Graphique par exercice

### Complexe (4h+)
7. Badges/Achievements
8. Mode HIIT/Tabata
9. Partage de stats (image)
10. Profils multiples

---

## Notes techniques

- Toutes les données restent en localStorage (pas de backend)
- Penser à la migration des données si on modifie les types
- Tester sur mobile (PWA) après chaque feature
- Le coach IA (Gemini) peut être enrichi pour commenter les nouvelles features
