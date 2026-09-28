# Roadmap — Fitness Tracker iOS

## Milestone 0 — Infrastructure ← CORRENTE

**Obiettivo:** Prima app vuota installabile via TestFlight

**Criteri di completamento:**
- [ ] Repository strutturato con documentazione completa
- [ ] Scheletro app Swift compilabile
- [ ] Xcode project creato dall'utente
- [ ] Xcode Cloud configurato
- [ ] Prima build su TestFlight
- [ ] App installabile sull'iPhone dell'utente

**File coinvolti:**
- `FitnessTracker/` — scheletro Xcode project
- `PROJECT/MANUAL_STEPS.md` — guida passo-passo
- Tutta la documentazione `PROJECT/`, `DESIGN/`, `ARCHITECTURE/`

**Operazioni manuali richieste:**
- Creazione Xcode project
- Configurazione Apple Developer account
- Configurazione Xcode Cloud
- Prima build e distribuzione TestFlight

---

## Milestone 1 — First Workout

**Obiettivo:** L'utente può completare un allenamento reale dall'inizio alla fine

**Funzionalità:**
- Home con accesso rapido
- Creazione e gestione schede
- Database esercizi iniziale (Panatta + corpo libero base)
- Avvio workout da scheda
- Inserimento peso e reps per ogni serie
- Completamento serie con conferma
- Completamento workout
- Salvataggio locale tramite SwiftData

**Criteri di completamento:**
- L'utente completa un allenamento reale in palestra usando l'app
- I dati sono salvati e visibili dopo la chiusura e riapertura dell'app
- Nessun crash durante l'uso normale

---

## Milestone 2 — Rest Timer

**Obiettivo:** Timer recupero funzionante e integrato nell'esperienza workout

**Funzionalità:**
- Countdown visivo durante il recupero
- Durata configurabile globalmente
- Durata configurabile per esercizio
- Avvio manuale (e auto se deciso dalla UX review)
- Pausa e skip
- Feedback aptico e notifica locale alla scadenza
- Timer persistente in background (notifica)

---

## Milestone 3 — Dynamic Island

**Obiettivo:** Timer recupero visibile nella Dynamic Island senza aprire l'app

**Funzionalità:**
- ActivityKit Live Activity avviata all'inizio del recupero
- Compact presentation: tempo rimanente + icona
- Expanded presentation: esercizio corrente, serie, tempo
- Lock screen: visualizzazione completa
- Feedback visivo/aptico alla scadenza della Live Activity
- Arresto corretto alla fine del workout

---

## Milestone 4 — Storico

**Obiettivo:** L'utente può consultare e gestire lo storico degli allenamenti

**Funzionalità:**
- Lista workout ordinata per data
- Dettaglio singolo workout (esercizi, serie, pesi, durata)
- Calendario con indicazione giorni allenati
- Modifica dati di un workout passato
- Eliminazione workout con conferma
- Riepilogo statistiche base

---

## Milestone 5 — Progressi

**Obiettivo:** Visualizzazione dei progressi nel tempo

**Funzionalità:**
- Personal Record per ogni esercizio
- Grafico volume per esercizio nel tempo
- Grafico peso massimo per esercizio
- Frequenza allenamenti
- Durata media workout
- UI grafici: minimal, leggibili, dark-first

---

## Milestone 6 — Database Esercizi Completo

**Obiettivo:** Database esercizi completo con focus Panatta

**Priorità:**
1. Panatta — catalogo completo linee principali
2. Corpo libero — tutti i principali esercizi
3. Bilancieri
4. Manubri
5. Cavi
6. Smith Machine
7. Altre macchine e produttori

---

## Backlog (future versioni)

- Widget iOS (prossimo allenamento, ultima sessione, progressi)
- iCloud sync (CloudKit)
- Apple Watch companion
- HealthKit integration
- Programmazione periodizzata
- Esportazione dati (CSV, JSON)
