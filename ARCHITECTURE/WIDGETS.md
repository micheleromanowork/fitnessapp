# Widgets — Fitness Tracker iOS

## Stato: non implementati in v1

I widget iOS vengono implementati dopo la stabilizzazione del core workout (Milestone 4+).

---

## Widget pianificati (backlog)

### Widget 1: Prossimo Allenamento
- **Dimensioni:** Small, Medium
- **Contenuto:** Nome prossima scheda programmata (se presente) / "Nessun workout programmato"
- **Deep link:** Apre l'app all'avvio workout

### Widget 2: Ultima Sessione
- **Dimensioni:** Small, Medium
- **Contenuto:** Data ultimo workout, durata, esercizi principali
- **Deep link:** Apre il dettaglio dell'ultimo workout in Storico

### Widget 3: Accesso Rapido
- **Dimensioni:** Small
- **Contenuto:** Pulsante "Inizia Allenamento" (interattivo con WidgetKit iOS 17+)
- **Deep link:** Avvia direttamente l'ultima scheda usata

---

## Architettura (quando implementato)

I widget usano **WidgetKit** e vivono nel target `FitnessTrackerWidgetExtension` (stesso target delle Live Activities).

I widget NON hanno accesso diretto a SwiftData del target principale.
Strategia di condivisione dati:
- **App Group** condiviso tra main app e widget extension
- I dati necessari al widget vengono scritti dall'app in un file JSON condiviso nell'App Group container

```swift
// App Group identifier
let appGroupID = "group.com.peloro.allenamento" // sostituire con bundle ID reale

// Widget legge da App Group
let sharedContainer = FileManager.default
    .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)
```

---

## Nota

Non implementare widget finché:
1. Milestone 4 (Storico) è completata e stabile
2. L'architettura App Group è definita
3. Il design system è finalizzato
