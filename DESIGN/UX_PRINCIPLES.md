# UX Principles — Fitness Tracker iOS

## Il contesto d'uso

L'utente usa l'app in palestra, con:
- Mani sudate
- Distanza oculare variabile
- Attenzione divisa (sta allenandosi)
- Fretta (vuole tornare all'esercizio)
- Spesso indossa guanti

Ogni decisione UX deve tenere conto di questo contesto.

---

## Flusso core — workout in corso

Il flusso critico che deve essere perfetto:

```
1. Vedi esercizio corrente
2. Vedi il peso e le reps dell'ULTIMA volta
3. Tocca il campo peso → inserisci
4. Tocca il campo reps → inserisci
5. Tocca "Completa serie"
6. Timer recupero parte
7. Timer scade → torna al punto 2 per la serie successiva
```

**Regola:** Questo flusso deve essere eseguibile con una mano, senza guardare attentamente lo schermo, in meno di 5 secondi.

---

## Regole UX

### 1. I numeri vengono prima
Durante il workout, le informazioni numeriche (peso, reps, timer) devono essere la cosa più grande e visibile sullo schermo.

### 2. Un'azione principale per schermata
Non sovraccaricare lo schermo con opzioni. La call-to-action principale deve essere ovvia.

### 3. L'ultima prestazione sempre visibile
Prima di iniziare una serie, l'utente deve vedere subito cosa ha fatto l'ultima volta (stesso esercizio, stessa serie).

### 4. Conferma ≠ blocco
Il completamento di una serie deve essere un singolo tap. Non chiedere conferme che blocchino il flusso.

### 5. L'errore si corregge
È più veloce permettere la correzione post-fatto che aggiungere conferme pre-azione.
→ Il completamento di una serie deve essere reversibile.
→ Le modifiche ai dati storici devono essere possibili.

### 6. Il timer non è il protagonista
Il timer è un servizio — appare, fa il suo lavoro, scompare.
Non deve dominare visivamente la schermata quando non è necessario.

### 7. Tap target ≥ 44pt
Tutti i bottoni interattivi devono avere un'area tap minima di 44×44 punti (linea guida Apple).
Per i pulsanti principali durante il workout: ≥ 64×64 punti.

### 8. Input numerico ottimizzato
I campi peso e reps devono aprire il tastierino numerico immediatamente.
Il valore precedente deve essere pre-selezionato (per poter sovrascrivere subito).

### 9. Swipe e gesti solo dove intuitivi
Non nascondere funzioni critiche dietro swipe o gesti che l'utente potrebbe non scoprire.
Swipe per delete o riordino: solo nelle liste (comportamento iOS standard).

### 10. Feedback aptico
Usare il feedback aptico per:
- Completamento serie (medium impact)
- Fine timer recupero (notification impact)
- Completamento workout (success notification)

---

## Navigazione

### Struttura principale (Tab Bar)
```
[ Workout ]  [ Storico ]  [ Progressi ]  [ Impostazioni ]
```

### Durante il workout
- Il workout in corso mostra una schermata dedicata (full screen o sheet)
- Navigazione ridotta al minimo
- L'utente non deve perdere dati se torna accidentalmente alla home

### Sheet e modal
- Configurazione esercizio → sheet
- Aggiungi esercizio → sheet con ricerca
- Modifica storico → sheet

---

## Errori e stati vuoti

### Nessun workout in corso (home vuota)
- Messaggio breve e chiaro: "Inizia un nuovo allenamento"
- Pulsante grande e visibile per avviare
- Non mostrare tutorial invadenti

### Nessuno storico
- Messaggio motivazionale, non tecnico: "Nessun allenamento ancora"
- Non mostrare liste vuote con placeholder inutili

### Errore salvataggio
- Non mostrare mai messaggi tecnici all'utente
- "Salvataggio non riuscito — riprova" è sufficiente

---

## Accessibilità

- Rispettare Dynamic Type (le dimensioni dei font devono scalare)
- Supporto VoiceOver per gli elementi principali
- Contrasto minimo WCAG AA
- Non affidare informazioni al solo colore
