import { create } from 'zustand'

export const SETTINGS_STORAGE_KEY = 'gapcity:settings:v1'

/**
 * Client-side user settings (localStorage).
 *
 * This is a deliberate stand-in for the future server-backed **Settings** system
 * (its own spike). Keep this shape DB-friendly — a flat, JSON-serializable object
 * keyed by setting — so it can be lifted to a `user_settings` row and synced later
 * with minimal churn. When that lands, this store becomes the local cache/optimistic
 * layer over the server value; consumers (selectors below) shouldn't need to change.
 */

/**
 * Stagger reveal difficulty (set from the home screen). Differences live entirely
 * in the reveal phase:
 *  - `easy`   — gaps bloom in their own PIECE colour (track shape + colour).
 *  - `medium` — gaps bloom in the uniform branded pink (shape only).
 *  - `hard`   — pink reveal, but the sequence plays noticeably faster.
 */
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface UserSettings {
  /** Selected Stagger reveal difficulty. Defaults to the gentlest (easy). */
  difficulty: Difficulty
}

function emptySettings(): UserSettings {
  return { difficulty: 'easy' }
}

function load(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return raw ? { ...emptySettings(), ...(JSON.parse(raw) as Partial<UserSettings>) } : emptySettings()
  } catch {
    return emptySettings()
  }
}

function save(s: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota / unavailable storage */
  }
}

interface SettingsStore {
  settings: UserSettings
  setDifficulty: (difficulty: Difficulty) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: load(),

  setDifficulty: (difficulty) => {
    set((state) => {
      const next: UserSettings = { ...state.settings, difficulty }
      save(next)
      return { settings: next }
    })
  },
}))
