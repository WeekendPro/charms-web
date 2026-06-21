import { useShallow } from 'zustand/shallow'
import { Charm, ScorePanel, CharmButton, SHERBET, type CharmHue } from '../charms'
import { starsForRounds } from '../../lib/charmsRound'
import { useCharmsGameStore } from '../../store/charmsGameStore'
import { useNavStore } from '../../store/navStore'

/** Encouraging end-of-run screen — never a "fail" screen. */
export function GameOver() {
  const { score, roundsCleared, earnedKeys, difficulty, startRun, exit } = useCharmsGameStore(useShallow(s => ({
    score: s.score, roundsCleared: s.roundsCleared, earnedKeys: s.earnedKeys, difficulty: s.difficulty,
    startRun: s.startRun, exit: s.exit,
  })))
  const goHome = useNavStore(s => s.goHome)

  const stars = starsForRounds(roundsCleared)
  const found = earnedKeys.length
  const earned = earnedKeys.slice(0, 8).map(k => {
    const [hue, motif] = k.split(':') as [CharmHue, string]
    return { hue, motif }
  })

  const playAgain = () => { startRun(difficulty) }
  const home = () => { exit(); goHome() }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 10px 0' }}>
      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <Charm hue="bubblegum" motif="🍓" size={108} state="settling" />
      </div>
      <h1 style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 34, margin: '0 0 4px', background: `linear-gradient(90deg,${SHERBET.comboA},${SHERBET.comboB})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        Lovely run!
      </h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 15, margin: '0 0 18px' }}>
        You found {found} charm{found === 1 ? '' : 's'} — sweet memory.
      </p>
      <div style={{ width: '100%', padding: '0 12px' }}>
        <ScorePanel score={score} stars={stars}>
          {earned.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${SHERBET.hairline}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: SHERBET.inkSoft, marginBottom: 12 }}>
                Charms earned this run
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {earned.map((e, i) => <Charm key={i} hue={e.hue} motif={e.motif} size={48} state="settling" index={i} />)}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: SHERBET.success }}>
                Added to your Bracelet ✦
              </div>
            </div>
          )}
        </ScorePanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
          <CharmButton variant="primary" onClick={playAgain}>Play again</CharmButton>
          <CharmButton variant="secondary" onClick={home}>Home</CharmButton>
        </div>
      </div>
    </div>
  )
}
