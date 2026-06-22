import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, SHERBET, CHARM_HUES, MOTION } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

/**
 * Memorize phase. Charms arrive one at a time (staggered, not all at once);
 * each carries a draining border-timer on its rim that empties over one brief
 * window, then that charm slips away. The timings reuse the old Phosphor reveal
 * curve — `glimpseStepMs` between arrivals, `glimpseBloomMs` per charm on screen.
 * Find begins once the last charm has slipped.
 */
export function Glimpse() {
  const { score, lives, roundIndex, targets, beginFind } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, targets: s.targets, beginFind: s.beginFind,
  })))
  // Per-charm lifecycle, keyed by arrival order: not-yet-arrived → arrived → slipped.
  const [arrived, setArrived] = useState<Set<number>>(() => new Set())
  const [slipped, setSlipped] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    setArrived(new Set())
    setSlipped(new Set())
    const timers: ReturnType<typeof setTimeout>[] = []
    let lastEnd = 0
    targets.forEach((_, order) => {
      const arriveAt = order * MOTION.glimpseStepMs
      const slipAt = arriveAt + MOTION.glimpseBloomMs
      timers.push(setTimeout(() => setArrived(prev => new Set(prev).add(order)), arriveAt))
      timers.push(setTimeout(() => setSlipped(prev => new Set(prev).add(order)), slipAt))
      lastEnd = Math.max(lastEnd, slipAt + MOTION.slipMs)
    })
    timers.push(setTimeout(beginFind, lastEnd))
    return () => timers.forEach(clearTimeout)
  }, [targets, beginFind])

  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 10px' }}>
        Glimpse them as they arrive — <b style={{ color: CHARM_HUES.bubblegum.fill }}>each one slips away fast!</b>
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          const order = ch ? targets.indexOf(ch) : 0
          const isArrived = ch != null && arrived.has(order)
          const isSlipped = slipped.has(order)
          return (
            <Setting key={k}>
              {ch && isArrived && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm
                    hue={ch.hue}
                    motif={ch.motif}
                    size={56}
                    state={isSlipped ? 'slipping' : 'settling'}
                    timerMs={MOTION.glimpseBloomMs}
                  />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
      <div style={{ textAlign: 'center', color: SHERBET.inkFaint, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 18 }}>
        memorize · charms arrive one by one, then slip away
      </div>
    </>
  )
}
