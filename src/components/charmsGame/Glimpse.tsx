import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, SHERBET, CHARM_HUES } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

/** Memorize phase: Charms settle into their Settings, hold, then slip away. */
export function Glimpse() {
  const { score, lives, roundIndex, config, targets, beginFind } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, config: s.config, targets: s.targets, beginFind: s.beginFind,
  })))
  const [slipping, setSlipping] = useState(false)

  useEffect(() => {
    setSlipping(false)
    const slipLead = 700
    const slipAt = Math.max(0, config.glimpseMs - slipLead)
    const slipTimer = setTimeout(() => setSlipping(true), slipAt)
    const findTimer = setTimeout(beginFind, config.glimpseMs)
    return () => { clearTimeout(slipTimer); clearTimeout(findTimer) }
  }, [config.glimpseMs, beginFind])

  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 10px' }}>
        Glimpse the charms — <b style={{ color: CHARM_HUES.bubblegum.fill }}>they slip away soon!</b>
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          const order = ch ? targets.indexOf(ch) : 0
          return (
            <Setting key={k}>
              {ch && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm hue={ch.hue} motif={ch.motif} size={56} index={order} state={slipping ? 'slipping' : 'settling'} />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
      <div style={{ textAlign: 'center', color: SHERBET.inkFaint, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 18 }}>
        memorize · charms settle in, then slip away
      </div>
    </>
  )
}
