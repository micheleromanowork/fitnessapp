# Panatta Database — Fitness Tracker iOS

## Panoramica Panatta

Panatta è un produttore italiano di attrezzature per palestre fondato nel 1977.
Sede: Apiro (MC), Italia.
Sito ufficiale: [panatta.it](https://www.panatta.it)

Il catalogo Panatta è organizzato in **linee** (product lines), ognuna con caratteristiche estetiche e tecniche diverse.

---

## Linee principali Panatta

| Linea | Descrizione | Note |
|---|---|---|
| **Fit Evo** | Linea entry-level / fitness | La più comune nelle palestre italiane |
| **Full** | Linea professionale | Design premium, target centri wellness |
| **Special** | Linea performance | Atleti, centri specializzati |
| **IP** | Indoor Performance | Cardio e funzionale |
| **Technogym compatible** | Macchine compatibili | Piastre standard |

---

## Formato ID per esercizi Panatta

Gli ID degli esercizi Panatta seguono questo formato:
`panatta-[codice_prodotto]-[variante]`

Esempio: `panatta-1FE165-chest-press`

---

## Database Panatta — Milestone 6

Il database Panatta verrà costruito progressivamente partendo dalle macchine più comuni.

### Come verificare le informazioni

**Passo 1:** Vai su panatta.it → Products
**Passo 2:** Seleziona la linea (es: Fit Evo)
**Passo 3:** Trova la macchina specifica
**Passo 4:** Prendi nota di:
- Nome ufficiale (in italiano se disponibile)
- Codice prodotto (es: 1FE165)
- Muscoli dichiarati dal produttore
- Foto/illustrazione

**IMPORTANTE:** Non inserire dati che non è possibile verificare direttamente sul sito Panatta.

---

## Placeholder per macchine da inserire

Le seguenti sono macchine Panatta tipicamente presenti nelle palestre italiane.
**NOTA: i dati sotto sono placeholder — devono essere verificati sul sito Panatta prima dell'inserimento nel database.**

### Da verificare e inserire (Milestone 6)

#### Petto
- Chest Press (linea Fit Evo / Full)
- Pec Deck / Pectoral Machine
- Cable Crossover
- Decline Chest Press
- Incline Chest Press
- Seated Chest Press

#### Schiena
- Lat Machine / Lat Pulldown
- Low Row / Seated Row
- Rowing Machine
- Vertical Traction
- Back Extension

#### Spalle
- Shoulder Press
- Lateral Raise Machine
- Rear Deltoid Machine

#### Braccia
- Preacher Curl / Scott Machine
- Bicep Curl Machine
- Tricep Extension Machine
- Tricep Dip Machine

#### Gambe
- Leg Press (45° o verticale)
- Leg Extension
- Leg Curl (lying o seated)
- Leg Abductor
- Leg Adductor
- Hip Thrust Machine
- Calf Raise Machine
- Smith Machine (per squat, etc.)

#### Core/Addome
- Ab Crunch Machine
- Rotary Torso

---

## Note per l'agente AI che continua il progetto

Quando si aggiungono macchine Panatta al database:

1. **Verificare sempre** sul sito ufficiale panatta.it prima di inserire
2. **Non inventare** codici prodotto — se non trovato, lasciare null
3. **Una voce per esercizio**, non per macchina: se la Leg Press permette leg press e leg extension, creare due record separati
4. **Specificare la linea** (Fit Evo, Full, Special, etc.)
5. **Annotare la fonte** (URL della pagina prodotto)
6. **Marcare isVerified: true** solo dopo verifica diretta
7. **Non usare** descrizioni da altri siti come se fossero di Panatta

Il file JSON degli esercizi verificati si trova in:
`FitnessTracker/FitnessTracker/Resources/ExerciseDatabase/panatta_fit_evo.json`
(da creare quando si inizia il database Panatta)
