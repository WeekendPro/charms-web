import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { getSession } from './lib/auth'
import { useNavStore } from './store/navStore'
import { AuthScreen } from './components/AuthScreen'
import { HomeScreen } from './components/HomeScreen'
import { StaggerScreen } from './components/StaggerScreen'
import { GlobalLoadingOverlay } from './components/GlobalLoadingOverlay'
import { GlobalMenu } from './components/GlobalMenu'

export default function App() {
  const { appView, goAuth, goHome } = useNavStore(useShallow(s => ({
    appView: s.appView,
    goAuth: s.goAuth,
    goHome: s.goHome,
  })))

  useEffect(() => {
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
