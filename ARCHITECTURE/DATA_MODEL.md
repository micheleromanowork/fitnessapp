# Data Model — Fitness Tracker iOS

Tutti i modelli usano SwiftData. Questa è la versione 1.0 del data model.

---

## Entità principali

### Exercise (esercizio nel database)
Rappresenta un esercizio astratto nel catalogo.

```swift
@Model
class Exercise {
    var id: UUID
    var name: String                    // Nome visualizzato in app (italiano)
    var officialName: String?           // Nome ufficiale del produttore
    var brand: String?                  // "Panatta", "corpo libero", "generico"
    var productLine: String?            // Linea prodotto (es: "Fit Evo", "Full")
    var productCode: String?            // Codice prodotto ufficiale
    var primaryMuscle: MuscleGroup      // Muscolo principale
    var secondaryMuscles: [MuscleGroup] // Muscoli secondari
    var bodyZone: BodyZone              // Zona corporea
    var movementType: MovementType      // Push, Pull, Squat, Hinge, etc.
    var equipmentType: EquipmentType    // Macchina, bilanciere, corpo libero, etc.
    var loadSystem: LoadSystem?         // Pesi selettori, bilanciere, corpo, etc.
    var instructions: String?           // Istruzioni esecuzione
    var setup: String?                  // Setup macchina
    var commonMistakes: String?         // Errori comuni
    var safetyNotes: String?            // Note sicurezza
    var defaultRestDuration: Int        // Secondi, default 90
    var isCustom: Bool                  // Creato dall'utente
    var source: String?                 // Fonte dati (URL o riferimento)
    var createdAt: Date
    var updatedAt: Date
}
```

### Routine (scheda di allenamento)
Una scheda programmata di esercizi.

```swift
@Model
class Routine {
    var id: UUID
    var name: String
    var notes: String?
    var sortOrder: Int
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(deleteRule: .cascade)
    var exercises: [RoutineExercise]
}
```

### RoutineExercise (esercizio in una scheda)
Un esercizio con i suoi parametri all'interno di una scheda.

```swift
@Model
class RoutineExercise {
    var id: UUID
    var sortOrder: Int
    var targetSets: Int                 // Numero di serie previste
    var targetReps: Int?                // Reps target (opzionale)
    var targetWeight: Double?           // Peso target (kg, opzionale)
    var restDuration: Int?              // Secondi — override del default dell'esercizio
    var notes: String?
    
    var exercise: Exercise              // Relazione all'esercizio nel catalogo
    
    @Relationship(inverse: \Routine.exercises)
    var routine: Routine?
}
```

### Workout (sessione di allenamento)
Una sessione reale completata o in corso.

```swift
@Model
class Workout {
    var id: UUID
    var startedAt: Date
    var completedAt: Date?              // nil se in corso
    var notes: String?
    var routine: Routine?               // nil per workout libero
    
    @Relationship(deleteRule: .cascade)
    var exercises: [WorkoutExercise]
    
    var duration: TimeInterval? {
        guard let completedAt else { return nil }
        return completedAt.timeIntervalSince(startedAt)
    }
    
    var isCompleted: Bool { completedAt != nil }
}
```

### WorkoutExercise (esercizio in una sessione)

```swift
@Model
class WorkoutExercise {
    var id: UUID
    var sortOrder: Int
    var notes: String?
    var exercise: Exercise
    
    @Relationship(deleteRule: .cascade)
    var sets: [CompletedSet]
    
    @Relationship(inverse: \Workout.exercises)
    var workout: Workout?
}
```

### CompletedSet (serie completata)

```swift
@Model
class CompletedSet {
    var id: UUID
    var setNumber: Int
    var weight: Double                  // kg
    var reps: Int
    var completedAt: Date
    var notes: String?
    
    @Relationship(inverse: \WorkoutExercise.sets)
    var workoutExercise: WorkoutExercise?
}
```

### AppSettings (impostazioni app)
Una singola istanza (singleton pattern con SwiftData).

```swift
@Model
class AppSettings {
    var id: UUID
    var defaultRestDuration: Int        // secondi, default 90
    var weightUnit: WeightUnit          // .kg sempre in v1
    var preferredTheme: AppTheme        // .system, .dark, .light
    var autoStartTimer: Bool            // avvia timer auto dopo serie
    var hapticEnabled: Bool
}
```

---

## Enumerazioni

```swift
enum MuscleGroup: String, Codable, CaseIterable {
    case chest = "Petto"
    case back = "Schiena"
    case shoulders = "Spalle"
    case biceps = "Bicipiti"
    case triceps = "Tricipiti"
    case legs = "Gambe"
    case quadriceps = "Quadricipiti"
    case hamstrings = "Femorali"
    case glutes = "Glutei"
    case calves = "Polpacci"
    case abs = "Addome"
    case core = "Core"
    case forearms = "Avambracci"
    case traps = "Trapezi"
    case fullBody = "Full Body"
}

enum BodyZone: String, Codable {
    case upperBody = "Parte superiore"
    case lowerBody = "Parte inferiore"
    case core = "Core"
    case fullBody = "Full body"
}

enum MovementType: String, Codable {
    case push = "Spinta"
    case pull = "Trazione"
    case squat = "Squat"
    case hinge = "Cerniera"
    case carry = "Trasporto"
    case isolation = "Isolamento"
    case compound = "Multiarticolare"
}

enum EquipmentType: String, Codable, CaseIterable {
    case panattaMachine = "Macchina Panatta"
    case machine = "Macchina"
    case barbell = "Bilanciere"
    case dumbbell = "Manubrio"
    case cable = "Cavo"
    case smithMachine = "Smith Machine"
    case bodyweight = "Corpo libero"
    case kettlebell = "Kettlebell"
    case bands = "Elastici"
    case other = "Altro"
}

enum LoadSystem: String, Codable {
    case selectorWeight = "Pesi a selettore"
    case plateLoaded = "Piastre"
    case bodyweight = "Peso corporeo"
    case cable = "Cavo"
    case hydraulic = "Idraulico"
}

enum WeightUnit: String, Codable {
    case kg = "kg"
    case lbs = "lbs"
}

enum AppTheme: String, Codable {
    case system = "Sistema"
    case dark = "Scuro"
    case light = "Chiaro"
}
```

---

## Note sul data model

- I pesi sono sempre salvati in kg internamente, indipendentemente dall'impostazione display
- Le relazioni cascade garantiscono che eliminare un Workout elimini anche tutti i WorkoutExercise e CompletedSet correlati
- Lo stesso vale per Routine → RoutineExercise
- `Exercise` nel catalogo NON viene eliminato in cascade (i dati storici mantengono il riferimento)
- Per garantire l'integrità storica, un Exercise non deve essere eliminato se ci sono WorkoutExercise che vi fanno riferimento
