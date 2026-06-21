import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore, SETTINGS_STORAGE_KEY } from '../../src/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.setState({ settings: { difficulty: 'easy' } })
})

describe('settingsStore', () => {
  it('defaults to the gentlest difficulty', () => {
    expect(useSettingsStore.getState().settings.difficulty).toBe('easy')
  })

  it('setDifficulty updates the tier and persists to localStorage', () => {
    useSettingsStore.getState().setDifficulty('hard')
    expect(useSettingsStore.getState().settings.difficulty).toBe('hard')
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)!)
    expect(stored.difficulty).toBe('hard')
  })

  it('persists each tier change', () => {
    useSettingsStore.getState().setDifficulty('medium')
    expect(useSettingsStore.getState().settings.difficulty).toBe('medium')
    useSettingsStore.getState().setDifficulty('easy')
    expect(useSettingsStore.getState().settings.difficulty).toBe('easy')
  })
})
