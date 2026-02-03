# Design : Calendrier

## Objectif

Calendrier pour planifier des séances futures et visualiser l'historique. Vues mensuelle et hebdomadaire avec support des récurrences.

## Modèle de données

Nouveaux types dans `src/types/index.ts` :

```typescript
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export type PlannedSession = {
  id: string
  exerciseId: string
  programId: string
  date: string           // ISO format YYYY-MM-DD
  time?: string          // HH:mm (optionnel)
  notes?: string
  recurrenceType: RecurrenceType
  recurrenceEndDate?: string  // Date de fin si récurrent
  parentId?: string      // Si c'est une exception d'une série récurrente
}
```

**Stockage** : nouveau champ `plannedSessions` dans localStorage via WorkoutContext.

**Gestion des récurrences** :
- Séances récurrentes générées dynamiquement à l'affichage
- Modification "cette occurrence" → crée exception avec `parentId`
- Suppression "cette occurrence" → stocke dans liste d'exclusions

## Structure UI

**Nouvelle page** : `src/pages/Calendar.tsx`

**Composants** :

| Composant | Description |
|-----------|-------------|
| `CalendarView.tsx` | Conteneur principal avec toggle vue mois/semaine |
| `MonthView.tsx` | Grille mensuelle avec jours cliquables |
| `WeekView.tsx` | Vue 7 jours avec plus de détails |
| `DayCell.tsx` | Cellule d'un jour (pastilles colorées) |
| `SessionModal.tsx` | Modal détails séance (voir/modifier/supprimer/lancer) |
| `PlanSessionForm.tsx` | Formulaire création/édition séance planifiée |

**Navigation** : Icône calendrier dans navbar (entre Séance et Historique).

**Code couleur** :
- Vert = séance passée (complétée)
- Bleu = séance planifiée (future)
- Orange = séance planifiée aujourd'hui

**Interactions** :
- Clic jour vide → formulaire planification
- Clic jour avec séance → modal détails
- Swipe gauche/droite → naviguer mois/semaine

## Logique et Context

**WorkoutContext** - nouvelles fonctions :

```typescript
// CRUD séances planifiées
addPlannedSession(data: Omit<PlannedSession, 'id'>): void
updatePlannedSession(id: string, data: Partial<PlannedSession>): void
deletePlannedSession(id: string, deleteAll?: boolean): void

// Récupération
getPlannedSessionsForDate(date: string): PlannedSession[]
getPlannedSessionsForRange(start: string, end: string): PlannedSession[]
```

**Utilitaire récurrence** (`src/utils/recurrence.ts`) :

```typescript
expandRecurringSessions(
  sessions: PlannedSession[],
  startDate: string,
  endDate: string
): PlannedSession[]
```

**Fusion historique + planifié** :
- `sessions` = séances complétées (existant)
- `plannedSessions` = séances planifiées (nouveau)
- Calendrier affiche les deux avec couleurs différentes

**Lancement depuis calendrier** :
- Bouton "Lancer" → navigate `/session?exerciseId=X&programId=Y`
- ActiveSession lit query params et pré-remplit les selects

## Modifications séances récurrentes

Quand l'utilisateur modifie/supprime une séance récurrente, demander :
- "Cette occurrence seulement"
- "Toutes les occurrences"

## Notifications (reporté)

Les notifications push seront ajoutées dans une phase ultérieure avec :
- Réglage global du délai de notification
- Web Push API ou Firebase FCM
