# Local Storage — Fitness Tracker iOS

## Strategia

**SwiftData** è la fonte di verità per tutti i dati dell'utente.
**UserDefaults** solo per preferenze semplici che non richiedono query.
**Nessun file system diretto** per dati strutturati.

---

## SwiftData — dati persistenti

Tutti i modelli definiti in `ARCHITECTURE/DATA_MODEL.md` vivono in SwiftData.

**Schema version:** 1.0
**Migration strategy:** SwiftData automatic migration per aggiunte non-breaking.
Per cambi breaking, usare `VersionedSchema` e `SchemaMigrationPlan`.

**Dove si trovano i file:**
`~/Library/Application Support/[BundleID]/default.store` (sul device)

**Backup:**
I file SwiftData sono inclusi nel backup iCloud standard di iOS automaticamente.
Non è necessaria configurazione aggiuntiva per il backup di base.

---

## Database esercizi

Il catalogo esercizi (Exercise) è pre-popolato al primo avvio dell'app.
La strategia di seeding è:

1. Il catalogo è definito come JSON/Swift nella codebase (`Resources/ExerciseDatabase/`)
2. Al primo avvio, `ExerciseService.seedDatabaseIfNeeded()` inserisce tutti gli esercizi
3. Gli aggiornamenti del catalogo vengono gestiti tramite versioning

```swift
// Struttura file database
FitnessTracker/Resources/
├── ExerciseDatabase/
│   ├── panatta_exercises.json
│   ├── bodyweight_exercises.json
│   └── generic_exercises.json
```

---

## UserDefaults — solo per preferenze minime

UserDefaults è usato solo per:
- Flag "primo avvio" (per il seeding del database)
- Cache legata alla sessione corrente (non dati permanenti)

**Non usare UserDefaults per:** dati workout, esercizi, storico, impostazioni strutturate.
Tutte le impostazioni strutturate sono in `AppSettings` (SwiftData).

---

## Predisposizione CloudKit (future versioni)

Per abilitare la sync CloudKit in futuro:

**Modifica minima necessaria:**
```swift
// Attuale (v1)
.modelContainer(for: [...])

// Futuro (con CloudKit)
.modelContainer(
    for: [...],
    cloudKitDatabase: .automatic
)
```

**Prerequisiti per la sync:**
- Tutti i modelli devono avere campi opzionali o default (già rispettato)
- Relazioni devono essere opzionali dove possibile (già rispettato)
- UUID come identificatori (già implementato)

---

## Gestione errori di persistenza

**Strategia:**
- `try? context.save()` NON è accettabile per dati critici
- Ogni operazione critica (salva serie, completa workout) deve gestire l'errore esplicitamente
- In caso di errore di save: mostrare avviso all'utente e permettere retry

```swift
// Pattern consigliato nei Service
func saveCompletedSet(_ set: CompletedSet) throws {
    context.insert(set)
    do {
        try context.save()
    } catch {
        context.rollback()
        throw WorkoutError.saveFailed(error)
    }
}
```

---

## Privacy e sicurezza

- I dati non escono dal device in v1 (no sync cloud, no analytics)
- Il backup iCloud è cifrato tramite le impostazioni iOS dell'utente
- Nessun dato sensibile nei log
