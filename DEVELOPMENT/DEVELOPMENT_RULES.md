# Development Rules — Fitness Tracker iOS

## Regole fondamentali

1. **Leggere prima di modificare** — Prima di cambiare un file, leggi la documentazione pertinente
2. **Non rompere ciò che funziona** — Una nuova feature non deve causare regressioni
3. **Minimalismo nel codice** — Nessuna astrazione prematura, nessun codice che non serve oggi
4. **Nessuna dipendenza esterna** — Verificare sempre se le API Apple native bastano
5. **Commit atomici** — Ogni commit fa una cosa sola e descrive perché

---

## Regole Swift/SwiftUI

### Naming (italiano dove rilevante per la UI, inglese per il codice)
- Classi e struct: `PascalCase` in inglese (es: `WorkoutViewModel`, `CompletedSet`)
- Variabili e funzioni: `camelCase` in inglese
- I nomi dei modelli rispecchiano il dominio (es: `Routine`, `Workout`, `CompletedSet`)
- Le stringhe UI in italiano, mai hardcoded — usare `String` constants o LocalizedStringKey

### SwiftUI
- Non usare `UIKit` salvo necessità tecnica dimostrata
- Non usare `.frame(width:height:)` fisso quando `.frame(maxWidth: .infinity)` fa il lavoro
- I colori si usano sempre tramite i semantic tokens (`Color.appBackground`, etc.)
- La navigazione usa `NavigationStack` (non `NavigationView`)

### SwiftData
- Non usare `try? context.save()` per operazioni critiche — gestire l'errore
- Non accedere a `modelContext` direttamente nelle View per operazioni di scrittura
- Usare `@Query` nelle View per letture semplici

### ViewModels
- `@Observable` class (non `ObservableObject` con `@Published`)
- Non fare operazioni di rete o I/O pesante nel thread principale
- La logica di business va nei Service, non nel ViewModel

---

## Regole per Claude Code

### Prima di ogni modifica
1. Leggi `README.md`
2. Leggi la documentazione pertinente alla feature (es: `ARCHITECTURE/DATA_MODEL.md` se tocchi i modelli)
3. Verifica se la funzionalità esiste già
4. Verifica cosa usa il componente che stai modificando

### Durante la modifica
- Un cambiamento alla volta
- Non modificare file non correlati al task corrente
- Non aggiungere funzionalità non richieste (anche se "potrebbero essere utili")

### Dopo ogni modifica
1. Verifica errori di compilazione (dove possibile)
2. Controlla il diff
3. Aggiorna `CHANGELOG.md`
4. Aggiorna la documentazione se il comportamento o l'architettura cambia
5. Prepara commit descrittivo

### Commit message format
```
[M0] Aggiungi struttura directory progetto iOS

[M1] Implementa WorkoutViewModel con gestione serie

[ARCH] Aggiorna data model: aggiungi campo notes a CompletedSet

[DB] Aggiungi 5 esercizi Panatta Fit Evo verificati

[FIX] Correggi crash su iOS 17.0 nel TimerService

[DOCS] Aggiorna ROADMAP.md con criteri completamento M2
```

Formato: `[tag] Descrizione breve`
Tag: `M0..M6` (milestone), `ARCH` (architettura), `DB` (database), `FIX` (bug), `DOCS` (documentazione), `DESIGN` (design system)

---

## Cosa non fare mai

- `try!` in produzione (tranne inizializzazioni garantite)
- Force unwrap `!` su optionals non garantiti
- `print()` per debug in produzione — usare `#if DEBUG`
- Hardcode colori hex nelle View
- Dipendenze esterne senza documentarle in `DECISIONS.md`
- Modificare il data model senza aggiornare `ARCHITECTURE/DATA_MODEL.md`
- Eliminare codice funzionante senza documentare perché
- Dichiarare una feature "completata" senza averla testata

---

## Xcode Cloud / CI

Il workflow Xcode Cloud (`Build & TestFlight`) si attiva su ogni push al branch principale.

**Non pushare codice che:**
- Non compila
- Causa warning gravi (`Xcode Cloud` li tratta come errori se configurato)
- Rompe i test esistenti

Se si introduce un breaking change, aggiornare prima i test.
