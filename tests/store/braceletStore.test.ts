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
