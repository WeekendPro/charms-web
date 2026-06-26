import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Case, Setting, Charm, Tray, TrayCharm, HUD, FindBar } from '../charms'
import { CASE_SETTINGS } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `0:${String(s).padStart(2, '0')}`
}

/** Recall phase: tap the charms you saw from the Tray, against the clock. */
export function Find() {
  const {
    score, lives, roundIndex, streak, config, targets, tray, findStartedAt, pickTray, findTimeout,
  } = useCharmsGameStore(useShallow(s => ({
    score: s.score, lives: s.lives, roundIndex: s.roundIndex, streak: s.streak, config: s.config,
    targets: s.targets, tray: s.tray, findStartedAt: s.findStartedAt, pickTray: s.pickTray, findTimeout: s.findTimeout,
  })))
  const [remaining, setRemaining] = useState(config.findMs)

  useEffect(() => {
    const tick = () => {
      const left = findStartedAt + config.findMs - Date.now()
      setRemaining(left)
      if (left <= 0) findTimeout()
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [findStartedAt, config.findMs, findTimeout])

  const fraction = Math.max(0, Math.min(1, remaining / config.findMs))
  const bySetting = new Map(targets.map(t => [t.settingIndex, t]))

  return (
    <>
      <HUD score={score} label={`Round ${roundIndex + 1}`} lives={lives} />
      <FindBar streak={Math.max(1, streak)} streakFill={fraction} clockLabel={fmt(remaining)} fractionRemaining={fraction} />
      <Case>
        {Array.from({ length: CASE_SETTINGS }).map((_, k) => {
          const ch = bySetting.get(k)
          const found = ch?.found
          return (
            <Setting key={k} state={found ? 'good' : 'empty'}>
              {found && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm hue={ch!.hue} motif={ch!.motif} size={56} state="settling" />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
      <div style={{ marginTop: 18 }}>
        <Tray>
          {tray.map(item => (
            <TrayCharm
              key={item.key}
              hue={item.hue}
              motif={item.motif}
              spent={item.spent}
              onPick={() => pickTray(item.key)}
            />
          ))}
        </Tray>
      </div>
    </>
  )
}
