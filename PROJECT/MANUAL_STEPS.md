# Manual Steps — Guida operazioni manuali

Questo file contiene guide passo-passo per tutte le operazioni che richiedono intervento manuale.
Ogni guida è scritta assumendo che l'utente non abbia esperienza con Xcode, Xcode Cloud o App Store Connect.

---

## STEP-001: Creare il progetto Xcode

### Prerequisiti
- Mac con macOS 14 (Sonoma) o superiore
- Xcode 15 o superiore installato (scaricabile dall'App Store)
- Account Apple ID (gratuito per iniziare)
- Account Apple Developer ($99/anno, necessario per TestFlight)

### Procedura

**1. Apri Xcode**
- Cerca "Xcode" nel Launchpad o in Spotlight (Cmd+Spazio → "Xcode")
- Aspetta che si apra completamente

**2. Crea un nuovo progetto**
- Schermata iniziale → clicca "Create New Project..."
- Oppure dal menu: File → New → Project...

**3. Scegli il template**
- Nella finestra "Choose a template", assicurati di essere nella tab "iOS" (in alto)
- Seleziona "App"
- Clicca "Next"

**4. Configura il progetto**
Compila questi campi:
- **Product Name:** `[nome scelto — vedi DECISIONS.md OPEN-001]` (es: "Allenamento")
- **Team:** Seleziona il tuo Apple Developer Team
- **Organization Identifier:** `com.peloro` (o il tuo dominio al contrario)
- **Bundle Identifier:** viene generato automaticamente come `com.peloro.nomeapp`
- **Interface:** SwiftUI ← IMPORTANTE
- **Language:** Swift ← IMPORTANTE
- **Storage:** SwiftData ← IMPORTANTE
- Deseleziona "Include Tests" per ora (aggiungeremo i test manualmente)
- Clicca "Next"

**5. Scegli dove salvare**
- Clicca "Next"
- Nella finestra di salvataggio, naviga fino alla cartella del repository clonato sul tuo Mac
- **IMPORTANTE:** Salva il progetto DENTRO la cartella `FitnessTracker/` del repository
- Il percorso finale deve essere: `[repository]/FitnessTracker/NomeApp.xcodeproj`
- Assicurati di avere selezionato "Create Git repository on my Mac" → **NO** (usiamo già Git)
- Clicca "Create"

**6. Verifica che il progetto sia stato creato**
- Xcode si apre con il progetto
- Nella barra laterale sinistra dovresti vedere la struttura del progetto
- In alto a sinistra dovresti vedere il nome del progetto
- Premi Cmd+B per fare una build veloce — deve compilare senza errori

**7. Cosa vedere in caso di successo**
- Build completata: in alto compare "Build Succeeded" in verde
- Nessun errore nella tab "Issue Navigator" (icona triangolo rosso a sinistra)

**8. Cosa fare se compare un errore**
- "No team selected": vai in Project Settings → Signing & Capabilities → seleziona il tuo Team
- "Bundle ID already in use": cambia il Bundle Identifier aggiungendo un suffisso
- Comunica l'errore esatto a Claude Code

**9. Dopo la creazione**
Nella cartella `FitnessTracker/` troverai:
```
FitnessTracker/
├── NomeApp.xcodeproj    ← il progetto Xcode
└── NomeApp/             ← i file sorgente
    ├── NomeAppApp.swift
    └── ContentView.swift
```

**10. Comunica a Claude Code:**
- Il nome esatto del progetto scelto
- Il Bundle Identifier
- Il Team ID (trovalo in Xcode → Preferences → Accounts → dettagli del team)

---

## STEP-002: Aggiungere i file sorgente al progetto Xcode

Dopo aver creato il progetto, devi aggiungere i file Swift che Claude Code ha già creato nella cartella `FitnessTracker/FitnessTracker/`.

### Procedura

**1. Apri il progetto in Xcode**
- Apri `FitnessTracker/NomeApp.xcodeproj`

**2. Nella sidebar, espandi il gruppo con i file sorgente**
- Clicca sul triangolino a sinistra del nome progetto nella sidebar

**3. Aggiungi i file esistenti**
- Tasto destro sul gruppo principale (nome del progetto nella sidebar)
- Seleziona "Add Files to 'NomeApp'..."
- Naviga fino alla cartella `FitnessTracker/FitnessTracker/`
- Seleziona tutte le sottocartelle (App/, Features/, Core/, Design/)
- **IMPORTANTE:** Seleziona "Create groups" (non "Create folder references")
- Seleziona "Add to target: NomeApp" ← deve essere selezionato
- Clicca "Add"

**4. Verifica**
- I file devono apparire nella sidebar di Xcode
- Premi Cmd+B — deve compilare senza errori

---

## STEP-003: Configurare Xcode Cloud

Xcode Cloud è il servizio CI/CD di Apple che costruisce automaticamente l'app ogni volta che fai un commit su GitHub.

### Prerequisiti
- Account Apple Developer attivo ($99/anno)
- Progetto Xcode creato (STEP-001 completato)
- Repository GitHub connesso

### Procedura

**1. In Xcode, apri il pannello Report Navigator**
- Premi Cmd+9 oppure clicca sull'icona del cloud nella barra laterale

**2. Vai su "Cloud" nella barra laterale**
- Dovresti vedere un pannello con l'opzione per configurare Xcode Cloud

**3. Clicca "Get Started with Xcode Cloud"**
- Se non vedi questa opzione: Product → Xcode Cloud → Create Workflow

**4. Accedi con il tuo Apple ID**
- Inserisci le credenziali Apple Developer

**5. Scegli il prodotto**
- Seleziona il progetto appena creato

**6. Connetti il repository GitHub**
- Xcode Cloud chiede di connettere il repository
- Clicca "Grant Access" e accedi a GitHub
- Autorizza l'accesso al repository `micheleromanowork/pelorolab`
- Torna in Xcode

**7. Configura il workflow iniziale**
Configura come segue:
- **Name:** "Build & TestFlight"
- **Start Condition:** Branch Changes → `claude/adoring-newton-u7iv54` (per ora) o `main`
- **Actions:**
  - Build → aggiungi se non c'è
  - Test → puoi saltare per ora (aggiungi dopo)
  - Archive → aggiungi
  - TestFlight Distribution → aggiungi
- Clicca "Next"

**8. Verifica la configurazione di firma**
- Xcode Cloud deve poter firmare l'app
- Seleziona "Automatic signing"
- Clicca "Next"

**9. Completa e salva il workflow**
- Review configuration → clicca "Save and Run"

**10. Prima build**
- Xcode Cloud avvia la prima build
- Puoi monitorare lo stato in Xcode → Report Navigator → Cloud
- Oppure su App Store Connect → Xcode Cloud

**11. Cosa vedere in caso di successo**
- Build completata con status verde
- L'app appare in App Store Connect → TestFlight → iOS Builds

**12. Cosa fare se la build fallisce**
- Clicca sulla build fallita per vedere i log
- Copia il messaggio di errore
- Comunicalo a Claude Code

---

## STEP-004: Distribuire su TestFlight

### Prerequisiti
- Xcode Cloud configurato (STEP-003 completato)
- Almeno una build completata con successo

### Procedura

**1. Apri App Store Connect**
- Vai su [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- Accedi con il tuo Apple ID

**2. Vai alla tua app**
- Clicca "My Apps"
- Seleziona la tua app fitness tracker

**3. Vai su TestFlight**
- In alto clicca sulla tab "TestFlight"

**4. Aggiungi te stesso come tester**
- Nel pannello sinistro: TestFlight → Internal Testing
- Clicca il "+" per aggiungere tester interni
- Aggiungi il tuo Apple ID

**5. Installa TestFlight sul tuo iPhone**
- Sul tuo iPhone, apri l'App Store
- Cerca "TestFlight"
- Scarica e installa l'app di Apple

**6. Installa la tua app tramite TestFlight**
- Su App Store Connect → TestFlight → clicca sulla build
- Clicca "Add External Testers" oppure usa il link d'invito
- Apri l'invito sul tuo iPhone
- Si apre TestFlight → installa l'app

**7. Verifica**
- L'app deve comparire nella schermata principale di TestFlight
- Clicca "Install"
- L'app appare sulla home screen del tuo iPhone

**8. Comunicare a Claude Code**
- "L'app è installata su TestFlight" + eventuale screenshot

---

## STEP-005: Come aggiornare l'app

Ogni volta che Claude Code fa un commit e push, Xcode Cloud costruisce automaticamente una nuova versione.

**Flusso automatico:**
1. Claude Code fa modifiche al codice
2. Claude Code esegue `git push`
3. Xcode Cloud detecta il push e avvia una build
4. Se la build ha successo, appare in TestFlight
5. TestFlight invia una notifica sul tuo iPhone
6. Apri TestFlight → Aggiorna

**Flusso manuale (se Xcode Cloud non è configurato):**
1. Apri il progetto in Xcode sul Mac
2. Cmd+Shift+K (clean build)
3. Seleziona "Any iOS Device (arm64)" come destinazione
4. Product → Archive
5. Organizer si apre automaticamente
6. Clicca "Distribute App"
7. Seleziona "TestFlight" → "Next" → "Upload"
8. Appare in TestFlight dopo ~5 minuti

---

## Risoluzione problemi comuni

### "Signing certificate not found"
1. Xcode → Preferences → Accounts
2. Seleziona il tuo account Apple Developer
3. Clicca "Manage Certificates..."
4. Clicca "+" → "Apple Distribution"

### "No profiles for bundle identifier"
1. Xcode → Project Settings → Signing & Capabilities
2. Seleziona "Automatically manage signing"
3. Seleziona il tuo Team

### "This app has crashed"
1. Apri Xcode con iPhone connesso
2. Window → Devices and Simulators
3. Seleziona iPhone → View Device Logs
4. Copia il crash log e comunicalo a Claude Code
