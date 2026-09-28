# Architecture — Fitness Tracker iOS

## Principi architetturali

1. **Local-first** — tutti i dati vivono sul dispositivo; sync cloud è un'aggiunta futura
2. **Feature-based** — il codice è organizzato per feature, non per layer tecnico
3. **Single source of truth** — SwiftData è l'unica fonte di verità per i dati persistenti
4. **Dipendenze minime** — nessuna libreria di terze parti in v1
5. **Testabilità** — logica di business separata dalla UI dove possibile

---

## Struttura directory

```
FitnessTracker/
├── FitnessTracker.xcodeproj
└── FitnessTracker/
    ├── App/
    │   ├── FitnessTrackerApp.swift     ← entry point, ModelContainer setup
    │   └── ContentView.swift           ← root view, TabView
    │
    ├── Features/
    │   ├── Workout/                    ← Milestone 1-3
    │   │   ├── WorkoutView.swift
    │   │   ├── WorkoutViewModel.swift
    │   │   ├── ActiveSetView.swift
    │   │   └── RestTimerView.swift
    │   ├── Exercises/                  ← Milestone 1+
    │   │   ├── ExerciseListView.swift
    │   │   ├── ExerciseDetailView.swift
    │   │   └── ExerciseSearchView.swift
    │   ├── History/                    ← Milestone 4
    │   │   ├── HistoryView.swift
    │   │   └── WorkoutDetailView.swift
    │   ├── Progress/                   ← Milestone 5
    │   │   └── ProgressView.swift
    │   └── Settings/                   ← Milestone 1
    │       └── SettingsView.swift
    │
    ├── Core/
    │   ├── Models/                     ← SwiftData models (condivisi)
    │   │   ├── Workout.swift
    │   │   ├── WorkoutExercise.swift
    │   │   ├── CompletedSet.swift
    │   │   ├── Routine.swift
    │   │   ├── RoutineExercise.swift
    │   │   ├── Exercise.swift
    │   │   └── AppSettings.swift
    │   ├── Services/                   ← Business logic (no UI)
    │   │   ├── WorkoutService.swift
    │   │   ├── ExerciseService.swift
    │   │   └── TimerService.swift
    │   └── Extensions/                 ← Swift extensions utili
    │       ├── Color+App.swift
    │       ├── Font+App.swift
    │       └── Date+Formatting.swift
    │
    └── Design/
        ├── DesignTokens.swift          ← colori, font, spacing come costanti
        └── Components/                 ← componenti riutilizzabili
            ├── WorkoutButton.swift
            ├── SetRow.swift
            └── TimerDisplay.swift
```

---

## Pattern architetturale

### MVVM semplificato
- **View (SwiftUI):** solo UI, si abbona a `@State`, `@Binding`, `@Query`
- **ViewModel:** `@Observable` class che gestisce lo stato della feature e coordina i Service
- **Service:** logica di business pura, nessuna dipendenza da UI

**Quando usare cosa:**
- Logica semplice, locale a una view → `@State` direttamente nella View
- Stato condiviso tra più view della stessa feature → `@Observable` ViewModel
- Operazioni che richiedono testabilità → Service separato

### Esempio flusso (completa una serie)
```
User tap "Completa Serie"
  → WorkoutViewModel.completeSet()
    → WorkoutService.saveCompletedSet(set, to: workout)
      → SwiftData ModelContext.insert(completedSet)
      → ModelContext.save()
    → TimerService.startRestTimer(duration: exercise.restDuration)
  → View si aggiorna automaticamente (@Query / @Published)
```

---

## Data flow

```
SwiftData
  ↕ (Query / ModelContext)
Services
  ↕
ViewModels (@Observable)
  ↕ (@Bindable / @State)
Views (SwiftUI)
```

Le View NON accedono direttamente a ModelContext per operazioni di scrittura.
Le View possono usare `@Query` per letture semplici.

---

## Live Activities / Dynamic Island (Milestone 3)

```
WorkoutViewModel
  → TimerService.startRestTimer()
    → ActivityKit startActivity(attributes:contentState:)
      → Dynamic Island UI (RestTimerLiveActivity)
```

Le Live Activities sono definite in un target separato (`FitnessTrackerWidgetExtension`).

---

## SwiftData ModelContainer

Configurazione in `FitnessTrackerApp.swift`:
```swift
.modelContainer(for: [
    Workout.self,
    WorkoutExercise.self,
    CompletedSet.self,
    Routine.self,
    RoutineExercise.self,
    Exercise.self,
    AppSettings.self
])
```

Il container è condiviso da tutta l'app tramite l'environment di SwiftUI.

---

## Predisposizione per sync cloud (futura)

Per permettere la sync senza riscrivere l'architettura:
1. I modelli SwiftData sono progettati per essere compatibili con CloudKit
2. Nessuna logica dipende da "dati locali per sempre" — i Service fanno da abstraction layer
3. Il `ModelContainer` può essere ricreato con `cloudKitDatabase` in futuro

---

## Targets Xcode

| Target | Scopo |
|---|---|
| `FitnessTracker` | App principale |
| `FitnessTrackerWidgetExtension` | Widget e Live Activities (Milestone 3+) |
| `FitnessTrackerTests` | Unit tests |
| `FitnessTrackerUITests` | UI tests |
