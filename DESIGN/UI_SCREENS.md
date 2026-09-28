# UI Screens — Fitness Tracker iOS

Inventario delle schermate dell'app con descrizione funzionale.
Le specifiche dettagliate vengono aggiunte milestone per milestone.

---

## Tab Bar (struttura globale)

```
[ Allenamento | Storico | Progressi | Impostazioni ]
```

---

## Milestone 1 — Schermate

### 1. Home / Dashboard
**Path:** Tab "Allenamento" → stato idle

**Contenuto:**
- Pulsante principale: "Inizia Allenamento"
- Sezione "Schede" → lista schede salvate
- Last workout summary (se presente): data, durata, esercizi

**Azioni:**
- Tap "Inizia Allenamento" → modale selezione scheda o workout libero
- Tap su scheda → avvia workout con quella scheda
- Tap "+" → crea nuova scheda

---

### 2. Selezione scheda / Avvio workout
**Path:** Home → "Inizia Allenamento"

**Contenuto:**
- Lista schede disponibili
- Opzione "Workout libero" (senza scheda)

**Azioni:**
- Tap scheda → avvia workout (passa alla schermata Workout Attivo)
- Tap "Workout libero" → avvia senza scheda

---

### 3. Workout Attivo ← schermata più importante
**Path:** Durante un allenamento

**Contenuto (layout dall'alto):**
- Header: nome workout + durata corrente + pulsante "Fine"
- Nome esercizio corrente (grande)
- Muscolo principale (piccolo, secondario)
- **REFERENCE ROW:** "Ultima volta → [Xkg × Yreps]" (se disponibile)
- Input peso (numerico grande)
- Input reps (numerico grande)
- Pulsante "Completa Serie" (grande, primario)
- Lista serie completate (compatta, sotto)
- Pulsante "Prossimo Esercizio" (quando tutte le serie sono completate)

**Azioni:**
- Tap campo peso → tastierino numerico
- Tap campo reps → tastierino numerico
- Tap "Completa Serie" → segna serie completata, avvia timer se impostato
- Swipe su serie completata → modifica / elimina
- Tap "Prossimo Esercizio" → avanza all'esercizio successivo
- Tap "Fine" → conferma fine workout

---

### 4. Timer Recupero (overlay/sheet durante workout)
**Path:** Appare automaticamente dopo "Completa Serie" se timer attivo

**Contenuto:**
- Numero countdown grande (Timer.mono)
- "Recupero" come etichetta
- Pulsante "Skip" (piccolo, non primario)
- Pulsante "+" e "-" per aggiustare durata al volo

**Comportamento:**
- Si chiude automaticamente allo scadere
- Feedback aptico alla scadenza
- Visibile in Dynamic Island (Milestone 3)

---

### 5. Editor Scheda
**Path:** Home → "+" / Tap scheda → "Modifica"

**Contenuto:**
- Campo nome scheda
- Lista esercizi nella scheda (riordinabili)
- Pulsante "Aggiungi Esercizio"

**Azioni:**
- Drag & drop per riordinare esercizi
- Swipe per eliminare esercizio dalla scheda
- Tap esercizio → modifica parametri (serie, reps target, recupero)
- Tap "Aggiungi Esercizio" → schermata ricerca esercizi

---

### 6. Ricerca / Selezione Esercizi
**Path:** Editor Scheda → "Aggiungi Esercizio"

**Contenuto:**
- Barra ricerca
- Filtri rapidi: [Tutti | Panatta | Corpo libero | Bilanciere | Manubri | Cavi]
- Lista esercizi con nome, muscolo principale, tipo
- Tap → dettaglio esercizio (preview)

**Azioni:**
- Ricerca full-text per nome
- Filtraggio per categoria
- Tap → seleziona esercizio per la scheda

---

### 7. Dettaglio Esercizio
**Path:** Ricerca Esercizi → Tap esercizio

**Contenuto:**
- Nome ufficiale
- Brand/tipo (Panatta, corpo libero, etc.)
- Muscoli coinvolti
- Descrizione breve
- Illustrazione
- Aggiunta alla scheda corrente

---

### 8. Fine Workout (Summary)
**Path:** Workout Attivo → "Fine" → conferma

**Contenuto:**
- "Allenamento completato!"
- Durata totale
- Numero esercizi / serie completate
- Volume totale (opzionale, M5)
- Nuovo PR se applicabile
- Pulsante "Chiudi"

---

## Milestone 4 — Schermate Storico

### 9. Lista Storico
**Path:** Tab "Storico"

**Contenuto:**
- Lista workout ordinati per data (più recente prima)
- Per ogni workout: data, durata, esercizi principali
- Calendario opzionale in cima

### 10. Dettaglio Workout Storico
**Path:** Lista Storico → Tap workout

**Contenuto:**
- Data e ora
- Durata totale
- Lista esercizi con serie, pesi, reps
- Pulsante "Modifica"

---

## Milestone 5 — Schermate Progressi

### 11. Dashboard Progressi
**Path:** Tab "Progressi"

**Contenuto:**
- PR per esercizi recenti
- Grafici (volume / peso nel tempo per esercizio selezionato)
- Statistiche globali (allenamenti totali, volume totale)

---

## Milestone 1 — Impostazioni

### 12. Impostazioni
**Path:** Tab "Impostazioni"

**Contenuto:**
- Timer recupero default (stepper o slider)
- Unità di misura (kg)
- Tema (sistema / chiaro / scuro)
- (Future: backup iCloud, esporta dati)
