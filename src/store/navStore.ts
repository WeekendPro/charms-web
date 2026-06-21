import { create } from 'zustand'

export type AppView = 'auth' | 'home' | 'stagger'

interface NavState {
  appView: AppView
  goAuth: () => void
  goHome: () => void
  goStagger: () => void
  reset: () => void
}

const INITIAL = {
  appView: 'auth' as AppView,
}

export const useNavStore = create<NavState>((set) => ({
  ...INITIAL,
  goAuth: () => set({ appView: 'auth' }),
  goHome: () => set({ appView: 'home' }),
  goStagger: () => set({ appView: 'stagger' }),
  reset: () => set({ ...INITIAL }),
}))
