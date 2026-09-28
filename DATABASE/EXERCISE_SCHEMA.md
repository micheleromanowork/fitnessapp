# Exercise Schema — Fitness Tracker iOS

Schema dati per ogni esercizio nel database. Questo schema è la versione canonica — qualsiasi aggiunta futura deve essere documentata qui.

---

## Schema completo (JSON)

```json
{
  "id": "uuid-v4",
  "brand": "Panatta | corpo libero | generico",
  "productLine": "Fit Evo | Full | Special | null",
  "productCode": "1FE165 | null",
  "officialName": "Nome ufficiale del produttore",
  "displayName": "Nome visualizzato nell'app (italiano)",
  "primaryMuscle": "Petto",
  "secondaryMuscles": ["Spalle", "Tricipiti"],
  "bodyZone": "Parte superiore",
  "movementType": "Spinta",
  "equipmentType": "Macchina Panatta",
  "loadSystem": "Pesi a selettore",
  "description": "Descrizione breve dell'esercizio",
  "setup": "Come regolare la macchina per questo esercizio",
  "execution": "Come eseguire il movimento correttamente",
  "commonMistakes": "Errori tipici da evitare",
  "safetyNotes": "Note di sicurezza specifiche",
  "variants": ["variante1", "variante2"],
  "defaultRestDuration": 90,
  "illustrationName": "nome_file_illustrazione",
  "source": "URL o riferimento alla fonte ufficiale",
  "isVerified": true
}
```

---

## Campi obbligatori

| Campo | Tipo | Note |
|---|---|---|
| `id` | UUID | Generato automaticamente |
| `displayName` | String | Nome che appare nell'app |
| `primaryMuscle` | MuscleGroup | Muscolo principale |
| `equipmentType` | EquipmentType | Tipo attrezzatura |

## Campi raccomandati

| Campo | Tipo | Note |
|---|---|---|
| `brand` | String | "Panatta", "corpo libero", etc. |
| `secondaryMuscles` | [MuscleGroup] | Array vuoto se nessuno |
| `bodyZone` | BodyZone | |
| `movementType` | MovementType | |
| `description` | String | Max 200 caratteri |
| `defaultRestDuration` | Int | Secondi, default 90 |

## Campi opzionali (Panatta specifici)

| Campo | Tipo | Note |
|---|---|---|
| `officialName` | String? | Nome ufficiale Panatta |
| `productLine` | String? | Linea prodotto |
| `productCode` | String? | Codice prodotto (es: "1FE165") |
| `setup` | String? | Regolazione macchina |
| `execution` | String? | Esecuzione dettagliata |
| `commonMistakes` | String? | Errori comuni |
| `safetyNotes` | String? | Note sicurezza |
| `source` | String? | URL fonte |
| `isVerified` | Bool | Default false |

---

## Valori ammessi per campi enum

### MuscleGroup
`Petto`, `Schiena`, `Spalle`, `Bicipiti`, `Tricipiti`, `Gambe`, `Quadricipiti`, `Femorali`, `Glutei`, `Polpacci`, `Addome`, `Core`, `Avambracci`, `Trapezi`, `Full Body`

### BodyZone
`Parte superiore`, `Parte inferiore`, `Core`, `Full body`

### MovementType
`Spinta`, `Trazione`, `Squat`, `Cerniera`, `Trasporto`, `Isolamento`, `Multiarticolare`

### EquipmentType
`Macchina Panatta`, `Macchina`, `Bilanciere`, `Manubrio`, `Cavo`, `Smith Machine`, `Corpo libero`, `Kettlebell`, `Elastici`, `Altro`

### LoadSystem
`Pesi a selettore`, `Piastre`, `Peso corporeo`, `Cavo`, `Idraulico`

---

## Regole per l'aggiunta di nuovi esercizi

1. **Non inventare** informazioni su macchine Panatta — usare solo dati verificabili dal catalogo ufficiale
2. **Una macchina, più esercizi** — se una macchina permette più movimenti, creare un record per ogni movimento (NON duplicare la macchina come se fossero macchine diverse)
3. **displayName in italiano** — sempre, anche per prodotti stranieri
4. **isVerified: false** di default — marcare `true` solo dopo verifica sulla fonte ufficiale
5. **source obbligatorio** per esercizi Panatta — inserire URL catalogo o codice prodotto verificato
