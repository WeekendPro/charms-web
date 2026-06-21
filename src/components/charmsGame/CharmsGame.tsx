import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, HUD, SHERBET } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { Countdown } from './Countdown'
import { Glimpse } from './Glimpse'
import { Find } from './Find'
import { GameOver } from './GameOver'

/** Brief celebratory all-✓ beat between a cleared round and the next countdown. */
function Resolved() {
  const { score, lives, roundIndex, targets, beginNextRound } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, targets: s.targets, beginNextRound: s.beginNextRound,
  })))
  useEffect(() => {
    const t = setTimeout(beginNextRound, 1100)
    return () => clearTimeout(t)
  }, [beginNextRound])

  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))
  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 16, margin: '2px 0 12px', color: SHERBET.success }}>
        Round cleared! ✦
      </div>
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
