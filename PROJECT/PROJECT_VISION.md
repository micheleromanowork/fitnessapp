# Project Vision — Fitness Tracker iOS

## Problema

Le app di workout tracking esistenti (Strong, Hevy, JEFIT) sono funzionali ma:
- Interface sovraccariche di funzioni
- Troppi tap per completare una serie
- Estetica datata o troppo aggressiva per un utente moderno
- Database generico, scarsa attenzione alle macchine italiane (Panatta)
- Esperienza poco curata durante l'allenamento

## Soluzione

Un'app iOS personale, esclusivamente in italiano, che mette al centro:

**L'allenamento in corso**, non le statistiche.

Un tracker che sparisce mentre alleni — veloce, pulito, minimale — e che poi mostra i dati quando vuoi vederli.

## Principi fondamentali

1. **Velocità** — Una serie deve essere registrata in ≤3 tap
2. **Semplicità** — Nessuna funzione aggiunta solo perché è possibile
3. **Local-first** — Funziona sempre, anche senza connessione
4. **Italiano** — Tutti i testi, tutti i nomi, tutta la UX in italiano
5. **Estendibile** — Architettura pronta per future sincronizzazioni cloud

## Utente target (v1)

Un singolo utente, il proprietario del progetto. Non è un prodotto commerciale nella prima versione.

Questo semplifica molte decisioni: nessun multiutente, nessun login obbligatorio, nessuna subscription.

## Differenziatori

- **Database Panatta** — Prima app con un catalogo completo delle macchine Panatta
- **Dynamic Island** — Timer recupero integrato nativamente
- **UX minimal tech** — Estetica moderna e pulita, non la classica grafica da bodybuilder
- **100% italiano** — Terminologia corretta per l'allenamento in italiano

## Non è (v1)

- Un social fitness network
- Un'app con AI coaching
- Un'app con sincronizzazione cloud obbligatoria
- Un prodotto commerciale con paywall
- Un'app con Apple Watch
- Un'app con HealthKit

## Visione a lungo termine

Una base solida local-first che permette di aggiungere in futuro:
- Sincronizzazione iCloud/CloudKit
- Apple Watch companion app
- HealthKit integration
- Programmazione allenamenti
- AI-assisted coaching (opzionale)
