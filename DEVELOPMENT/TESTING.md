# Testing — Fitness Tracker iOS

## Strategia

Test dove contano: logica di business, persistenza dati, calcoli.
Non testare l'ovvio e non testare ciò che SwiftUI e SwiftData già garantiscono.

---

## Priorità di test

### Alta priorità (testare sempre)
- Salvataggio e recupero dati workout (SwiftData)
- Calcolo Personal Record
- Calcolo volume totale
- Timer (durata, pause, skip)
- Comportamento su chiusura/crash dell'app
- Aggiornamento Live Activity

### Media priorità
- Logica di navigazione tra esercizi e serie
- Seeding database esercizi
- Filtri e ricerca esercizi
- Modifica dati storici

### Bassa priorità (valutare caso per caso)
- Layout UI
- Colori e font
- Animazioni

---

## Struttura test

```
FitnessTrackerTests/
├── WorkoutTests.swift          ← Test WorkoutService e WorkoutViewModel
├── TimerTests.swift            ← Test TimerService
├── ExerciseTests.swift         ← Test ExerciseService e ricerca
├── DataModelTests.swift        ← Test integrità SwiftData
└── PRCalculationTests.swift    ← Test calcolo Personal Record
```

---

## Pattern per test SwiftData

I test SwiftData richiedono un ModelContainer in-memory per non toccare i dati reali.

```swift
// Setup standard per test SwiftData
func makeTestContainer() throws -> ModelContainer {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    return try ModelContainer(
        for: Workout.self, CompletedSet.self, /* ... */,
        configurations: config
    )
}
```

---

## Test critici da implementare in Milestone 1

### WorkoutTests
```swift
func testSaveCompletedSet() throws
func testWorkoutCompletionSavesCorrectly() throws
func testLastSetForExercise_returnsCorrectValue() throws
func testDeleteWorkout_cascadesCorrectly() throws
```

### DataModelTests
```swift
func testExerciseDatabaseSeeding_insertsAllExercises() throws
func testExerciseDatabaseSeeding_isIdempotent() throws
func testRoutineCascadeDelete() throws
```

### TimerTests
```swift
func testTimerCountsDown() async throws
func testTimerPause() async throws
func testTimerSkip() async throws
func testTimerFiresCallbackAtZero() async throws
```

---

## Testing manuale (da documentare per ogni milestone)

Prima di dichiarare una milestone completata:

### Checklist workout manuale
- [ ] Crea una nuova scheda con 3 esercizi
- [ ] Avvia un workout
- [ ] Completa 3 serie per ogni esercizio
- [ ] Il campo "ultima volta" mostra valori corretti
- [ ] Chiudi l'app durante il workout → riapri → dati intatti
- [ ] Completa il workout
- [ ] Verifica che il workout appaia nello storico
- [ ] Riavvia l'app → i dati persistono

### Checklist timer
- [ ] Il timer parte dopo "Completa serie"
- [ ] Il countdown è preciso (confronta con orologio esterno)
- [ ] Il feedback aptico si attiva alla scadenza
- [ ] Skip funziona immediatamente
- [ ] Pausa e ripresa funzionano

---

## Continuous Integration (Xcode Cloud)

Il workflow Xcode Cloud esegue automaticamente i test a ogni push.
I test devono passare prima di distribuire su TestFlight.

Se un test fallisce in CI:
1. Leggi i log in Xcode Cloud / App Store Connect
2. Riproduci localmente
3. Fixa il test (o il codice — non il test da solo se il codice è sbagliato)
4. Push
