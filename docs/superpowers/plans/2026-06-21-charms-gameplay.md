# Charms Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Vanishing Tiles / Infinite Stagger tetromino game with the Charms cozy memory loop (countdown → glimpse → find → resolved, escalating rounds, pooled lives), wired to Home.

**Architecture:** A Zustand 5 store (`charmsGameStore`) drives a phase machine over escalating rounds. Pure round/scoring math lives in `src/lib/charmsRound.ts`. Four screens compose the existing `src/components/charms/` library. A minimal `braceletStore` persists earned charms. The legacy client Stagger surface is removed; the Supabase `_shared` engine and its tests are left intact.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind (`vt-*` tokens), Framer Motion, Zustand 5, Vitest + Testing Library.

## Global Constraints

- Zustand 5 object selectors MUST use `useShallow` (`import { useShallow } from 'zustand/shallow'`); single-value selectors are fine without it.
- Theme: Sherbet only (`src/components/charms/tokens.ts` + `vt-*` Tailwind). No neon/dark styling in new game UI.
- Honor `prefers-reduced-motion` (the `charm-*` CSS classes in `src/index.css` already do).
- Keep `AuthScreen` + Supabase wiring intact. `AuthScreen` still imports `Wordmark` + `VanishingMotif` — do NOT delete those.
- Keep the `#charms` demo route (`CharmsDemo`) intact.
- Run `npm` commands WITHOUT `&&` chaining (nvm quirk): one command per invocation.
- Glossary in code + copy: Charm / Setting / Case / Tray / Bracelet / Glimpse / Find / "slip away".
- All green before done: `npm run build`, `npm run test`, `npm run lint`.
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## File Structure

**Create**
- `src/lib/charmsRound.ts` — pure types + `roundConfig()` + scoring helpers.
- `src/store/charmsGameStore.ts` — phase machine + run/round state.
- `src/store/braceletStore.ts` — localStorage earned-charms set.
- `src/components/charmsGame/CharmsGame.tsx` — phase router + timer effects.
- `src/components/charmsGame/Countdown.tsx`
- `src/components/charmsGame/Glimpse.tsx`
- `src/components/charmsGame/Find.tsx`
- `src/components/charmsGame/GameOver.tsx`
- `tests/lib/charmsRound.test.ts`
- `tests/store/charmsGameStore.test.ts`
- `tests/store/braceletStore.test.ts`

**Modify**
- `src/store/navStore.ts` — `'stagger'` → `'game'`; `goStagger` → `goGame`.
- `src/App.tsx` — route `game` → `CharmsGame`; suppress GlobalMenu on `game`.
- `src/components/HomeScreen.tsx` — rebuild to Sherbet mockup-02; real PLAY.
- `src/store/settingsStore.ts` — re-document difficulty for Charms (keep key + type).
- `tests/store/navStore.test.ts` — rewrite for `goGame`.
- `tests/components/HomeScreen.test.tsx` — rewrite for new Home + charmsGameStore.
- `CLAUDE.md` — rewrite gameplay sections.

**Delete**
- `src/store/staggerStore.ts`, `src/components/StaggerScreen.tsx`, `src/lib/staggerCurve.ts`
- `src/store/runHistoryStore.ts`, `src/lib/runHistory.ts`, `src/components/RunHistoryGraph.tsx`
- `src/components/PieceShape.tsx`
- `tests/store/staggerStore.test.ts`, `tests/lib/runHistory.test.ts`, `tests/store/runHistoryStore.test.ts`, `tests/components/RunHistoryGraph.test.tsx`

---

## Task 1: Pure round + scoring math (`charmsRound.ts`)

**Files:**
- Create: `src/lib/charmsRound.ts`
- Test: `tests/lib/charmsRound.test.ts`

**Interfaces:**
- Produces:
  - `type Difficulty = 'easy' | 'medium' | 'hard'`
  - `interface RoundConfig { charmCount: number; decoyCount: number; glimpseMs: number; findMs: number }`
  - `function roundConfig(difficulty: Difficulty, roundIndex: number): RoundConfig`
  - `function pickScore(combo: number): number` — points for a correct pick at the given (post-increment) combo.
  - `function speedBonus(remainingMs: number, durationMs: number): number`
  - `function starsForRounds(roundsCleared: number): number`
  - `const MAX_CHARMS = 10`, `const CASE_SETTINGS = 25`, `const MAX_TRAY = 12`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/charmsRound.test.ts
import { describe, it, expect } from 'vitest'
import {
  roundConfig, pickScore, speedBonus, starsForRounds,
  MAX_CHARMS, CASE_SETTINGS, MAX_TRAY, type Difficulty,
} from '../../src/lib/charmsRound'

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard']

describe('roundConfig', () => {
  it('starts at 3/4/5 charms for easy/medium/hard', () => {
    expect(roundConfig('easy', 0).charmCount).toBe(3)
    expect(roundConfig('medium', 0).charmCount).toBe(4)
    expect(roundConfig('hard', 0).charmCount).toBe(5)
  })

  it('charmCount is monotonic non-decreasing and capped at MAX_CHARMS', () => {
    for (const d of DIFFS) {
      let prev = 0
      for (let r = 0; r < 40; r++) {
        const c = roundConfig(d, r).charmCount
        expect(c).toBeGreaterThanOrEqual(prev)
        expect(c).toBeLessThanOrEqual(MAX_CHARMS)
        prev = c
      }
    }
  })

  it('keeps the tray within MAX_TRAY and the board within CASE_SETTINGS', () => {
    for (const d of DIFFS) {
      for (let r = 0; r < 40; r++) {
        const { charmCount, decoyCount } = roundConfig(d, r)
        expect(decoyCount).toBeGreaterThanOrEqual(1)
        expect(charmCount + decoyCount).toBeLessThanOrEqual(MAX_TRAY)
        expect(charmCount + decoyCount).toBeLessThanOrEqual(CASE_SETTINGS)
      }
    }
  })

  it('always gives more find time than glimpse time', () => {
    for (const d of DIFFS) {
      for (let r = 0; r < 40; r++) {
        const { glimpseMs, findMs } = roundConfig(d, r)
        expect(glimpseMs).toBeGreaterThan(0)
        expect(findMs).toBeGreaterThan(glimpseMs)
      }
    }
  })

  it('harder difficulty never has fewer charms at the same round', () => {
    for (let r = 0; r < 40; r++) {
      expect(roundConfig('medium', r).charmCount).toBeGreaterThanOrEqual(roundConfig('easy', r).charmCount)
      expect(roundConfig('hard', r).charmCount).toBeGreaterThanOrEqual(roundConfig('medium', r).charmCount)
    }
  })
})

describe('scoring', () => {
  it('pickScore is 100 x combo', () => {
    expect(pickScore(1)).toBe(100)
    expect(pickScore(3)).toBe(300)
  })

  it('speedBonus scales 0..300 with fraction remaining and clamps', () => {
    expect(speedBonus(0, 1000)).toBe(0)
    expect(speedBonus(1000, 1000)).toBe(300)
    expect(speedBonus(500, 1000)).toBe(150)
    expect(speedBonus(5000, 1000)).toBe(300) // clamped
    expect(speedBonus(-50, 1000)).toBe(0)    // clamped
    expect(speedBonus(100, 0)).toBe(0)       // guard divide-by-zero
  })

  it('starsForRounds tiers by rounds cleared', () => {
    expect(starsForRounds(0)).toBe(0)
    expect(starsForRounds(1)).toBe(1)
    expect(starsForRounds(2)).toBe(1)
    expect(starsForRounds(3)).toBe(2)
    expect(starsForRounds(4)).toBe(2)
    expect(starsForRounds(5)).toBe(3)
    expect(starsForRounds(9)).toBe(3)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- charmsRound`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/charmsRound.ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- charmsRound`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/charmsRound.ts tests/lib/charmsRound.test.ts
git commit -m "feat(charms): pure round-config + scoring math

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Bracelet store (`braceletStore.ts`)

**Files:**
- Create: `src/store/braceletStore.ts`
- Test: `tests/store/braceletStore.test.ts`

**Interfaces:**
- Produces:
  - `const BRACELET_STORAGE_KEY = 'gapcity:bracelet:v1'`
  - `interface BraceletStore { earned: string[]; addCharms: (keys: string[]) => void; reset: () => void }`
  - `useBraceletStore` (Zustand). `earned` is a de-duplicated, insertion-ordered list of `"hue:motif"` keys.

- [ ] **Step 1: Write the failing test**

```ts
// tests/store/braceletStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useBraceletStore, BRACELET_STORAGE_KEY } from '../../src/store/braceletStore'

beforeEach(() => {
  localStorage.clear()
  useBraceletStore.setState({ earned: [] })
})

describe('braceletStore', () => {
  it('adds new charm keys, de-duplicated and persisted', () => {
    useBraceletStore.getState().addCharms(['lime:🍏', 'sky:💧', 'lime:🍏'])
    expect(useBraceletStore.getState().earned).toEqual(['lime:🍏', 'sky:💧'])
    const stored = JSON.parse(localStorage.getItem(BRACELET_STORAGE_KEY)!)
    expect(stored).toEqual(['lime:🍏', 'sky:💧'])
  })

  it('merges across calls without duplicating', () => {
    useBraceletStore.getState().addCharms(['lime:🍏'])
    useBraceletStore.getState().addCharms(['lime:🍏', 'grape:⭐'])
    expect(useBraceletStore.getState().earned).toEqual(['lime:🍏', 'grape:⭐'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- braceletStore`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// src/store/braceletStore.ts
import { create } from 'zustand'

/**
 * Bracelet — the player's earned-charm meta-collection (localStorage). Minimal
 * for the POC: a de-duplicated, insertion-ordered list of "hue:motif" keys.
 * DB-friendly shape so it can lift to a server row later.
 */
export const BRACELET_STORAGE_KEY = 'gapcity:bracelet:v1'

function load(): string[] {
  try {
    const raw = localStorage.getItem(BRACELET_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function save(keys: string[]): void {
  try {
    localStorage.setItem(BRACELET_STORAGE_KEY, JSON.stringify(keys))
  } catch {
    /* ignore quota / unavailable storage */
  }
}

interface BraceletStore {
  earned: string[]
  addCharms: (keys: string[]) => void
  reset: () => void
}

export const useBraceletStore = create<BraceletStore>((set, get) => ({
  earned: load(),
  addCharms: (keys) => {
    const merged = [...get().earned]
    for (const k of keys) if (!merged.includes(k)) merged.push(k)
    save(merged)
    set({ earned: merged })
  },
  reset: () => { save([]); set({ earned: [] }) },
}))
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- braceletStore`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/braceletStore.ts tests/store/braceletStore.test.ts
git commit -m "feat(charms): minimal localStorage bracelet store

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Game store (`charmsGameStore.ts`)

**Files:**
- Create: `src/store/charmsGameStore.ts`
- Test: `tests/store/charmsGameStore.test.ts`

**Interfaces:**
- Consumes: `charmsRound.ts` (Task 1), `braceletStore.ts` (Task 2), `CHARM_HUE_NAMES`/`CHARM_MOTIFS`/`CharmHue` from `src/components/charms/tokens.ts`.
- Produces:
  - `type CharmsPhase = 'idle' | 'countdown' | 'glimpse' | 'find' | 'resolved' | 'gameOver'`
  - `interface PlacedCharm { settingIndex: number; hue: CharmHue; motif: string; key: string; found: boolean }`
  - `interface TrayItem { key: string; hue: CharmHue; motif: string; isTarget: boolean; spent: boolean }`
  - `useCharmsGameStore` with state: `phase, difficulty, roundIndex, roundsCleared, score, lives, combo, bestCombo, config (RoundConfig), targets (PlacedCharm[]), tray (TrayItem[]), findStartedAt (number), foundThisRun (number), earnedKeys (string[])`
  - actions: `startRun(difficulty)`, `beginGlimpse()`, `beginFind()`, `pickTray(key): { ok: boolean; gameOver: boolean; roundCleared: boolean }`, `findTimeout()`, `beginNextRound()`, `exit()`
  - `START_LIVES = 3`

**Notes for the implementer:**
- `startRun` builds round 0 (config + targets + tray) and sets `phase: 'countdown'`.
- `pickTray`: a target whose `key` matches an unfound target → mark found, mark its tray item spent, `combo += 1`, `score += pickScore(combo)`, record key in `earnedKeys`, `foundThisRun += 1`; if that was the last target → `roundsCleared += 1`, `score += speedBonus(findStartedAt + config.findMs - Date.now(), config.findMs)`, `phase: 'resolved'`. A non-target (decoy) → mark its tray item spent, `combo = 0`, `lives -= 1`; if `lives === 0` → `phase: 'gameOver'`.
- On any transition into `gameOver`, commit `earnedKeys` to the bracelet via `useBraceletStore.getState().addCharms(...)`.
- `beginNextRound`: `roundIndex += 1`, rebuild config/targets/tray, reset `combo` and `foundThisRun`, `phase: 'countdown'`.
- `findTimeout`: `phase: 'gameOver'` (commit bracelet).
- Use `Math.random` for placement/shuffle. Tests read `useCharmsGameStore.getState().targets`/`.tray` to learn correct vs decoy keys, so determinism is unnecessary.

- [ ] **Step 1: Write the failing test**

```ts
// tests/store/charmsGameStore.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useCharmsGameStore, START_LIVES } from '../../src/store/charmsGameStore'
import { useBraceletStore } from '../../src/store/braceletStore'
import { roundConfig } from '../../src/lib/charmsRound'

const s = () => useCharmsGameStore.getState()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
  localStorage.clear()
  useBraceletStore.setState({ earned: [] })
  s().exit()
})
afterEach(() => { vi.useRealTimers() })

/** Drive into the Find phase and return the live target keys (in board order). */
function intoFind(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
  s().startRun(difficulty)
  s().beginGlimpse()
  s().beginFind()
  return s().targets.map(t => t.key)
}

describe('charmsGameStore — setup', () => {
  it('startRun seeds round 0 with config-sized targets and tray', () => {
    s().startRun('easy')
    const cfg = roundConfig('easy', 0)
    expect(s().phase).toBe('countdown')
    expect(s().lives).toBe(START_LIVES)
    expect(s().roundIndex).toBe(0)
    expect(s().targets).toHaveLength(cfg.charmCount)
    expect(s().tray).toHaveLength(cfg.charmCount + cfg.decoyCount)
    expect(s().tray.filter(t => t.isTarget)).toHaveLength(cfg.charmCount)
    expect(s().targets.every(t => !t.found)).toBe(true)
  })

  it('phase advances countdown -> glimpse -> find', () => {
    s().startRun('easy')
    s().beginGlimpse(); expect(s().phase).toBe('glimpse')
    s().beginFind(); expect(s().phase).toBe('find')
  })
})

describe('charmsGameStore — picking', () => {
  it('a correct pick bumps combo, scores 100 x combo, settles the charm', () => {
    const keys = intoFind('easy')
    const r1 = s().pickTray(keys[0])
    expect(r1.ok).toBe(true)
    expect(s().combo).toBe(1)
    expect(s().score).toBe(100)
    expect(s().targets.find(t => t.key === keys[0])!.found).toBe(true)
    expect(s().tray.find(t => t.key === keys[0])!.spent).toBe(true)

    s().pickTray(keys[1])
    expect(s().combo).toBe(2)
    expect(s().score).toBe(300) // 100 + 200
  })

  it('a wrong pick costs a life, resets combo, spends the tray item', () => {
    intoFind('easy')
    const decoy = s().tray.find(t => !t.isTarget)!.key
    s().pickTray(s().targets[0].key) // combo 1
    const r = s().pickTray(decoy)
    expect(r.ok).toBe(false)
    expect(s().lives).toBe(START_LIVES - 1)
    expect(s().combo).toBe(0)
    expect(s().tray.find(t => t.key === decoy)!.spent).toBe(true)
  })

  it('finding all targets clears the round (-> resolved) and adds a speed bonus', () => {
    const keys = intoFind('easy')
    let res
    for (const k of keys) res = s().pickTray(k)
    expect(res!.roundCleared).toBe(true)
    expect(s().phase).toBe('resolved')
    expect(s().roundsCleared).toBe(1)
    // base picks for 3 charms = 100+200+300 = 600, plus a >0 speed bonus (no time elapsed).
    expect(s().score).toBeGreaterThan(600)
  })

  it('beginNextRound escalates to a harder round', () => {
    const keys = intoFind('easy')
    for (const k of keys) s().pickTray(k)
    s().beginNextRound()
    expect(s().roundIndex).toBe(1)
    expect(s().phase).toBe('countdown')
    expect(s().combo).toBe(0)
    expect(s().targets.length).toBeGreaterThanOrEqual(keys.length)
  })
})

describe('charmsGameStore — ending', () => {
  it('losing the last life ends the run', () => {
    intoFind('easy')
    for (let i = 0; i < START_LIVES; i++) {
      const decoy = s().tray.find(t => !t.isTarget && !t.spent)!.key
      s().pickTray(decoy)
    }
    expect(s().lives).toBe(0)
    expect(s().phase).toBe('gameOver')
  })

  it('a find timeout ends the run', () => {
    intoFind('easy')
    s().findTimeout()
    expect(s().phase).toBe('gameOver')
  })

  it('found charms are committed to the bracelet at game over', () => {
    const keys = intoFind('easy')
    s().pickTray(keys[0])
    s().findTimeout()
    expect(useBraceletStore.getState().earned).toContain(keys[0])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- charmsGameStore`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

```ts
// src/store/charmsGameStore.ts
import { create } from 'zustand'
import {
  roundConfig, pickScore, speedBonus, CASE_SETTINGS, type Difficulty, type RoundConfig,
} from '../lib/charmsRound'
import { CHARM_HUE_NAMES, CHARM_MOTIFS, type CharmHue } from '../components/charms/tokens'
import { useBraceletStore } from './braceletStore'

export type CharmsPhase = 'idle' | 'countdown' | 'glimpse' | 'find' | 'resolved' | 'gameOver'

export interface PlacedCharm {
  settingIndex: number
  hue: CharmHue
  motif: string
  key: string
  found: boolean
}

export interface TrayItem {
  key: string
  hue: CharmHue
  motif: string
  isTarget: boolean
  spent: boolean
}

export interface PickResult {
  ok: boolean
  gameOver: boolean
  roundCleared: boolean
}

export const START_LIVES = 3

const charmKey = (hue: CharmHue, motif: string) => `${hue}:${motif}`

/** Fisher-Yates shuffle (new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick `n` distinct random elements from `arr`. */
function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** All hue x motif pairs as identity keys, for choosing targets + decoys. */
function allPairs(): { hue: CharmHue; motif: string }[] {
  const pairs: { hue: CharmHue; motif: string }[] = []
  for (const hue of CHARM_HUE_NAMES) for (const motif of CHARM_MOTIFS) pairs.push({ hue, motif })
  return pairs
}

/** Build a round's placed targets + shuffled tray (targets + decoys). */
function buildRound(config: RoundConfig): { targets: PlacedCharm[]; tray: TrayItem[] } {
  const pairs = shuffle(allPairs())
  const targetPairs = pairs.slice(0, config.charmCount)
  const decoyPairs = pairs.slice(config.charmCount, config.charmCount + config.decoyCount)

  const settings = sample(
    Array.from({ length: CASE_SETTINGS }, (_, i) => i),
    config.charmCount,
  )

  const targets: PlacedCharm[] = targetPairs.map((p, i) => ({
    settingIndex: settings[i],
    hue: p.hue,
    motif: p.motif,
    key: charmKey(p.hue, p.motif),
    found: false,
  }))

  const tray: TrayItem[] = shuffle([
    ...targetPairs.map(p => ({ key: charmKey(p.hue, p.motif), hue: p.hue, motif: p.motif, isTarget: true, spent: false })),
    ...decoyPairs.map(p => ({ key: charmKey(p.hue, p.motif), hue: p.hue, motif: p.motif, isTarget: false, spent: false })),
  ])

  return { targets, tray }
}

interface CharmsGameState {
  phase: CharmsPhase
  difficulty: Difficulty
  roundIndex: number
  roundsCleared: number
  score: number
  lives: number
  combo: number
  bestCombo: number
  config: RoundConfig
  targets: PlacedCharm[]
  tray: TrayItem[]
  findStartedAt: number
  foundThisRun: number
  earnedKeys: string[]

  startRun: (difficulty: Difficulty) => void
  beginGlimpse: () => void
  beginFind: () => void
  pickTray: (key: string) => PickResult
  findTimeout: () => void
  beginNextRound: () => void
  exit: () => void
}

const IDLE = {
  phase: 'idle' as CharmsPhase,
  difficulty: 'easy' as Difficulty,
  roundIndex: 0,
  roundsCleared: 0,
  score: 0,
  lives: START_LIVES,
  combo: 0,
  bestCombo: 0,
  config: roundConfig('easy', 0),
  targets: [] as PlacedCharm[],
  tray: [] as TrayItem[],
  findStartedAt: 0,
  foundThisRun: 0,
  earnedKeys: [] as string[],
}

function commitBracelet(keys: string[]) {
  if (keys.length) useBraceletStore.getState().addCharms(keys)
}

export const useCharmsGameStore = create<CharmsGameState>((set, get) => ({
  ...IDLE,

  startRun: (difficulty) => {
    const config = roundConfig(difficulty, 0)
    const { targets, tray } = buildRound(config)
    set({ ...IDLE, difficulty, config, targets, tray, phase: 'countdown' })
  },

  beginGlimpse: () => set({ phase: 'glimpse' }),

  beginFind: () => set({ phase: 'find', findStartedAt: Date.now() }),

  pickTray: (key) => {
    const st = get()
    if (st.phase !== 'find') return { ok: false, gameOver: false, roundCleared: false }
    const item = st.tray.find(t => t.key === key)
    if (!item || item.spent) return { ok: false, gameOver: false, roundCleared: false }

    const spendTray = (k: string) => st.tray.map(t => (t.key === k ? { ...t, spent: true } : t))

    if (!item.isTarget) {
      const lives = st.lives - 1
      if (lives <= 0) {
        commitBracelet(st.earnedKeys)
        set({ lives: 0, combo: 0, tray: spendTray(key), phase: 'gameOver' })
        return { ok: false, gameOver: true, roundCleared: false }
      }
      set({ lives, combo: 0, tray: spendTray(key) })
      return { ok: false, gameOver: false, roundCleared: false }
    }

    // Correct pick.
    const combo = st.combo + 1
    const score = st.score + pickScore(combo)
    const targets = st.targets.map(t => (t.key === key ? { ...t, found: true } : t))
    const earnedKeys = st.earnedKeys.includes(key) ? st.earnedKeys : [...st.earnedKeys, key]
    const cleared = targets.every(t => t.found)

    if (cleared) {
      const remaining = st.findStartedAt + st.config.findMs - Date.now()
      set({
        combo, bestCombo: Math.max(st.bestCombo, combo),
        score: score + speedBonus(remaining, st.config.findMs),
        targets, tray: spendTray(key), earnedKeys,
        foundThisRun: st.foundThisRun + 1,
        roundsCleared: st.roundsCleared + 1,
        phase: 'resolved',
      })
      return { ok: true, gameOver: false, roundCleared: true }
    }

    set({
      combo, bestCombo: Math.max(st.bestCombo, combo), score,
      targets, tray: spendTray(key), earnedKeys,
      foundThisRun: st.foundThisRun + 1,
    })
    return { ok: true, gameOver: false, roundCleared: false }
  },

  findTimeout: () => {
    const st = get()
    if (st.phase !== 'find') return
    commitBracelet(st.earnedKeys)
    set({ phase: 'gameOver' })
  },

  beginNextRound: () => {
    const st = get()
    const roundIndex = st.roundIndex + 1
    const config = roundConfig(st.difficulty, roundIndex)
    const { targets, tray } = buildRound(config)
    set({ roundIndex, config, targets, tray, combo: 0, foundThisRun: 0, phase: 'countdown' })
  },

  exit: () => set({ ...IDLE }),
}))
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- charmsGameStore`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/charmsGameStore.ts tests/store/charmsGameStore.test.ts
git commit -m "feat(charms): game store — phase machine, picks, escalating rounds

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Navigation — `'stagger'` → `'game'`

**Files:**
- Modify: `src/store/navStore.ts`
- Modify: `tests/store/navStore.test.ts`

- [ ] **Step 1: Rewrite the nav test**

```ts
// tests/store/navStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useNavStore } from '../../src/store/navStore'

beforeEach(() => { useNavStore.getState().reset() })

describe('navStore', () => {
  it('starts on the auth view', () => {
    expect(useNavStore.getState().appView).toBe('auth')
  })

  it('goHome moves to the home landing page', () => {
    useNavStore.getState().goHome()
    expect(useNavStore.getState().appView).toBe('home')
  })

  it('goGame enters the Charms game view; goAuth returns to auth', () => {
    useNavStore.getState().goGame()
    expect(useNavStore.getState().appView).toBe('game')
    useNavStore.getState().goAuth()
    expect(useNavStore.getState().appView).toBe('auth')
  })

  it('reset returns to the initial auth view', () => {
    useNavStore.getState().goGame()
    useNavStore.getState().reset()
    expect(useNavStore.getState().appView).toBe('auth')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- navStore`
Expected: FAIL (`goGame` not a function).

- [ ] **Step 3: Update the store**

```ts
// src/store/navStore.ts
import { create } from 'zustand'

export type AppView = 'auth' | 'home' | 'game'

interface NavState {
  appView: AppView
  goAuth: () => void
  goHome: () => void
  goGame: () => void
  reset: () => void
}

const INITIAL = {
  appView: 'auth' as AppView,
}

export const useNavStore = create<NavState>((set) => ({
  ...INITIAL,
  goAuth: () => set({ appView: 'auth' }),
  goHome: () => set({ appView: 'home' }),
  goGame: () => set({ appView: 'game' }),
  reset: () => set({ ...INITIAL }),
}))
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- navStore`
Expected: PASS. (App.test.tsx does not reference stagger and still passes.)

- [ ] **Step 5: Commit**

```bash
git add src/store/navStore.ts tests/store/navStore.test.ts
git commit -m "refactor(nav): replace stagger view with charms game view

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Game screens + router (`charmsGame/`)

**Files:**
- Create: `src/components/charmsGame/CharmsGame.tsx`, `Countdown.tsx`, `Glimpse.tsx`, `Find.tsx`, `GameOver.tsx`

**Interfaces:**
- Consumes: `useCharmsGameStore` (Task 3), library from `src/components/charms/` (`Charm, Setting, Case, Tray, TrayCharm, HUD, FindBar, ScorePanel, CharmButton, CHARM_MOTIFS, SHERBET, timerColor`), `useNavStore` (Task 4), `useSettingsStore`.
- Produces: `CharmsGame` (default export of the game view, rendered by App for `appView === 'game'`).

**This task has no unit test** (it is presentational/timer glue verified in-browser in Task 8); deliverable is the rendered screens.

- [ ] **Step 1: Countdown**

```tsx
// src/components/charmsGame/Countdown.tsx
import { useEffect, useState } from 'react'
import { Case, Setting, SHERBET, CASE_SETTINGS } from '../charms'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { HUD } from '../charms'

const BEATS = ['3', '2', '1', 'Go!']

export function Countdown() {
  const { score, lives, roundIndex, beginGlimpse } = useCharmsGameStore(s => s) // replaced below
  return null
}
```

Replace the stub body with the real implementation (note the `useShallow` selector):

```tsx
// src/components/charmsGame/Countdown.tsx
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, HUD, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

const BEATS = ['3', '2', '1', 'Go!']

export function Countdown() {
  const { score, lives, roundIndex, beginGlimpse } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, beginGlimpse: s.beginGlimpse,
  })))
  const [i, setI] = useState(0)

  useEffect(() => {
    if (i >= BEATS.length - 1) {
      const t = setTimeout(beginGlimpse, 650)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setI(v => v + 1), 850)
    return () => clearTimeout(t)
  }, [i, beginGlimpse])

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} inert />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 12px', color: SHERBET.inkSoft }}>
        Get ready to glimpse…
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => <Setting key={k} />)}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(255,247,240,.94),rgba(255,247,240,.7) 70%,rgba(255,247,240,0))' }} />
          <span key={i} className="charm-pick" style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: i === BEATS.length - 1 ? 64 : 120, lineHeight: 1, background: i === BEATS.length - 1 ? 'linear-gradient(180deg,#5BD9C9,#2FD09B)' : 'linear-gradient(180deg,#FFB0DC,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(255,107,129,.3))' }}>
            {BEATS[i]}
          </span>
        </div>
      </Case>
    </>
  )
}
```

- [ ] **Step 2: Glimpse**

```tsx
// src/components/charmsGame/Glimpse.tsx
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, SHERBET, CHARM_HUES } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

export function Glimpse() {
  const { score, lives, roundIndex, config, targets, beginFind } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, config: s.config, targets: s.targets, beginFind: s.beginFind,
  })))
  const [slipping, setSlipping] = useState(false)

  useEffect(() => {
    setSlipping(false)
    // Charms settle, hold, then slip away just before Find takes over.
    const slipLead = 700
    const slipAt = Math.max(0, config.glimpseMs - slipLead)
    const slipTimer = setTimeout(() => setSlipping(true), slipAt)
    const findTimer = setTimeout(beginFind, config.glimpseMs)
    return () => { clearTimeout(slipTimer); clearTimeout(findTimer) }
  }, [config.glimpseMs, beginFind])

  // bySetting: settingIndex -> placed charm
  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 10px' }}>
        Glimpse the charms — <b style={{ color: CHARM_HUES.bubblegum.fill }}>they slip away soon!</b>
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          const order = ch ? targets.indexOf(ch) : 0
          return (
            <Setting key={k}>
              {ch && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm hue={ch.hue} motif={ch.motif} size={56} index={order} state={slipping ? 'slipping' : 'settling'} />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
      <div style={{ textAlign: 'center', color: SHERBET.inkFaint, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 18 }}>
        memorize · charms settle in, then slip away
      </div>
    </>
  )
}
```

- [ ] **Step 3: Find**

```tsx
// src/components/charmsGame/Find.tsx
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, Tray, TrayCharm, HUD, FindBar, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `0:${String(s).padStart(2, '0')}`
}

export function Find() {
  const {
    score, lives, roundIndex, combo, config, targets, tray, findStartedAt, pickTray, findTimeout,
  } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, combo: s.combo, config: s.config,
    targets: s.targets, tray: s.tray, findStartedAt: s.findStartedAt, pickTray: s.pickTray, findTimeout: s.findTimeout,
  })))
  const [remaining, setRemaining] = useState(config.findMs)

  useEffect(() => {
    const tick = () => {
      const left = findStartedAt + config.findMs - Date.now()
      setRemaining(left)
      if (left <= 0) findTimeout()
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [findStartedAt, config.findMs, findTimeout])

  const fraction = Math.max(0, Math.min(1, remaining / config.findMs))
  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <FindBar combo={Math.max(1, combo)} comboFill={fraction} clockLabel={fmt(remaining)} fractionRemaining={fraction} />
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          const found = ch?.found
          return (
            <Setting key={k} state={found ? 'good' : 'empty'}>
              {found && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm hue={ch!.hue} motif={ch!.motif} size={56} state="settling" />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
      <div style={{ marginTop: 18 }}>
        <Tray>
          {tray.map(item => (
            <TrayCharm
              key={item.key}
              hue={item.hue}
              motif={item.motif}
              spent={item.spent}
              onPick={() => pickTray(item.key)}
            />
          ))}
        </Tray>
      </div>
    </>
  )
}
```

Note: a wrong pick spends the tray item (greys it). The `miss` coral shake is a visual nicety; the spent/✕ feedback is sufficient for the POC and keeps the component stateless.

- [ ] **Step 4: GameOver**

```tsx
// src/components/charmsGame/GameOver.tsx
import { useShallow } from 'zustand/shallow'
import { Charm, ScorePanel, CharmButton, SHERBET, resolveHue, type CharmHue } from '../charms'
import { starsForRounds } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { useNavStore } from '../../store/navStore'

export function GameOver() {
  const { score, roundsCleared, earnedKeys, difficulty, startRun, exit } = useCharmsGameStore(useShallow(s => ({
    score: s.score, roundsCleared: s.roundsCleared, earnedKeys: s.earnedKeys, difficulty: s.difficulty,
    startRun: s.startRun, exit: s.exit,
  })))
  const { goHome } = useNavStore(useShallow(s => ({ goHome: s.goHome })))

  const stars = starsForRounds(roundsCleared)
  const found = earnedKeys.length
  const earned = earnedKeys.slice(0, 8).map(k => {
    const [hue, motif] = k.split(':') as [CharmHue, string]
    return { hue, motif }
  })

  const playAgain = () => { startRun(difficulty) }
  const home = () => { exit(); goHome() }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 10px 0' }}>
      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <Charm hue="bubblegum" motif="🍓" size={108} state="settling" />
      </div>
      <h1 style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 34, margin: '0 0 4px', background: `linear-gradient(90deg,${SHERBET.comboA},${SHERBET.comboB})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        Lovely run!
      </h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 15, margin: '0 0 18px' }}>
        You found {found} charm{found === 1 ? '' : 's'} — sweet memory.
      </p>
      <div style={{ width: '100%', padding: '0 12px' }}>
        <ScorePanel score={score} stars={stars}>
          {earned.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${SHERBET.hairline}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: SHERBET.inkSoft, marginBottom: 12 }}>
                Charms earned this run
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {earned.map((e, i) => <Charm key={i} hue={e.hue} motif={e.motif} size={48} state="settling" index={i} />)}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: SHERBET.success }}>
                Added to your Bracelet ✦
              </div>
            </div>
          )}
        </ScorePanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
          <CharmButton variant="primary" onClick={playAgain}>Play again</CharmButton>
          <CharmButton variant="secondary" onClick={home}>Home</CharmButton>
        </div>
      </div>
    </div>
  )
}
```

(`resolveHue` import is unused above — drop it; keep only `Charm, ScorePanel, CharmButton, SHERBET, type CharmHue`.)

- [ ] **Step 5: Resolved beat + router**

```tsx
// src/components/charmsGame/CharmsGame.tsx
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { Countdown } from './Countdown'
import { Glimpse } from './Glimpse'
import { Find } from './Find'
import { GameOver } from './GameOver'

/** Brief celebratory all-✓ beat between a cleared round and the next countdown. */
function Resolved() {
  const { score, lives, roundIndex, targets, beginNextRound } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, targets: s.targets, beginNextRound: s.beginNextRound,
  })))
  useEffect(() => {
    const t = setTimeout(beginNextRound, 1100)
    return () => clearTimeout(t)
  }, [beginNextRound])

  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))
  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 16, margin: '2px 0 12px', color: SHERBET.success }}>
        Round cleared! ✦
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          return (
            <Setting key={k} state={ch ? 'good' : 'empty'}>
              {ch && <div style={{ position: 'absolute', inset: 3 }}><Charm hue={ch.hue} motif={ch.motif} size={56} state="settling" /></div>}
            </Setting>
          )
        })}
      </Case>
    </>
  )
}

const FRAME: React.CSSProperties = {
  minHeight: '100dvh', background: SHERBET.bg, color: SHERBET.ink,
  fontFamily: "'Nunito',sans-serif", padding: '18px 16px 26px',
  display: 'flex', flexDirection: 'column', maxWidth: 440, margin: '0 auto',
}

export default function CharmsGame() {
  const phase = useCharmsGameStore(s => s.phase)
  return (
    <div style={FRAME}>
      {phase === 'countdown' && <Countdown />}
      {phase === 'glimpse' && <Glimpse />}
      {phase === 'find' && <Find />}
      {phase === 'resolved' && <Resolved />}
      {phase === 'gameOver' && <GameOver />}
    </div>
  )
}
```

- [ ] **Step 6: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors. (Remove any unused imports flagged, e.g. `resolveHue` in GameOver, `CHARM_MOTIFS` if unused.)

- [ ] **Step 7: Commit**

```bash
git add src/components/charmsGame
git commit -m "feat(charms): countdown / glimpse / find / resolved / game-over screens

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Rebuild Home (Sherbet) + real PLAY

**Files:**
- Modify: `src/components/HomeScreen.tsx`
- Modify: `tests/components/HomeScreen.test.tsx`
- Modify: `src/store/settingsStore.ts` (re-document only)

**Interfaces:**
- Consumes: `useSettingsStore` (`difficulty`, `setDifficulty`), `useCharmsGameStore.startRun`, `useNavStore.goGame`, `useBraceletStore.earned`, library (`Charm, CharmButton, CHARM_HUES, CHARM_HUE_NAMES, SHERBET`).

- [ ] **Step 1: Rewrite the Home test**

```tsx
// tests/components/HomeScreen.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../src/lib/auth', () => ({ signOut: vi.fn().mockResolvedValue({ error: null }) }))
import { HomeScreen } from '../../src/components/HomeScreen'
import { useNavStore } from '../../src/store/navStore'
import { useSettingsStore } from '../../src/store/settingsStore'
import { useCharmsGameStore } from '../../src/store/charmsGameStore'

beforeEach(() => {
  useNavStore.getState().reset()
  useSettingsStore.setState({ settings: { difficulty: 'easy' } })
  useCharmsGameStore.getState().exit()
  vi.clearAllMocks()
})

describe('HomeScreen', () => {
  it('Play starts a Charms run and enters the game view', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Play/i }))
    expect(useNavStore.getState().appView).toBe('game')
    expect(useCharmsGameStore.getState().phase).toBe('countdown')
  })

  it('defaults the difficulty selector to Easy', () => {
    render(<HomeScreen />)
    expect(screen.getByRole('button', { name: /Easy/i, pressed: true })).toBeTruthy()
  })

  it('selecting Medium / Hard updates the difficulty setting', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Medium/i }))
    expect(useSettingsStore.getState().settings.difficulty).toBe('medium')
    await user.click(screen.getByRole('button', { name: /Hard/i }))
    expect(useSettingsStore.getState().settings.difficulty).toBe('hard')
  })

  it('starts the run at the selected difficulty', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Hard/i }))
    await user.click(screen.getByRole('button', { name: /Play/i }))
    expect(useCharmsGameStore.getState().difficulty).toBe('hard')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- HomeScreen`
Expected: FAIL (old Home still routes to `stagger`).

- [ ] **Step 3: Rebuild HomeScreen**

```tsx
// src/components/HomeScreen.tsx
import { useShallow } from 'zustand/shallow'
import { useNavStore } from '../store/navStore'
import { useCharmsGameStore } from '../store/charmsGameStore'
import { useSettingsStore, type Difficulty } from '../store/settingsStore'
import { useBraceletStore } from '../store/braceletStore'
import { Charm, CharmButton, CHARM_HUES, CHARM_HUE_NAMES, SHERBET, type CharmHue } from './charms'

/** The three difficulty tiers, rendered as a segmented candy switch. */
const TIERS: { value: Difficulty; label: string; pips: number }[] = [
  { value: 'easy', label: 'Easy', pips: 1 },
  { value: 'medium', label: 'Medium', pips: 2 },
  { value: 'hard', label: 'Hard', pips: 3 },
]

const PREVIEW_MOTIF: Record<string, string> = {
  strawberry: '🍓', tangerine: '🍑', lemon: '🍋', lime: '🍏',
  teal: '🌊', sky: '💧', grape: '⭐', bubblegum: '🌸',
}

export function HomeScreen() {
  const goGame = useNavStore(s => s.goGame)
  const startRun = useCharmsGameStore(s => s.startRun)
  const { difficulty, setDifficulty } = useSettingsStore(useShallow(s => ({
    difficulty: s.settings.difficulty, setDifficulty: s.setDifficulty,
  })))
  const earned = useBraceletStore(s => s.earned)

  const play = () => { startRun(difficulty); goGame() }

  // First few collected charms (or hue previews if the bracelet is empty).
  const slots = earned.slice(0, 5).map(k => {
    const [hue, motif] = k.split(':') as [CharmHue, string]
    return { hue, motif }
  })

  return (
    <div style={{ minHeight: '100dvh', background: SHERBET.bg, color: SHERBET.ink, fontFamily: "'Nunito',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 28px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Charm hue="bubblegum" motif="🍓" size={112} state="settling" />
      </div>
      <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 46, letterSpacing: '.05em', margin: 0, background: 'linear-gradient(180deg,#FF8FCF,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        CHARMS
      </h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 14, margin: '6px 0 0' }}>A cozy little memory game</p>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: SHERBET.inkSoft, margin: '28px 0 10px' }}>Difficulty</div>
      <div style={{ display: 'flex', gap: 8, width: '100%', background: SHERBET.sunken, border: `1.5px solid ${SHERBET.hairline}`, borderRadius: 18, padding: 5 }}>
        {TIERS.map(t => {
          const active = t.value === difficulty
          return (
            <button
              key={t.value}
              aria-pressed={active}
              onClick={() => setDifficulty(t.value)}
              style={{ flex: 1, border: 'none', borderRadius: 13, padding: '11px 0', cursor: 'pointer', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: active ? '#fff' : 'transparent', color: active ? SHERBET.ink : SHERBET.inkSoft, boxShadow: active ? '0 6px 14px rgba(217,150,120,.22),inset 0 2px 0 rgba(255,255,255,.6)' : 'none' }}
            >
              {t.label}
              <span style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(p => <i key={p} style={{ width: 6, height: 6, borderRadius: '50%', background: p < t.pips ? (active ? CHARM_HUES.bubblegum.fill : SHERBET.inkFaint) : SHERBET.inkFaint }} />)}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 18, width: '100%' }}>
        <CharmButton variant="play" onClick={play}>Play ▶</CharmButton>
      </div>

      <div style={{ marginTop: 24, width: '100%', background: '#fff', borderRadius: 24, boxShadow: '0 6px 14px rgba(217,150,120,.22)', padding: '16px 16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15 }}>Your Bracelet</h4>
          <span style={{ fontSize: 12, fontWeight: 700, color: CHARM_HUES.bubblegum.fill }}>{earned.length} found</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {slots.length > 0
            ? slots.map((c, i) => <Charm key={i} hue={c.hue} motif={c.motif} size={46} />)
            : CHARM_HUE_NAMES.slice(0, 5).map(h => <Charm key={h} hue={h} motif={PREVIEW_MOTIF[h]} size={46} style={{ filter: 'grayscale(.85)', opacity: 0.5 }} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Re-document settingsStore difficulty**

In `src/store/settingsStore.ts`, replace the Stagger-flavored doc comment block above `export type Difficulty` with:

```ts
/**
 * Charms difficulty (set from the Home screen). Scales the starting round:
 *  - `easy`   — fewer charms, a gentle clock, fewer decoys.
 *  - `medium` — a few more charms, a touch quicker.
 *  - `hard`   — more charms from the start, tighter glimpse + find clocks.
 * See `src/lib/charmsRound.ts` `roundConfig()` for the exact curve.
 */
```

- [ ] **Step 5: Run to verify Home tests pass**

Run: `npm test -- HomeScreen`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomeScreen.tsx tests/components/HomeScreen.test.tsx src/store/settingsStore.ts
git commit -m "feat(charms): Sherbet Home with real PLAY into a Charms run

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Route the game in App + remove legacy Stagger

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/store/staggerStore.ts`, `src/components/StaggerScreen.tsx`, `src/lib/staggerCurve.ts`, `src/store/runHistoryStore.ts`, `src/lib/runHistory.ts`, `src/components/RunHistoryGraph.tsx`, `src/components/PieceShape.tsx`
- Delete: `tests/store/staggerStore.test.ts`, `tests/lib/runHistory.test.ts`, `tests/store/runHistoryStore.test.ts`, `tests/components/RunHistoryGraph.test.tsx`

- [ ] **Step 1: Update App routing**

In `src/App.tsx`: replace the `StaggerScreen` import with `CharmsGame`, route `game`, and only suppress the menu on `auth`/`game`.

```tsx
// src/App.tsx — replace import
import CharmsGame from './components/charmsGame/CharmsGame'
// (remove: import { StaggerScreen } from './components/StaggerScreen')
```

```tsx
// switch block
  const view = (() => {
    switch (appView) {
      case 'auth': return <AuthScreen />
      case 'home': return <HomeScreen />
      case 'game': return <CharmsGame />
      default: return <AuthScreen />
    }
  })()

  // The game owns its own screen; the global menu is suppressed there and on auth.
  const showMenu = appView !== 'auth' && appView !== 'game'
```

- [ ] **Step 2: Delete the legacy client modules + tests**

```bash
git rm src/store/staggerStore.ts src/components/StaggerScreen.tsx src/lib/staggerCurve.ts \
  src/store/runHistoryStore.ts src/lib/runHistory.ts src/components/RunHistoryGraph.tsx \
  src/components/PieceShape.tsx \
  tests/store/staggerStore.test.ts tests/lib/runHistory.test.ts \
  tests/store/runHistoryStore.test.ts tests/components/RunHistoryGraph.test.tsx
```

- [ ] **Step 3: Confirm no dangling references**

Run: `grep -rn "stagger\|Stagger\|RunHistory\|runHistory\|PieceShape" src tests`
Expected: no matches in `src/` or `tests/` (the Supabase `_shared` engine and `tests/engine`/`tests/core` are intentionally untouched and contain none of these client names; if any match remains, fix it).

- [ ] **Step 4: Type-check + full test run**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(charms): route the game in App; remove legacy Stagger client surface

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Verify in-browser + build + lint

**Files:** none (verification).

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: success (tsc + vite, no `noUnusedLocals` errors).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Play a full round in-browser**

Run the dev server and, via the preview tools, sign in as guest → Home → PLAY → verify countdown → glimpse (charms settle then slip) → find (tap targets land ✓ + combo rises; tap a decoy greys it + a life drops) → clear a round → next round countdown → eventually Game Over ("Lovely run!", stars, earned charms). Confirm **no console errors**. Also load `#charms` and confirm the demo still renders.

- [ ] **Step 4: Commit any fixes** (if needed), then proceed to docs.

---

## Task 9: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1:** Rewrite the project header + "The Game" + "Round loop" + "Scoring" + "Architecture / File map" sections to describe the Charms memory loop (phases countdown → glimpse → find → resolved → gameOver; identity-based memory; escalating rounds with pooled lives; `charmsRound`/`charmsGameStore`/`braceletStore`/`charmsGame/` files; Sherbet theme; `#charms` demo). Keep the "Critical rules for agents" Zustand `useShallow` rule. Remove tetromino/solver/Journey/Practice gameplay descriptions that no longer reflect the client (note the Supabase `_shared` engine remains server-side but is not part of the client game).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md for the Charms memory loop

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Land on main

- [ ] **Step 1:** Final full check (each as its own command): `npm run build`, `npm run test`, `npm run lint`.
- [ ] **Step 2:** Merge `feat/charms-gameplay` into `main` and push `main` (per the user's explicit request to commit and push directly to main).

```bash
git checkout main
git merge --no-ff feat/charms-gameplay -m "feat: Charms memory game — replace legacy Stagger gameplay"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- Remove legacy Stagger (store/screen/curve, nav, Home, App, orphan tests) → Tasks 4, 6, 7. ✓
- Game store with phases, targets, tray, score, 3 lives, combo, glimpse/find timers, per-pick correctness, difficulty scaling → Task 3 + Task 1. ✓
- Countdown / Glimpse / Find / Game Over screens → Task 5. ✓
- Home real PLAY at selected difficulty → Task 6. ✓
- `prefers-reduced-motion` honored → uses library + existing CSS (Global Constraints). ✓
- Zustand `useShallow`, Sherbet theme, keep Auth/Supabase, keep `#charms` demo → Global Constraints + Tasks 5–7. ✓
- Bracelet meta → Task 2 + Tasks 5–6. ✓
- Tests for new logic; delete orphan tests; keep suite green → Tasks 1–4, 6, 7. ✓
- Update CLAUDE.md → Task 9. ✓
- Commit messages / branch / push to main → all tasks + Task 10. ✓

**Placeholder scan:** none — all steps contain real code/commands.

**Type consistency:** `roundConfig`/`RoundConfig`/`Difficulty` shared (Task 1 → 3/5/6); `pickTray(key)`/`PickResult`/`TrayItem.key`/`PlacedCharm.found` consistent (Task 3 → 5); `goGame` consistent (Task 4 → 5/6/7); `startRun(difficulty)` consistent (Task 3 → 5/6); `useBraceletStore.addCharms`/`earned` consistent (Task 2 → 3/6). ✓
