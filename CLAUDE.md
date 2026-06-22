# Charms — Project Context

**Charms** is a cozy casual **memory** game. A **Case** (5×5 grid of round **Settings**) fills with a handful
of small round enamel **Charms** (a strawberry, a bee, a heart…). The player **Glimpses** them briefly, the
charms softly **slip away** (a shimmer-fade — never a glow-bloom or hard pop), then the player must **Find**
them by tapping the charms they saw from a **Tray**, against a gentle clock, building combos with **lives** in
play. The web POC is playable; the eventual goal is a React Native mobile app on the Apple App Store.

The codebase was previously a tetromino puzzle game called **Vanishing Tiles** (earlier "Vanishing Shapes" /
"Phosphor" / codename "Gap City"). That gameplay has been removed. Those earlier names survive only in internal
identifiers — localStorage keys (`gapcity:*`), the Supabase `_shared` engine, and dated specs/plans. The visual
system is **Sherbet** (a warm, light, candy palette); runtime tokens are `vt-*`.

**Run the app:** `npm run dev` → http://localhost:5173
**Run tests:** `npm run test` (all must pass before any commit)
**Type check:** `npx tsc --noEmit` (or `npm run build`, which also catches `noUnusedLocals`)

> Local shell has an nvm quirk: run `npm` commands WITHOUT `&&` chaining — one command per invocation.

---

## Glossary (use consistently in code + copy)

| Term | Meaning |
|---|---|
| **Charm** | the round enamel piece (replaces "tile") |
| **Setting** | one round slot in the grid (replaces "cell") |
| **Case** | the board (5×5 = 25 Settings) |
| **Tray** | the row of candidate Charms during Find |
| **Bracelet** | the earned-charm meta-collection |
| **Glimpse** | the memorize phase |
| **Find** | the recall phase (keep this word plain) |
| **slip away** | the vanish |

---

## The Game

### The loop (one run)

A **run** is a sequence of escalating **rounds** that share **3 pooled lives** and an accumulating **score**.
Each round runs the same phase machine:

```
countdown → glimpse → find → resolved → (next round) countdown → …
                                  └─(lives 0 or find clock out)→ gameOver
```

Phases: `'idle' | 'countdown' | 'glimpse' | 'find' | 'resolved' | 'gameOver'`.

- **countdown** — `3 · 2 · 1 · Go` centered inside the empty Case; HUD inert (~850 ms/beat).
- **glimpse** — the round's target Charms arrive **one at a time** (staggered), each `settling` into its
  Setting with a draining **border-timer** on its rim; when a charm's timer empties it `slips away`. Find
  begins once the last charm has slipped. **No skip button** — pure memorize. (Per-charm timings reuse the old
  Phosphor reveal curve: `MOTION.glimpseStepMs` between arrivals, `MOTION.glimpseBloomMs` on screen each.)
- **find** — the Tray appears; the FindBar shows the combo meter + a teal→amber→coral clock. The player taps
  the Charms they remember.
- **resolved** — a brief (~1.1 s) all-✓ celebratory beat on the cleared Case, then the next, harder round's
  countdown.
- **gameOver** — the encouraging "Lovely run!" screen (never framed as a fail).

### Round mechanics (the memory test)

- The round places **N target Charms** — each a distinct **hue + motif** — into N random Settings.
- The **Tray** holds the N targets **+ D decoys** (hue+motif combos *not* shown this round), shuffled.
- Memory is **identity-based, not positional**. Tapping a Tray Charm that matches an **unfound** target (by
  hue+motif) flies it home to its Setting with a mint ✓ and **bumps the combo**; that Tray Charm becomes
  `spent`. Tapping a decoy (or any non-target) gives the soft coral shake + ✕, costs **−1 life**, **resets the
  combo**, and spends the Tray Charm.
- A **round clears** when all N targets are found → `resolved` → next round.
- The **run ends** (→ `gameOver`) when **lives reach 0** *or* the **Find clock expires** with targets unfound.

### Difficulty & escalation

The Home selector (`easy` / `medium` / `hard`) sets the starting point; each round nudges harder. The pure,
unit-tested curve `roundConfig(difficulty, roundIndex)` in `src/lib/charmsRound.ts` returns
`{ charmCount, decoyCount, glimpseMs, findMs }`. Invariants (asserted in tests): `charmCount` is monotonic and
capped at `MAX_CHARMS` (10); `charmCount + decoyCount ≤ MAX_TRAY` (12) and `≤ CASE_SETTINGS` (25);
`findMs > glimpseMs` always; harder difficulty never has fewer charms at the same round.

### Scoring

- **Per correct pick:** `pickScore(combo) = 100 × combo` (combo = current correct-streak length).
- **Round-clear speed bonus:** `speedBonus(remainingMs, findMs)` — up to 300 by fraction of the Find clock left.
- **Stars** (Game Over, out of 3): `starsForRounds(roundsCleared)` — 1★ ≥ 1, 2★ ≥ 3, 3★ ≥ 5.
- **Charms earned → Bracelet:** the distinct Charms found this run are added to a localStorage **braceletStore**
  at game over and rendered on Home.

---

## Architecture

### File map

```
src/
  store/
    charmsGameStore.ts  — Zustand 5 store: the phase machine + all run/round state (targets, tray, score,
                          lives, combo, glimpse/find timers, per-pick resolution, earned charms). Actions:
                          startRun / beginGlimpse / beginFind / pickTray / findTimeout / beginNextRound / exit.
    braceletStore.ts    — Zustand + localStorage earned-charm set (key: gapcity:bracelet:v1).
    navStore.ts         — AppView: 'auth' | 'home' | 'game'.
    settingsStore.ts    — persisted Charms difficulty (key: gapcity:settings:v1).
    asyncStatus.ts      — global async-loading tracker for the loading overlay.
  lib/
    charmsRound.ts      — pure roundConfig() curve + scoring helpers (pickScore / speedBonus / starsForRounds).
  components/
    charms/             — the Sherbet component library (see below). USE THESE; don't reinvent.
    charmsGame/         — the game screens, composed from the library:
      CharmsGame.tsx    — phase router (+ the Resolved interstitial) and the game FRAME.
      Countdown.tsx     — 3·2·1·Go inside the empty Case.
      Glimpse.tsx       — Charms settle, then slip away; drives beginFind on the glimpse timer.
      Find.tsx          — Case (found→✓ Settings) + Tray + FindBar clock; drives findTimeout.
      GameOver.tsx      — "Lovely run!" score / stars / earned charms / Play again / Home.
    HomeScreen.tsx      — Sherbet landing: difficulty switch + PLAY (startRun → goGame) + Bracelet card.
    AuthScreen.tsx      — email / Google / guest sign-in (Supabase). KEEP intact.
    GlobalMenu.tsx, GlobalLoadingOverlay.tsx — app chrome (menu suppressed on auth + game views).
    ui/                 — legacy neon UI primitives still used by AuthScreen (Wordmark, VanishingMotif, …).
```

### The Charms component library (`src/components/charms/`)

Real, themed, tested React primitives extracted from `mockups/sherbet/charms/`. Themed entirely from
`tokens.ts` (mirrors `mockups/sherbet/tokens.css`) for a future RN port.

- `tokens.ts` — `CHARM_HUES` (8 candy hues), `CHARM_HUE_NAMES`, `CHARM_MOTIFS`, `SHERBET` (grounds/ink/semantic),
  `SHADOW`, `MOTION`, `resolveHue()`, `timerColor()`.
- `Charm.tsx` — the round enamel disc; `state` = `idle | settling | slipping` drives the signature motion
  (springy settle-in, soft shimmer-fade slip-away — never a pop).
- `Setting.tsx` — the round slot; `state` = `empty | good | bad` with ✓ / ✕ badges.
- `Case.tsx` — the board grid (default 5 columns).
- `Tray.tsx` — `Tray` + interactive `TrayCharm` (picked / spent / miss).
- `HUD.tsx` — `HUD` + `Lives` + `FindBar` (combo meter + teal→amber→coral clock).
- `CharmButton.tsx` — candy pill CTA (`primary | secondary | play`).
- `ScorePanel.tsx` — end-of-run score + `Stars`.
- `index.ts` — barrel.
- `CharmsDemo.tsx` — a live gallery of all six screens, reachable at the **`#charms`** URL hash (guarded route
  in `src/App.tsx`). Additive; never touches game state. Mine it when building game screens.

### Design reference

- The six screens as HTML mockups: `mockups/sherbet/charms/{00-foundations,01-auth,02-home,03-countdown,04-glimpse,05-find,06-gameover}.html`.
- `mockups/sherbet/DESIGN-LANGUAGE.md` + `mockups/sherbet/tokens.css` — the full Sherbet design language.

### Supabase

`AuthScreen` + Supabase wiring stay intact (env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; `.env.local` is
gitignored). The Supabase `_shared` engine (`supabase/functions/_shared/…`, aliased `@shared`) and its tests
(`tests/engine`, `tests/core`) are **server-side** and were left in place — they are not part of the client
Charms game.

---

## Critical rules for agents

### Zustand 5 — always use `useShallow` for object selectors

```ts
// ✅ correct
import { useShallow } from 'zustand/shallow'
const { foo, bar } = useStore(useShallow(s => ({ foo: s.foo, bar: s.bar })))

// ✅ also fine (single value, no object)
const foo = useStore(s => s.foo)

// ❌ will cause an infinite render loop in Zustand 5
const { foo, bar } = useStore(s => ({ foo: s.foo, bar: s.bar }))
```

Zustand 5 uses `useSyncExternalStore`; inline object selectors return a new reference each render → React
infinite loop. `useShallow` memoizes by shallow equality.

### Theme

Sherbet only — `src/components/charms/tokens.ts` + the `vt-*` Tailwind tokens. No neon/dark styling in game UI
(the legacy `ui/` neon primitives remain only for `AuthScreen`). Light, warm, candy.

### Motion

Honor `prefers-reduced-motion` — the `charm-*` animation classes in `src/index.css` already gate on it; keep
new motion consistent.

### Tests

All tests must pass before committing (`npm run test`). Add coverage for new store/loop logic. Don't skip or
weaken tests to make them pass unless the spec genuinely changed.

---

## Design decisions (agreed upon)

- **Case:** 5×5 round Settings.
- **Memory model:** identity-based (remember hue+motif), not positional. Tap matching Tray Charm → it flies home.
- **Run:** escalating rounds, 3 pooled lives, accumulating score; ends on lives 0 or Find clock-out.
- **Scoring:** reward speed + precision — `100 × combo` per pick, up to +300 round-clear speed bonus.
- **Tone:** cozy and encouraging — Game Over is "Lovely run!", never a fail screen.

---

## Deferred (post-POC)

- Drag-and-drop / richer Find interactions
- React Native port → Apple App Store
- Sound effects
- Server-backed Bracelet + leaderboards
- Accessibility (ARIA, keyboard nav)
- Difficulty-curve tuning

---

## Docs

- **Gameplay design spec:** `docs/superpowers/specs/2026-06-21-charms-gameplay-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-06-21-charms-gameplay.md`
