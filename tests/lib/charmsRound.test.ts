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
