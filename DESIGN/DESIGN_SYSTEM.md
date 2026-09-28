# Design System — Fitness Tracker iOS

## Principi del design

1. **Hierarchy** — Ogni schermata ha un solo elemento dominante
2. **Density controllata** — Spazio bianco generoso, elementi ben distanziati
3. **Numerosità** — Durante il workout, i numeri devono essere grandissimi
4. **Coerenza** — Lo stesso pattern visivo in tutta l'app
5. **Dark-first** — Progettato per dark mode, poi adattato per light

---

## Colori

> DECISIONE APERTA: Il colore accent è ancora da decidere (vedi DECISIONS.md OPEN-004).
> I valori qui sotto sono proposte — da confermare prima dell'implementazione sistematica.

### Semantic tokens (da implementare in Swift come `Color` extensions)

```swift
// Background
Color.appBackground        // #0C0C0E — sfondo principale (quasi nero con tinta blu)
Color.appSurface1          // #1C1C1E — card, sheet, elementi elevated
Color.appSurface2          // #2C2C2E — elementi nested, separatori

// Text
Color.appTextPrimary       // #FFFFFF — testo principale
Color.appTextSecondary     // #8E8E93 — testo secondario, etichette
Color.appTextTertiary      // #48484A — testo terziario, hint

// Accent
Color.appAccent            // DA DECIDERE — vedi OPEN-004
// Proposta A (iOS Blue):    #0A84FF
// Proposta B (Indigo):      #5E5CE6

// Semantic
Color.appSuccess           // #30D158 — serie completata, workout completato
Color.appWarning           // #FF9F0A — avvisi, recupero in scadenza
Color.appDestructive       // #FF453A — eliminazione, attenzione
Color.appInactive          // #636366 — elementi non attivi, placeholder
```

### Usage rules
- Non usare colori raw in SwiftUI — sempre tramite semantic token
- Il colore accent va usato con parsimonia (call-to-action primari, progress)
- L'interazione con gli elementi deve seguire il sistema iOS (opacity reduction)

---

## Tipografia

Sistema basato su SF Pro (font di sistema iOS).

```swift
// Scale tipografica
Typography.displayLarge    // 56pt, Bold — numero serie/peso durante workout
Typography.displayMedium   // 40pt, Bold — numero principale nelle card
Typography.titleLarge      // 28pt, Semibold — titoli schermata
Typography.titleMedium     // 22pt, Semibold — titoli sezione
Typography.titleSmall      // 17pt, Semibold — titoli elemento
Typography.bodyLarge       // 17pt, Regular — testo corpo principale
Typography.bodyMedium      // 15pt, Regular — testo secondario
Typography.bodySmall       // 13pt, Regular — annotazioni, timestamp
Typography.caption         // 11pt, Regular — etichette piccole
Typography.mono            // 17pt, Monospaced — timer, numeri che cambiano
```

### Usage rules
- I numeri di peso e reps durante il workout usano `displayLarge` o `displayMedium`
- Il timer usa `Typography.mono` per evitare il layout shift dei numeri
- Evitare testi sotto `bodySmall` salvo etichette molto secondarie
- Non usare Bold per testo corpo (solo titoli e numeri)

---

## Spacing

Sistema modulare basato su multipli di 4pt.

```swift
Spacing.xs   = 4
Spacing.sm   = 8
Spacing.md   = 16
Spacing.lg   = 24
Spacing.xl   = 32
Spacing.xxl  = 48
```

### Regole
- Padding interno card: `Spacing.md` (16)
- Separazione tra sezioni: `Spacing.xl` (32)
- Margini laterali: `Spacing.md` (16)
- Gap tra elementi in lista: `Spacing.sm` (8)

---

## Corner radius

```swift
CornerRadius.sm  = 8   // badge, elementi piccoli
CornerRadius.md  = 12  // card standard
CornerRadius.lg  = 16  // sheet, modal
CornerRadius.xl  = 20  // card grande
```

---

## Icone

- Sistema: **SF Symbols** (nativo Apple, coerente con iOS)
- Stile: `fill` per elementi attivi/selezionati, `regular` per inattivi
- Dimensioni: seguire le raccomandazioni SF Symbols

Icone principali:
| Uso | SF Symbol |
|---|---|
| Workout attivo | `dumbbell.fill` |
| Storico | `clock.fill` |
| Progressi | `chart.line.uptrend.xyaxis` |
| Impostazioni | `gear` |
| Timer | `timer` |
| Aggiungi serie | `plus.circle.fill` |
| Completa serie | `checkmark.circle.fill` |
| Skip timer | `forward.end.fill` |
| Esercizio | `figure.strengthtraining.traditional` |

---

## Animazioni

```swift
Animation.quick      = .easeOut(duration: 0.15)   // feedback tap
Animation.standard   = .easeOut(duration: 0.25)   // transizioni UI
Animation.spring     = .spring(response: 0.35, dampingFraction: 0.75)  // modali
```

### Regole
- Nessuna animazione decorativa — solo se comunica stato o guida l'occhio
- Le animazioni del timer e dei numeri devono essere minime
- Evitare animazioni > 0.4s

---

## Componenti base (da implementare in Milestone 1)

### WorkoutButton (pulsante primario call-to-action)
- Background: `appAccent`
- Text: `appTextPrimary`, `titleSmall`
- Corner radius: `CornerRadius.md`
- Padding: `Spacing.md` verticale, `Spacing.lg` orizzontale
- Feedback: opacity reduction on press

### SetCompletionButton (completa serie)
- Grande (min 60pt height)
- Stato pending: bordo `appAccent`, sfondo trasparente
- Stato completata: sfondo `appSuccess`, checkmark

### ExerciseCard
- Background: `appSurface1`
- Corner radius: `CornerRadius.md`
- Padding: `Spacing.md`
- Nome esercizio: `titleSmall`
- Muscolo: `bodySmall`, `appTextSecondary`

### TimerDisplay
- Font: `Typography.mono`, `displayLarge`
- Colore: `appTextPrimary` → `appWarning` (ultimi 10 secondi)
- Nessun arco/cerchio decorativo (minimal)
