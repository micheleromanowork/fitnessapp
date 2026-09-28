# Cloud Workflow — Fitness Tracker iOS

## Filosofia cloud-first

Questo progetto è sviluppato principalmente tramite Claude Code nel cloud.
Il Mac dell'utente NON è l'ambiente principale di sviluppo.
Il repository GitHub è la fonte unica di verità.

---

## Flusso di sviluppo

```
[Claude Code - cloud]
  Modifica codice Swift
  Commit + push → branch
  
[GitHub]
  Repository aggiornato
  Trigger Xcode Cloud (se configurato su branch target)
  
[Xcode Cloud]
  Build automatica
  Test automatici
  Archive (se workflow configurato)
  
[App Store Connect]
  Build disponibile in TestFlight
  
[iPhone dell'utente]
  Aggiornamento via TestFlight
  Test manuale dell'utente
  Feedback a Claude Code
```

---

## Xcode Cloud — configurazione prevista

### Workflow 1: Build & Test (develop)
- **Trigger:** Push su `develop`
- **Actions:** Build + Test
- **Distribuzione:** No (solo verifica)

### Workflow 2: TestFlight (main)
- **Trigger:** Push su `main`
- **Actions:** Build + Test + Archive + TestFlight
- **Distribuzione:** TestFlight interno
- **Versione:** Auto-incremento build number

---

## Gestione versioni

### Version number (Marketing Version)
Formato: `MAJOR.MINOR.PATCH`

| Milestone | Versione |
|---|---|
| M0 (infrastructure) | 0.1.0 |
| M1 (first workout) | 0.2.0 |
| M2 (rest timer) | 0.3.0 |
| M3 (dynamic island) | 0.4.0 |
| M4 (history) | 0.5.0 |
| M5 (progress) | 0.6.0 |
| M6 (full database) | 1.0.0 |

### Build number
Gestito automaticamente da Xcode Cloud (auto-increment).

---

## File di configurazione Xcode Cloud

Xcode Cloud legge la configurazione da `.xcode-cloud/` nel repository.

```
.xcode-cloud/
└── workflows/
    ├── build-test.yml          ← workflow develop
    └── testflight.yml          ← workflow main
```

Questi file vengono generati da Xcode Cloud al setup e non vanno modificati manualmente.

---

## Prerequisiti per il cloud workflow

1. **Account Apple Developer** attivo ($99/anno)
2. **App Store Connect** app creata con Bundle ID
3. **Xcode Cloud** attivato nel progetto
4. **GitHub** connesso ad Xcode Cloud
5. **TestFlight** configurato con l'utente come tester

Per la procedura dettagliata: `PROJECT/MANUAL_STEPS.md`

---

## Sviluppo senza Xcode Cloud (alternativa)

Se Xcode Cloud non è ancora configurato o non è disponibile:

1. Claude Code pusha il codice su GitHub
2. L'utente apre il progetto in Xcode sul Mac
3. L'utente fa `Product → Archive`
4. Distribuzione manuale su TestFlight

Questa è la modalità di fallback durante la Milestone 0.

---

## Limitazioni dello sviluppo cloud

Operazioni che **richiedono il Mac** dell'utente:
- Creazione progetto Xcode (solo in Xcode)
- Prima configurazione Xcode Cloud (richiede Xcode aperto)
- Debug con strumenti Instruments
- Profiling performance
- Test su device fisico prima di TestFlight

Operazioni che **Claude Code può fare** nel cloud:
- Modificare qualsiasi file Swift
- Aggiungere/modificare asset
- Aggiornare la documentazione
- Eseguire test (se configurati per Linux, ma Swift Package Manager)
- Analizzare il codice
- Refactoring
