# Product Requirements — Fitness Tracker iOS

## Requisiti funzionali — Milestone 1 (MVP)

### Home / Dashboard
- Mostrare l'ultimo allenamento completato
- Accesso rapido per avviare un nuovo workout
- Accesso rapido alle schede salvate

### Gestione schede
- Creare una nuova scheda
- Modificare una scheda esistente
- Duplicare una scheda
- Eliminare una scheda
- Riordinare gli esercizi nella scheda
- Assegnare un nome alla scheda
- Aggiungere note alla scheda

### Workout in corso
- Avviare un workout da una scheda
- Vedere l'esercizio corrente con nome e muscoli target
- Vedere il peso e le reps dell'ultima serie dello stesso esercizio
- Inserire peso usato (in kg)
- Inserire numero di ripetizioni
- Completare una serie
- Passare alla serie successiva
- Passare all'esercizio successivo
- Completare il workout
- Annullare/interrompere il workout

### Timer recupero
- Avviare il timer manualmente dopo una serie
- Durata configurabile globalmente (default: 90 secondi)
- Durata configurabile per singolo esercizio
- Visualizzazione countdown chiara
- Pausa del timer
- Skip del timer
- Feedback visivo e aptico alla scadenza
- Timer visibile nella Dynamic Island (Milestone 3)

### Database esercizi
- Ricerca per nome
- Filtraggio per muscolo principale
- Filtraggio per attrezzatura/tipo
- Esercizi Panatta con informazioni dettagliate
- Esercizi a corpo libero
- Aggiunta esercizi personalizzati

### Storico (Milestone 4)
- Lista workout completati
- Dettaglio di un workout
- Modifica dati di un workout
- Eliminazione controllata
- Calendario

### Progressi (Milestone 5)
- Personal Record per esercizio
- Volume totale
- Grafici semplici e leggibili

## Requisiti non funzionali

### Performance
- Avvio app < 1 secondo
- Risposta tap < 100ms
- Salvataggio serie istantaneo

### Offline
- Funzionamento completo senza connessione internet
- Nessuna funzionalità degradata offline

### Dati
- Nessuna perdita dati in caso di crash
- Backup tramite iCloud (backup standard iOS, non sync cloud)
- Struttura dati compatibile con future sincronizzazioni

### UI
- Supporto Dark Mode (primario)
- Supporto Light Mode
- Dynamic Type (accessibilità)
- Supporto iPhone (non iPad nella v1)

## Requisiti tecnici

| Requisito | Valore |
|---|---|
| Piattaforma | iOS |
| iOS minimo | 17.0 (per Dynamic Island e SwiftData stabile) |
| Linguaggio | Swift 5.9+ |
| UI Framework | SwiftUI |
| Persistenza | SwiftData |
| Live Activities | ActivityKit |
| Widget | WidgetKit |
| Dipendenze esterne | Nessuna in v1 |

## Funzionalità escluse da v1

Vedere master prompt sezione 4. In sintesi:
- Apple Watch, HealthKit, AI Coach
- Social, multiutente, login obbligatorio
- Subscription, paywall, pubblicità
- Backend remoto, cloud sync obbligatoria
- Analytics invasivi
