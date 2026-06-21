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
