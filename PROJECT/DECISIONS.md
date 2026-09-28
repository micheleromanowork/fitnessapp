# Decisions — Fitness Tracker iOS

Registro delle decisioni architetturali e di prodotto.
Formato: [Data] — Decisione — Motivazione — Alternativa scartata

---

## Decisioni prese

### [2024-09] Persistenza: SwiftData
**Decisione:** Usare SwiftData come layer di persistenza locale.
**Motivazione:** Framework Apple nativo, integrazione nativa con SwiftUI, senza dipendenze esterne. Supporta iCloud sync nativo in futuro (tramite CloudKit).
**Alternativa scartata:** Core Data (più verboso, non nativo SwiftUI), Realm (dipendenza esterna), SQLite diretto (troppo basso livello).

### [2024-09] UI Framework: SwiftUI
**Decisione:** Utilizzare SwiftUI in modo esclusivo.
**Motivazione:** Framework Apple nativo per iOS moderno, compatibile con Swift 5.9+, live previews, supporto nativo Dynamic Island tramite ActivityKit.
**Alternativa scartata:** UIKit (più maturo ma non nativo SwiftUI).

### [2024-09] iOS Minimum: 17.0
**Decisione:** Target minimo iOS 17.0.
**Motivazione:** SwiftData stabile (introdotto iOS 17), Dynamic Island supportato da iPhone 14 Pro+, API ActivityKit stabili. L'app è per uso personale su dispositivo recente.
**Alternativa scartata:** iOS 16 (SwiftData non disponibile), iOS 18 (esclude troppi device).

### [2024-09] Architettura: Features + Core
**Decisione:** Organizzazione del codice per feature verticali + core condiviso.
**Motivazione:** Ogni feature (Workout, History, Progress, Settings) è autonoma. Il core condivide modelli e servizi. Facile da navigare e mantenere tramite AI.
**Struttura:** `Features/{Workout,Exercises,History,Progress,Settings}/`, `Core/{Models,Services,Extensions}/`

### [2024-09] Lingua: Italiano esclusivo
**Decisione:** Tutta la UI, i nomi degli esercizi e la documentazione utente in italiano.
**Motivazione:** App personale dell'utente italiano, terminologia tecnica fitness in italiano.
**Impatto:** Nessuna internazionalizzazione richiesta in v1.

### [2024-09] No backend in v1
**Decisione:** Nessun backend remoto nella prima versione.
**Motivazione:** App personale, funzionamento offline prioritario, semplicità.
**Prerequisito per cloud sync:** Architettura modulare che permette di aggiungere sync in futuro.

### [2024-09] Distribuzione: TestFlight → App Store
**Decisione:** Prima distribuzione tramite TestFlight, poi eventualmente App Store.
**Motivazione:** TestFlight più veloce per uso personale, nessuna review necessaria per cominciare.

---

## Decisioni aperte — Richiedono conferma dell'utente

### OPEN-001: Nome dell'app
**Domanda:** Come si chiama l'app?
**Opzioni suggerite:** "Allenamento", "Palestra", "Rep", "Scheda", "Forza"
**Impatto:** Bundle ID, nome su App Store, asset grafici, codice
**Priorità:** Alta — necessario prima di creare il progetto Xcode
**Azione richiesta:** Comunicare il nome scelto prima di procedere con Milestone 0

### OPEN-002: Bundle Identifier
**Domanda:** Qual è il Bundle ID?
**Formato:** `com.tuodominio.nomeapp` (es: `com.peloro.allenamento`)
**Impatto:** Configurazione Xcode, provisioning profile, App Store Connect
**Dipende da:** OPEN-001 (nome app)

### OPEN-003: Apple Developer Team ID
**Domanda:** Qual è il Team ID dell'account Apple Developer?
**Come trovarlo:** Xcode → Preferences → Accounts → seleziona account → Team ID
**Impatto:** Code signing, Xcode Cloud, TestFlight
**Priorità:** Alta — necessario per Milestone 0

### OPEN-004: Colore accent del design system
**Domanda:** Qual è il colore accent principale dell'app?
**Proposta:** Blu sistema iOS (#0A84FF) — riconoscibile, nativo, accessibile
**Alternativa:** Indigo (#5E5CE6) — più caratteristico, meno generico
**Impatto:** Design system, identità visiva
**Priorità:** Media — può essere deciso dopo la prima build

### OPEN-005: Tema default
**Domanda:** L'app parte in dark mode o rispetta le impostazioni di sistema?
**Proposta:** Rispetta le impostazioni di sistema (standard iOS)
**Alternativa:** Forzare dark mode (coerente con estetica tech)
**Priorità:** Bassa

### OPEN-006: Unità di misura peso
**Domanda:** Chilogrammi (kg) o supporto anche libbre (lbs)?
**Proposta:** Solo kg, dato che l'utente è italiano
**Impatto:** Data model, UI input, calcoli
**Priorità:** Media

---

## Template per nuove decisioni

```
### [DATA] Titolo decisione
**Decisione:** ...
**Motivazione:** ...
**Alternativa scartata:** ...
```
