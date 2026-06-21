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
