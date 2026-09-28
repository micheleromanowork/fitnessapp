# Exercise Database — Fitness Tracker iOS

## Strategia

Il database esercizi viene costruito progressivamente, milestone per milestone.
La priorità è la qualità e la verifica delle informazioni, non la quantità.

**Non inserire mai dati non verificati come fatti.**
Se un'informazione non è verificabile, marcarla come `isVerified: false` o lasciarla null.

---

## Stato attuale del database

| Categoria | Stato | Esercizi |
|---|---|---|
| Panatta — Fit Evo | In corso | 0 |
| Panatta — Full | In corso | 0 |
| Panatta — Special | Backlog | 0 |
| Corpo libero — Petto | Backlog | 0 |
| Corpo libero — Schiena | Backlog | 0 |
| Corpo libero — Spalle | Backlog | 0 |
| Corpo libero — Gambe | Backlog | 0 |
| Corpo libero — Core | Backlog | 0 |
| Bilancieri | Backlog | 0 |
| Manubri | Backlog | 0 |
| Cavi | Backlog | 0 |

---

## File del database

```
FitnessTracker/FitnessTracker/Resources/ExerciseDatabase/
├── panatta_fit_evo.json        ← Panatta linea Fit Evo
├── panatta_full.json           ← Panatta linea Full
├── panatta_special.json        ← Panatta linea Special
├── bodyweight.json             ← Esercizi a corpo libero
├── barbell.json                ← Bilancieri
├── dumbbell.json               ← Manubri
├── cable.json                  ← Cavi
└── generic_machines.json       ← Altre macchine
```

---

## Fonti dati

### Panatta
- **Fonte primaria:** Catalogo ufficiale Panatta (panatta.it)
- **NON usare:** Descrizioni di terze parti, YouTube, siti di fitness generici
- **Verificare:** Codice prodotto, nome ufficiale, linea prodotto

### Corpo libero
- **Fonte:** Standard esercizi riconosciuti (NSCA, ACE, nomenclatura italiana standard)
- **Denominazione:** Utilizzare i nomi italiani standard (es: "Piegamenti", non "Push-up" o "Flessioni")

---

## Priorità inserimento Panatta

Inserire prima le macchine più comuni nelle palestre italiane.

**Ordine suggerito:**
1. Chest Press / Panca Orizzontale
2. Shoulder Press / Distensione Spalle
3. Lat Machine / Lat Pulldown
4. Low Row / Rematore
5. Leg Press
6. Leg Extension / Leg Curl
7. Leg Abductor / Adductor
8. Cable Crossover / Croci ai Cavi
9. Pec Deck / Pectoral Machine
10. Preacher Curl / Scott Machine

Per ogni macchina: verificare prima il codice prodotto sul sito Panatta, poi inserire i dati.

---

## Seeding al primo avvio

Il file `ExerciseService.swift` gestisce il seeding del database:

```swift
func seedDatabaseIfNeeded() {
    let hasSeeded = UserDefaults.standard.bool(forKey: "exerciseDatabaseSeeded")
    guard !hasSeeded else { return }
    
    // Carica JSON da Resources/ExerciseDatabase/
    // Inserisce ogni esercizio in SwiftData
    // Marca UserDefaults "exerciseDatabaseSeeded" = true
}
```

L'aggiornamento del database in versioni successive dell'app:
- Aggiungere nuovi esercizi (append-only): `seedNewExercisesIfNeeded(version:)`
- NON eliminare o modificare esercizi esistenti (romperebbe lo storico)
- Per modifiche a esercizi esistenti: solo campi non-critici (description, setup, notes)
