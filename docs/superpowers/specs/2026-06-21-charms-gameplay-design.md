# Charms — Gameplay Design

**Status:** approved · **Date:** 2026-06-21

Charms is a cozy casual **memory** game. A **Case** (5×5 grid of round **Settings**)
fills with a handful of small round enamel **Charms** (a strawberry, a bee, a heart…).
The player **Glimpses** them briefly, the charms softly **slip away** (shimmer-fade —
not a glow-bloom, not a hard pop), then the player must **Find** them by tapping the
charms they saw from a **Tray**, against a gentle clock, building combos with **lives**
in play.

This spec replaces the legacy **Vanishing Tiles / Infinite Stagger** tetromino gameplay,
which is removed wholesale.

## Glossary (use consistently in code + copy)

| Term | Meaning | Replaces |
|---|---|---|
| **Charm** | the round enamel piece | "tile" |
| **Setting** | one round slot in the grid | "cell" |
| **Case** | the board (5×5 = 25 Settings) | "grid" |
| **Tray** | candidate row during Find | "piece menu" |
| **Bracelet** | earned-charm meta-collection | — |
| **Glimpse** | the memorize phase | "viewing" |
| **Find** | the recall phase (keep this word plain) | "selecting" |
| **slip away** | the vanish | — |

## The loop (one run)

A **run** is a sequence of escalating **rounds** that share **3 pooled lives** and an
accumulating **score**. Each round runs the same phase machine:

```
countdown → glimpse → find → resolved → (next round) countdown → …
                                  └─(lives 0 or find clock out)→ gameOver
```

- **countdown** — `3 · 2 · 1 · Go` centered inside the empty Case border; HUD inert.
  ~850 ms/beat, then `glimpse`.
- **glimpse** — the round's target Charms `settling` into their Settings; a fixed Glimpse
  timer drains; on expiry the Charms `slip away` and the phase advances to `find`. There is
  **no skip button** — Glimpse is pure, fixed-duration memorize (matches mockup 04).
- **find** — the Tray of candidates appears; the FindBar shows the combo meter + a
  teal→amber→coral clock. The player taps the Charms they remember.
- **resolved** — a brief (~900 ms) all-✓ celebratory beat on the cleared Case, then the
  next, harder round's `countdown`.
- **gameOver** — terminal "Lovely run!" screen.

Phases enum: `'countdown' | 'glimpse' | 'find' | 'resolved' | 'gameOver'`.

## Round mechanics (the memory test)

- The round places **N target Charms** — each a distinct **hue + motif** — into N random
  distinct Settings on the 5×5 Case.
- The **Tray** holds the N targets **+ D decoys** (hue+motif combos *not* shown this round),
  shuffled into a single row/grid.
- Memory is **identity-based, not positional**. Tapping a Tray Charm that matches an
  **unfound** target (by hue+motif) flies it home to its Setting with a mint ✓ and **bumps
  the combo**; that Tray Charm becomes `spent` (disabled). Tapping a decoy — or any Charm not
  among the remaining targets — triggers the soft coral shake + ✕, costs **−1 life**, and
  **resets the combo** to 0.
- A **round clears** when all N targets are found (perfect) → `resolved` → next round.
- The **run ends** (→ `gameOver`) when **lives reach 0** *or* the **Find clock expires** with
  targets still unfound. Game Over is always framed encouragingly ("Lovely run!") — never a
  fail screen.

## Difficulty & escalation

The Home selector (`easy` / `medium` / `hard`) sets the starting point; each round nudges
harder. A pure, unit-tested curve `roundConfig(difficulty, roundIndex)` returns
`{ charmCount, decoyCount, glimpseMs, findMs }`:

| knob | behavior |
|---|---|
| `charmCount` | starts 3 / 4 / 5 (easy/med/hard); +1 roughly every 2 rounds; capped at 10 so the Case stays meaningfully empty. |
| `decoyCount` | grows with `charmCount`; total Tray size capped at ~12. |
| `glimpseMs` | ~1.2 s per charm budget; eases down slightly with difficulty and round. |
| `findMs` | always comfortably longer than `glimpseMs`; eases down with round. |

Constraints the curve must satisfy (asserted in tests):
- `charmCount` is monotonic non-decreasing in `roundIndex` and capped.
- `charmCount + decoyCount ≤ 25` (fits the Case) and `≤ ~12` (fits the Tray).
- `findMs > glimpseMs` for every round.
- harder difficulty ⇒ `charmCount` ≥ easier difficulty at the same round.

## Scoring

- **Per correct pick:** `100 × combo`, where combo is the current correct-streak length
  (1, 2, 3 …). Mirrors the proven Stagger reward-precision-under-streak model.
- **Round-clear speed bonus:** `round(300 × findTimeRemaining / findDuration)` added when the
  round clears.
- **Stars** (Game Over ScorePanel shows up to 3), tiered by **rounds cleared**:
  1★ ≥ 1, 2★ ≥ 3, 3★ ≥ 5.
- **Charms earned → Bracelet:** the distinct Charms found this run are shown on Game Over and
  added to a lightweight localStorage **braceletStore**; Home renders the collected Bracelet
  (mockup 02). Minimal scope — a `Set` of `hue:motif` keys.

## Architecture / file plan

**New**
- `src/store/charmsGameStore.ts` — Zustand 5 phase machine + all run/round state
  (phase, roundIndex, targets, tray, score, lives, combo, glimpse/find timers, per-pick
  resolution, earned charms). Object selectors use `useShallow`.
- `src/lib/charmsRound.ts` — pure `roundConfig()` curve + scoring helpers
  (`pickScore`, `speedBonus`, `starsForRounds`). Heavily unit-tested.
- `src/store/braceletStore.ts` — localStorage earned-charms set (minimal).
- `src/components/charmsGame/CharmsGame.tsx` — phase router.
- `src/components/charmsGame/{Countdown,Glimpse,Find,GameOver}.tsx` — screens composed from
  the existing `src/components/charms/` library.

**Rewire**
- `src/store/navStore.ts` — `AppView` `'stagger'` → `'game'`.
- `src/App.tsx` — route `game` → `CharmsGame`; **keep** the `#charms` demo route and
  `AuthScreen`.
- `src/components/HomeScreen.tsx` — rebuild to the Sherbet mockup-02 look; real PLAY starts a
  Charms run at the selected difficulty.
- `src/store/settingsStore.ts` — re-document difficulty for Charms (keep the storage key and
  the `'easy' | 'medium' | 'hard'` type).

**Remove** (after confirming no remaining consumer)
- `src/store/staggerStore.ts`, `src/components/StaggerScreen.tsx`, `src/lib/staggerCurve.ts`.
- `src/store/runHistoryStore.ts`, `src/lib/runHistory.ts`, `src/components/RunHistoryGraph.tsx`.
- Orphaned engine: `src/engine/pieces.ts`, `puzzleGenerator.ts`, `solver.ts` (and any
  `@shared` tetromino-only modules) once Stagger is gone.
- Legacy UI bits (`Wordmark`, `VanishingMotif`) only if no surviving consumer (e.g. AuthScreen)
  — verified before deletion.
- All corresponding tests under `tests/` for removed modules.

**Docs**
- Rewrite the gameplay sections of `CLAUDE.md` to describe the Charms memory loop.

## Testing

- `charmsRound`: curve monotonicity, caps (`≤25`, Tray `≤~12`), `findMs > glimpseMs`,
  difficulty ordering; scoring (combo math, speed bonus, star tiers).
- `charmsGameStore`: target pick → ✓ + combo bump; decoy pick → −1 life + combo reset;
  round clear → escalate to next round; lives 0 → gameOver; find clock-out → gameOver;
  earned-charms accumulation. Timers / `Date.now` mocked.
- Delete orphaned legacy tests; keep the suite green and add coverage for the new modules.

## Guardrails

- Zustand 5 object selectors **must** use `useShallow`.
- Theme: Tailwind `vt-*` tokens + `src/components/charms/tokens.ts` Sherbet values. No
  neon/dark styling — light, warm, candy.
- Honor `prefers-reduced-motion` (library + `index.css` already do).
- Keep `AuthScreen` + Supabase wiring intact; don't commit secrets.
- `npm run build`, `npm run test`, `npm run lint` all green; verify a full round in-browser.
