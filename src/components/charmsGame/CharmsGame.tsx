import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, BonusDrain, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { Countdown } from './Countdown'
import { Glimpse } from './Glimpse'
import { Find } from './Find'
import { GameOver } from './GameOver'

/** Cubic ease-out — fast start, gentle landing. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

const DRAIN_MS = 1100

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Round-clear beat. "Drain first, then cheer": the leftover Find time pours into
 * the score as a single lifting `+N` (the speed bonus), the timer bar draining in
 * lockstep; then the drain row gives way to a quiet "Round cleared! ✦".
 */
function Resolved() {
  const { score, lastSpeedBonus, clearFraction, lives, roundIndex, streak, targets, beginNextRound } =
    useCharmsGameStore(useShallow(s => ({
      score: s.score, lastSpeedBonus: s.lastSpeedBonus, clearFraction: s.clearFraction,
      lives: s.lives, roundIndex: s.roundIndex, streak: s.streak, targets: s.targets,
      beginNextRound: s.beginNextRound,
    })))

  const base = score - lastSpeedBonus
  const animated = lastSpeedBonus > 0 && !prefersReducedMotion()

  // `e` is the eased drain progress 0→1; `cheer` swaps the drain row for the all-✓ beat.
  const [e, setE] = useState(animated ? 0 : 1)
  const [cheer, setCheer] = useState(!animated)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (!animated) {
      const t = setTimeout(beginNextRound, 900)
      return () => clearTimeout(t)
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DRAIN_MS)
      setE(easeOut(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const bumpOn = setTimeout(() => setBump(true), DRAIN_MS)
    const bumpOff = setTimeout(() => setBump(false), DRAIN_MS + 260)
    // Snap to the final value alongside the cheer, so the full score always lands
    // even if rAF was starved (e.g. a backgrounded tab pausing requestAnimationFrame).
    const cheerOn = setTimeout(() => { setE(1); setCheer(true) }, DRAIN_MS + 140)
    const next = setTimeout(beginNextRound, 1820)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(bumpOn); clearTimeout(bumpOff); clearTimeout(cheerOn); clearTimeout(next)
    }
  }, [animated, beginNextRound])

  const displayedScore = Math.round(base + lastSpeedBonus * e)
  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))
  return (
    <>
      <HUD score={displayedScore} label={`Round ${roundIndex + 1}`} lives={lives} scoreBump={bump} />
      {cheer ? (
        <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 16, margin: '2px 0 12px', color: SHERBET.success }}>
          Round cleared! ✦
        </div>
      ) : (
        <BonusDrain streak={streak} fill={clearFraction * (1 - e)} bonus={lastSpeedBonus} lift={e} />
      )}
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          return (
            <Setting key={k} state={ch ? 'good' : 'empty'}>
              {ch && <div style={{ position: 'absolute', inset: 3 }}><Charm hue={ch.hue} motif={ch.motif} size={56} state="settling" /></div>}
            </Setting>
          )
        })}
      </Case>
    </>
  )
}

const FRAME: React.CSSProperties = {
  minHeight: '100dvh', background: SHERBET.bg, color: SHERBET.ink,
  fontFamily: "'Nunito',sans-serif", padding: '18px 16px 26px',
  display: 'flex', flexDirection: 'column', maxWidth: 440, margin: '0 auto',
}

export default function CharmsGame() {
  const phase = useCharmsGameStore(s => s.phase)
  return (
    <div style={FRAME}>
      {phase === 'countdown' && <Countdown />}
      {phase === 'glimpse' && <Glimpse />}
      {phase === 'find' && <Find />}
      {phase === 'resolved' && <Resolved />}
      {phase === 'gameOver' && <GameOver />}
    </div>
  )
}
