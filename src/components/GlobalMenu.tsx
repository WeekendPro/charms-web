import { useEffect, useState } from 'react'
import { getUser, signOut } from '../lib/auth'
import { useNavStore } from '../store/navStore'
import { ScanlineOverlay } from './ui'

interface MenuUser {
  name: string
  email: string | null
  avatarUrl: string | null
  isGuest: boolean
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({ user }: { user: MenuUser }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-1 ring-vt-edge" />
  }
  return (
    <div className="w-12 h-12 rounded-full grid place-items-center font-black text-lg text-white
      bg-gradient-to-br from-neon-cyan to-neon-magenta ring-1 ring-vt-edge">
      {initials(user.name)}
    </div>
  )
}

function Action({ label, onClick, tone = 'default' }:
  { label: string; onClick: () => void; tone?: 'default' | 'muted' | 'danger' }) {
  const color = tone === 'danger' ? 'text-vt-red hover:opacity-80'
    : tone === 'muted' ? 'text-vt-dim hover:text-vt-text'
    : 'text-vt-text hover:text-vt-cyan'
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 text-left font-pixel uppercase tracking-[0.08em] text-base py-3 ${color}`}>
      {label}
    </button>
  )
}

export function GlobalMenu() {
  const resetNav = useNavStore(s => s.reset)

  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<MenuUser | null>(null)

  useEffect(() => {
    let cancelled = false
    getUser().then(({ data }) => {
      if (cancelled || !data.user) return
      const m = data.user.user_metadata ?? {}
      const isGuest = data.user.is_anonymous ?? false
      const name = (m.full_name || m.name || data.user.email?.split('@')[0] || (isGuest ? 'Guest' : 'Player')) as string
      setUser({
        name,
        email: data.user.email ?? null,
        avatarUrl: (m.avatar_url || m.picture || null) as string | null,
        isGuest,
      })
    })
    return () => { cancelled = true }
  }, [])

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const handleSignOut = async () => { setOpen(false); await signOut(); resetNav() }

  return (
    <>
      <button
        onClick={open ? close : () => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        className="fixed top-3 right-3 z-50 grid place-items-center w-10 h-10 rounded-xl
          border border-vt-edge bg-vt-panel/80 text-vt-text shadow-vt-tile hover:border-vt-cyan hover:text-vt-cyan
          transition-colors"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <span className="flex flex-col gap-[5px]">
            <span className="block w-5 h-0.5 rounded-full bg-current" />
            <span className="block w-5 h-0.5 rounded-full bg-current" />
            <span className="block w-5 h-0.5 rounded-full bg-current" />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col px-7 pt-20 pb-8 text-vt-text
          bg-gradient-to-b from-vt-void via-vt-grid to-vt-panel">
          <ScanlineOverlay />
          {user && (
            <div className="flex items-center gap-3 mb-8">
              <Avatar user={user} />
              <div className="min-w-0">
                <div className="font-pixel text-sm leading-tight truncate text-vt-text">{user.name}</div>
                <div className="text-xs text-vt-dim truncate">
                  {user.email ?? (user.isGuest ? 'Guest session' : '')}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto">
            <Action label="Settings" tone="muted" onClick={() => setOpen(false)} />
            <Action label="Logout" tone="danger" onClick={handleSignOut} />
          </div>
        </div>
      )}
    </>
  )
}
