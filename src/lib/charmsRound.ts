/**
 * Charms — pure round-shape and scoring math. No state, no Date, no DOM, so it
 * is trivially unit-testable and safe for a future React Native port.
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface RoundConfig {
  /** Number of target Charms placed on the Case this round. */
  charmCount: number
  /** Extra Tray candidates that were never shown (wrong picks). */
  decoyCount: number
  /** Glimpse (memorize) duration in ms. */
  glimpseMs: number
  /** Find (recall) duration in ms — always longer than glimpseMs. */
  findMs: number
}

/** Case is a 5x5 grid. */
export const CASE_SETTINGS = 25
/** Hard cap on target Charms so the Case stays meaningfully empty. */
export const MAX_CHARMS = 10
/** Hard cap on Tray candidates (targets + decoys) so the row stays tappable. */
export const MAX_TRAY = 12

const START_CHARMS: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 }
const START_DECOYS: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 3 }
/** Per-charm memorize budget (ms) — gentler on easy, tighter on hard. */
const MS_PER_CHARM: Record<Difficulty, number> = { easy: 1300, medium: 1150, hard: 1000 }

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export function roundConfig(difficulty: Difficulty, roundIndex: number): RoundConfig {
  // Charms grow ~1 every 2 rounds, capped.
  const charmCount = Math.min(MAX_CHARMS, START_CHARMS[difficulty] + Math.floor(roundIndex / 2))

  // Decoys grow ~1 every 3 rounds, but never push the Tray past MAX_TRAY.
  const decoyCount = clamp(
    START_DECOYS[difficulty] + Math.floor(roundIndex / 3),
    1,
    Math.min(MAX_TRAY - charmCount, CASE_SETTINGS - charmCount),
  )

  // Glimpse: per-charm budget, eased down slightly each round; floored so it is
  // never a flash. Find: always comfortably longer than glimpse.
  const glimpseMs = Math.max(2500, Math.round(charmCount * MS_PER_CHARM[difficulty] - roundIndex * 80))
  const findMs = glimpseMs + Math.max(4000, (charmCount + decoyCount) * 1000 - roundIndex * 100)

  return { charmCount, decoyCount, glimpseMs, findMs }
}

/** Points for one correct pick at the given combo (streak length, >= 1). */
export function pickScore(combo: number): number {
  return 100 * Math.max(1, combo)
}

/** Round-clear speed bonus: up to 300, by fraction of the Find clock left. */
export function speedBonus(remainingMs: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.round(300 * clamp(remainingMs / durationMs, 0, 1))
}

/** End-of-run stars (out of 3), tiered by rounds cleared. */
export function starsForRounds(roundsCleared: number): number {
  if (roundsCleared >= 5) return 3
  if (roundsCleared >= 3) return 2
  if (roundsCleared >= 1) return 1
  return 0
}
