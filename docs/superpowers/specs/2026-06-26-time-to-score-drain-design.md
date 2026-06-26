# Time → Score "Lift" drain — design

**Date:** 2026-06-26
**Status:** Approved

## Two changes in this work

1. **Rename the "Combo" mechanic to "Streak"** across code, copy, and tests. (Mechanical — no design
   decisions; done as a straight refactor.)
2. **Translate remaining Find-clock time into points with a visible "Lift" payout** when a round clears.
   (The feature this spec describes.)

---

## Goal

When the player finds the last target and clears a round, the Find clock still has time on it. That time
already pays out as a speed bonus (`speedBonus`, up to +300). Today that bonus is added to the score
*instantly and invisibly* — the Find screen unmounts, the timer bar vanishes, and the new total just appears.

We want the player to **see** remaining time become points: drain the timer bar and raise the score
**simultaneously and visually linked**, so the cause→effect ("my leftover time turned into these points")
registers.

## Chosen feel — "Lift"

One eased timeline drives everything in lockstep (cubic ease-out `e = 1 - (1-t)³`, ~1.1s):

- The timer bar fill drains `clearFraction → 0`, recoloring teal → amber → coral as it empties (the existing
  `timerColor()` semantics, so it matches the live Find clock).
- A single big **`+N`** headline (the speed bonus) lifts off the bar, drifting up toward the score while
  fading and shrinking (opacity `1 → 0`, scale `1 → ~0.65`).
- The HUD score rolls `base → base + bonus` coupled to the same `e`.
- When the roll completes, the score gives a brief success-green **bump** (scale ~1.14).

### Choreography — "drain first, then cheer"

```
t0.0        last charm flies home; Case full; drain row visible (no "Round cleared!" yet)
t0.0–1.1s   bar drains ▾ + "+N" lifts toward score + score rolls up — all locked to one eased t
t~1.1s      drain row fades out
t1.2–1.8s   "Round cleared! ✦" glows in on the now-quiet Case
t~1.8s      → beginNextRound (next round countdown)
```

The `resolved` timeout extends from the current 1100ms to ~1800ms to fit the drain + cheer.

## Architecture

### Store — `src/store/charmsGameStore.ts`

The store stays **authoritative**: the bonus is still added to `score` the instant the round clears, so the
final total is correct even if a component unmounts mid-animation. Two new fields exist purely so the
`resolved` beat can *replay* the payout presentationally:

- `lastSpeedBonus: number` — the speed bonus awarded on this clear (the headline `+N`).
- `clearFraction: number` — the Find-clock fraction remaining at the moment of clear (the bar's start fill),
  i.e. `clamp(remaining / findMs, 0, 1)`.

Both are reset to `0` on `beginNextRound` and `startRun` (via the shared `IDLE` snapshot). The `pickTray`
clear branch sets them; the existing score math is unchanged.

`base` for the count-up is derived in the component as `score - lastSpeedBonus`.

### Presentational component — `BonusDrain` in `src/components/charms/HUD.tsx`

A dumb sibling to `FindBar`, mirroring its styling (Streak pill + meter + conic dot). Props:

- `fill: number` — meter fill 0–1 for the current frame.
- `bonus: number` — the headline value, rendered as the lifting `+N` tag.
- `lift: number` — the eased progress `e` (0–1) used to position/fade/scale the lift tag.

`BonusDrain` renders only the current frame; it owns **no** timing. The rAF timeline lives in `Resolved`.
The lift tag travels a fixed up-and-toward-the-score path (the HUD score is top-left in the real layout) so
`BonusDrain` and `HUD` stay decoupled — no cross-component ref measurement.

### The beat — `Resolved` in `src/components/charmsGame/CharmsGame.tsx`

Owns the rAF timeline and the two sub-phases (drain, then cheer). Drives `fill`, `lift`, the rolling score
value, and the bump, then swaps the drain row for "Round cleared! ✦", then calls `beginNextRound`.

`Resolved` passes the **animated** score value into the existing `HUD` `score` prop — no `HUD` change needed.

### Reduced motion

If `prefers-reduced-motion: reduce`, skip the rAF entirely: snap the score to final, the bar to empty, render
no lift tag, and show "Round cleared! ✦" on a shortened beat. Honors the existing motion policy.

## Testing

- **Store (`tests/store/charmsGameStore.test.ts`):** on clear, `lastSpeedBonus === speedBonus(remaining, findMs)`
  and `clearFraction ≈ remaining / findMs`, and `score` includes the bonus; `beginNextRound` resets both to `0`.
- **`BonusDrain` (new component test):** renders the `+N` headline and the meter at the given `fill` width.

The rAF choreography itself is presentational and not unit-tested; the store contract and the dumb component's
render are what we lock down.

## Out of scope

- Sound effects on the payout (deferred, like all SFX).
- Changing the `speedBonus` math or its cap.
- Any change to the per-pick scoring or the Streak meter behavior during Find.
