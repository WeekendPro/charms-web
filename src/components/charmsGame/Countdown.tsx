import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, HUD, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

const BEATS = ['3', '2', '1', 'Go!']

/** Pre-round 3·2·1·Go centered inside the empty Case; HUD inert. */
export function Countdown() {
  const { score, lives, roundIndex, beginGlimpse } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, beginGlimpse: s.beginGlimpse,
  })))
  const [i, setI] = useState(0)

  useEffect(() => {
    if (i >= BEATS.length - 1) {
      const t = setTimeout(beginGlimpse, 650)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setI(v => v + 1), 850)
    return () => clearTimeout(t)
  }, [i, beginGlimpse])

  const isGo = i === BEATS.length - 1
  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} inert />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 12px', color: SHERBET.inkSoft }}>
        Get ready to glimpse…
      </div>
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => <Setting key={k} />)}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(255,247,240,.94),rgba(255,247,240,.7) 70%,rgba(255,247,240,0))' }} />
          <span key={i} className="charm-pick" style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: isGo ? 64 : 120, lineHeight: 1, background: isGo ? 'linear-gradient(180deg,#5BD9C9,#2FD09B)' : 'linear-gradient(180deg,#FFB0DC,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(255,107,129,.3))' }}>
            {BEATS[i]}
          </span>
        </div>
      </Case>
    </>
  )
}
