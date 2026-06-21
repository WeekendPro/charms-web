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
