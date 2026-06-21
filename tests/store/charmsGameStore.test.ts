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
    intoFind('hard') // hard round 0 has >= START_LIVES decoys to pick
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
