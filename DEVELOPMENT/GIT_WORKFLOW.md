# Git Workflow — Fitness Tracker iOS

## Branch strategy

### Branch principali
| Branch | Scopo |
|---|---|
| `main` | Codice stabile — trigger build Xcode Cloud per TestFlight |
| `develop` | Branch di sviluppo — merge su main quando una milestone è completa |
| `claude/*` | Branch di lavoro per Claude Code (automaticamente generati) |

### Flusso standard
```
claude/feature-branch
  → develop (PR / merge diretto quando stabile)
    → main (milestone completata → TestFlight)
```

---

## Commit convention

### Formato
```
[TAG] Messaggio breve (max 72 caratteri)

Corpo opzionale: perché questa modifica,
non cosa fa (il codice già mostra il cosa).
```

### Tag
| Tag | Uso |
|---|---|
| `M0..M6` | Milestone specifica |
| `ARCH` | Cambiamento architetturale |
| `DB` | Database esercizi |
| `FIX` | Bugfix |
| `DOCS` | Documentazione |
| `DESIGN` | Design system |
| `TEST` | Test |
| `CHORE` | Manutenzione (dipendenze, config) |

### Esempi buoni
```
[M0] Crea struttura directory progetto iOS

[M1] Implementa WorkoutViewModel: gestione serie completate

[FIX] Correggi crash TimerService quando app in background

[DB] Aggiungi Panatta Fit Evo Chest Press (codice 1FE165, verificato)

[DOCS] Aggiorna ARCHITECTURE.md: aggiunto diagramma flusso workout
```

### Esempi da evitare
```
fix stuff
update
WIP
varie modifiche
```

---

## Pull Requests

Le PR non sono obbligatorie per sviluppo personale, ma sono utili per:
- Modifiche architetturali significative
- Cambiamenti al data model
- Nuove milestone

### Template PR (semplificato)
```
## Cosa fa questa PR
Breve descrizione (2-3 righe)

## Milestone
[M0 / M1 / ...]

## File modificati
- FitnessTracker/Core/Models/Workout.swift
- ARCHITECTURE/DATA_MODEL.md

## Come testare
Passi per verificare il funzionamento

## Checklist
- [ ] Compila senza errori
- [ ] Test passano
- [ ] Documentazione aggiornata
- [ ] CHANGELOG.md aggiornato
```

---

## .gitignore

Il `.gitignore` del progetto deve includere:

```
# Xcode
*.xcuserstate
xcuserdata/
DerivedData/
*.moved-aside
*.hmap
*.ipa
*.xcarchive

# Swift Package Manager  
.build/
Packages/
Package.resolved (valutare se committare o meno)

# CocoaPods (non usiamo, ma per sicurezza)
Pods/

# Fastlane (non usiamo, ma per sicurezza)
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots/**/*.png
fastlane/test_output

# Secrets (mai nel repo)
*.p12
*.mobileprovision
*.p8

# macOS
.DS_Store
```

---

## Note per Claude Code

- Non pushare su `main` direttamente — usare `develop` o il branch assegnato
- Ogni sessione Claude Code lavora su un branch `claude/[nome]` assegnato
- Dopo una milestone completata: proporre il merge su `main` e comunicarlo all'utente
- Il merge su `main` triggera Xcode Cloud → nuova build su TestFlight
