# Dynamic Island — Fitness Tracker iOS

## Obiettivo (Milestone 3)

L'utente deve poter uscire dall'app durante il recupero e vedere il timer rimanente nella Dynamic Island senza riaprire l'app.

---

## Tecnologie

- **ActivityKit** — framework Apple per Live Activities
- **Dynamic Island** — presentazione compatta e espansa
- **Lock Screen** — widget sulla schermata di blocco
- **Push Notifications** — per l'aggiornamento del timer (locale, non remote)

---

## Struttura della Live Activity

### Attributi (statici, definiti all'avvio)
```swift
struct RestTimerAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var remainingSeconds: Int
        var isExpired: Bool
    }
    
    let exerciseName: String        // Es: "Panca Piana"
    let seriesNumber: Int           // Es: 2 (stai recuperando dopo la serie 2)
    let totalSeries: Int            // Es: 4
    let totalRestDuration: Int      // Durata totale del recupero
}
```

### ContentState (dinamico, aggiornato ogni secondo)
- `remainingSeconds` — secondi rimanenti
- `isExpired` — flag fine recupero

---

## Presentazioni UI

### Compact (Dynamic Island chiusa — solo iPhone 14 Pro+)
```
[🏋️ 0:45]
```
- Icona dumbbell + countdown compatto
- Dimensione massima ~36x36pt area leading/trailing

### Expanded (Dynamic Island aperta — tap & hold)
```
┌─────────────────────────────┐
│  Panca Piana — Serie 2/4    │
│         0:45                │
│     [⏭ Skip]               │
└─────────────────────────────┘
```

### Lock Screen / StandBy
```
┌─────────────────────────────┐
│ 🏋️  Recupero in corso       │
│  Panca Piana — Serie 2/4    │
│         0:45  ████████░     │
└─────────────────────────────┘
```

---

## Ciclo di vita

```
1. Utente completa una serie
   → WorkoutViewModel.completeSet()
   → TimerService.startRestTimer()

2. TimerService avvia la Live Activity
   → ActivityKit.request(attributes:contentState:pushType:)
   → Dynamic Island mostra il timer

3. Timer in corso (aggiornamento ogni secondo)
   → TimerService aggiorna ContentState
   → Activity.update(using: newContentState)

4. Timer scade
   → Activity.end(using: expiredState, dismissalPolicy: .after(30s))
   → Feedback aptico
   → Notifica locale se app in background

5. Utente riapre l'app
   → Timer già gestito dalla view (stato sincronizzato)
   → Live Activity terminata dopo 30s
```

---

## Implementazione (dettaglio Milestone 3)

### File da creare
- `FitnessTracker/Core/Services/TimerService.swift` — logica timer + ActivityKit
- `FitnessTrackerWidgetExtension/RestTimerLiveActivity.swift` — UI Live Activity

### Target Xcode
La Live Activity UI deve essere nel target `FitnessTrackerWidgetExtension`.
Il codice di gestione (avvio/aggiornamento) è nel target principale.

### Entitlement necessari
Nel file `.entitlements` del progetto:
- `NSSupportsLiveActivities: true`
- Aggiungere in Info.plist: `NSSupportsLiveActivitiesFrequentUpdates: true` (se aggiornamenti più frequenti)

---

## Limitazioni note

- Dynamic Island disponibile solo su iPhone 14 Pro e successivi
- Su device senza Dynamic Island: la Live Activity appare come banner su Lock Screen
- Le Live Activities hanno una durata massima di 8 ore (più che sufficiente per un workout)
- Il ContentState ha un limite di ~4KB — non inserire dati grandi

---

## Fallback per device senza Dynamic Island

Su iPhone 14 (standard) e precedenti:
- Il timer recupero appare come banner di notifica locale
- Lock Screen Live Activity comunque disponibile (supportata da iOS 16.1+)
- Nessuna degradazione funzionale — solo visual diversa
