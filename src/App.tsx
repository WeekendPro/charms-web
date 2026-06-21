import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { getSession } from './lib/auth'
import { useNavStore } from './store/navStore'
import { AuthScreen } from './components/AuthScreen'
import { HomeScreen } from './components/HomeScreen'
import { StaggerScreen } from './components/StaggerScreen'
import { GlobalLoadingOverlay } from './components/GlobalLoadingOverlay'
import { GlobalMenu } from './components/GlobalMenu'
import { CharmsDemo } from './components/charms/CharmsDemo'

// Dev gallery for the Charms × Sherbet component library, reached at `#charms`.
// Additive and self-contained — it never touches the auth/game flow below.
const isCharmsDemo = typeof window !== 'undefined' && window.location.hash.replace(/^#\/?/, '') === 'charms'

export default function App() {
  const { appView, goAuth, goHome } = useNavStore(useShallow(s => ({
    appView: s.appView,
    goAuth: s.goAuth,
    goHome: s.goHome,
  })))

  useEffect(() => {
    if (isCharmsDemo) return
    let cancelled = false
    getSession()
      .then(({ data }) => {
        if (cancelled) return
        if (data?.session) goHome()
        else goAuth()
      })
      .catch(() => { if (!cancelled) goAuth() })
    return () => { cancelled = true }
  }, [goAuth, goHome])

  if (isCharmsDemo) return <CharmsDemo />

  const view = (() => {
    switch (appView) {
      case 'auth': return <AuthScreen />
      case 'home': return <HomeScreen />
      case 'stagger': return <StaggerScreen />
      default: return <AuthScreen />
    }
  })()

  // The Infinite Stagger layout owns its own Pause/Exit controls, so the global
  // menu is suppressed there (and on the auth screen).
  const showMenu = appView !== 'auth' && appView !== 'stagger'

  return (
    <>
      <GlobalLoadingOverlay />
      {view}
      {showMenu && <GlobalMenu />}
    </>
  )
}
