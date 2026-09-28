# Bodyweight Database — Fitness Tracker iOS

Esercizi a corpo libero. Questi hanno terminologia standard italiana e informazioni facilmente verificabili.

---

## Schema di riferimento

Stessa struttura di `DATABASE/EXERCISE_SCHEMA.md`.
Per esercizi a corpo libero: `brand: "corpo libero"`, `equipmentType: "Corpo libero"`, `loadSystem: "Peso corporeo"`

---

## Database corpo libero (da implementare)

### Petto

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Piegamenti sulle braccia | Push-up | Petto | Varianti: stretti, larghi, declinati |
| Piegamenti declinati | Decline Push-up | Petto alto | Piedi su superficie elevata |
| Piegamenti inclinati | Incline Push-up | Petto basso | Mani su superficie elevata |
| Dip alle parallele | Dip | Petto / Tricipiti | Busto inclinato in avanti per petto |

### Schiena / Dorsali

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Trazioni | Pull-up | Dorsali | Presa prona, larghezza spalle |
| Trazioni strette | Chin-up | Bicipiti / Dorsali | Presa supina |
| Trazioni a una mano (assistite) | Archer Pull-up | Dorsali | Avanzato |
| Rematore con tavolo | Australian Row | Dorsali | Con sbarra bassa o tavolo |
| Iperestensioni | Hyperextension | Lombari | A corpo libero (senza macchina) |
| Superman | Superman | Lombari | Posizione prona |

### Spalle

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Pike Push-up | Pike Push-up | Spalle | Posizione "V" rovesciata |
| Verticale | Handstand Hold | Spalle | Isometrico |
| Piegamenti in verticale | Handstand Push-up | Spalle | Avanzato |

### Bicipiti

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Trazioni supine | Chin-up | Bicipiti | Presa supina |
| Curl con tovaglia/elastico | Towel Curl | Bicipiti | Con elastico o tovaglia |

### Tricipiti

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Dip alle parallele | Dip | Tricipiti | Busto dritto per tricipiti |
| Dip alla sedia | Bench Dip | Tricipiti | Mani su sedia, piedi in avanti |
| Piegamenti a diamante | Diamond Push-up | Tricipiti | Mani a diamante |

### Gambe

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Squat | Squat | Quadricipiti | Classico a corpo libero |
| Squat bulgaro | Bulgarian Split Squat | Quadricipiti | Piede posteriore su appoggio |
| Affondi | Lunge | Quadricipiti | Avanti, indietro, laterali |
| Affondi camminati | Walking Lunge | Quadricipiti | In movimento |
| Pistol Squat | Pistol Squat | Quadricipiti | Monopodalico, avanzato |
| Leg Curl a terra | Lying Leg Curl | Femorali | Con elastico o assistito |
| Nordic Curl | Nordic Curl | Femorali | Avanzato |
| Iperestensioni monopodaliche | Single-leg Hip Hinge | Femorali | Bilancio |

### Glutei

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Ponte dei glutei | Glute Bridge | Glutei | A terra |
| Hip Thrust a corpo libero | Bodyweight Hip Thrust | Glutei | Spalle su panchina |
| Kickback a terra | Donkey Kick | Glutei | In quadrupedia |
| Glutei quadrupedia (fuoco) | Fire Hydrant | Glutei medi | In quadrupedia |

### Polpacci

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Alzate sui polpacci | Calf Raise | Polpacci | In piedi, a corpo libero |
| Alzate sui polpacci monopodaliche | Single-leg Calf Raise | Polpacci | Più difficile |

### Addome / Core

| Nome IT | Nome EN | Muscolo primario | Note |
|---|---|---|---|
| Crunch | Crunch | Addome | Classico |
| Sit-up | Sit-up | Addome | Movimento completo |
| Leg raise | Leg Raise | Addome basso | A terra o alla sbarra |
| Plank | Plank | Core | Isometrico |
| Plank laterale | Side Plank | Core laterale | Isometrico |
| Mountain climber | Mountain Climber | Core | Dinamico |
| Russian twist | Russian Twist | Obliqui | Con o senza peso |
| Hollow body | Hollow Body Hold | Core | Ginnastica |
| Ab wheel | Ab Wheel Rollout | Core | Con ruota addominale |

---

## Note per l'implementazione

- I nomi italiani sono prioritari nel campo `displayName`
- Il nome inglese può essere salvato in `officialName` o come variante
- Gli esercizi a corpo libero non hanno `productCode` o `productLine`
- `isVerified: true` di default per esercizi standard ben documentati
