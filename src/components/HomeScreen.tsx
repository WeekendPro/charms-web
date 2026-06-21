import { useShallow } from 'zustand/shallow'
import { useNavStore } from '../store/navStore'
import { useCharmsGameStore } from '../store/charmsGameStore'
import { useSettingsStore, type Difficulty } from '../store/settingsStore'
import { useBraceletStore } from '../store/braceletStore'
import { Charm, CharmButton, CHARM_HUES, CHARM_HUE_NAMES, SHERBET, type CharmHue } from './charms'

/**
 * The Charms landing page (Sherbet). PLAY starts a Charms run at the selected
 * difficulty; the segmented switch persists the choice; the Bracelet card shows
 * the charms collected so far.
 */

/** The three difficulty tiers, rendered as a segmented candy switch. */
const TIERS: { value: Difficulty; label: string; pips: number }[] = [
  { value: 'easy', label: 'Easy', pips: 1 },
  { value: 'medium', label: 'Medium', pips: 2 },
  { value: 'hard', label: 'Hard', pips: 3 },
]

const PREVIEW_MOTIF: Record<string, string> = {
  strawberry: '🍓', tangerine: '🍑', lemon: '🍋', lime: '🍏',
  teal: '🌊', sky: '💧', grape: '⭐', bubblegum: '🌸',
}

export function HomeScreen() {
  const goGame = useNavStore(s => s.goGame)
  const startRun = useCharmsGameStore(s => s.startRun)
  const { difficulty, setDifficulty } = useSettingsStore(useShallow(s => ({
    difficulty: s.settings.difficulty, setDifficulty: s.setDifficulty,
  })))
  const earned = useBraceletStore(s => s.earned)

  const play = () => { startRun(difficulty); goGame() }

  // First few collected charms (or hue previews if the bracelet is empty).
  const slots = earned.slice(0, 5).map(k => {
    const [hue, motif] = k.split(':') as [CharmHue, string]
    return { hue, motif }
  })

  return (
    <div style={{ minHeight: '100dvh', background: SHERBET.bg, color: SHERBET.ink, fontFamily: "'Nunito',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 28px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Charm hue="bubblegum" motif="🍓" size={112} state="settling" />
      </div>
      <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 46, letterSpacing: '.05em', margin: 0, background: 'linear-gradient(180deg,#FF8FCF,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        CHARMS
      </h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 14, margin: '6px 0 0' }}>A cozy little memory game</p>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: SHERBET.inkSoft, margin: '28px 0 10px' }}>Difficulty</div>
      <div style={{ display: 'flex', gap: 8, width: '100%', background: SHERBET.sunken, border: `1.5px solid ${SHERBET.hairline}`, borderRadius: 18, padding: 5 }}>
        {TIERS.map(t => {
          const active = t.value === difficulty
          return (
            <button
              key={t.value}
              aria-pressed={active}
              onClick={() => setDifficulty(t.value)}
              style={{ flex: 1, border: 'none', borderRadius: 13, padding: '11px 0', cursor: 'pointer', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: active ? '#fff' : 'transparent', color: active ? SHERBET.ink : SHERBET.inkSoft, boxShadow: active ? '0 6px 14px rgba(217,150,120,.22),inset 0 2px 0 rgba(255,255,255,.6)' : 'none' }}
            >
              {t.label}
              <span style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(p => <i key={p} style={{ width: 6, height: 6, borderRadius: '50%', background: p < t.pips ? (active ? CHARM_HUES.bubblegum.fill : SHERBET.inkFaint) : SHERBET.inkFaint }} />)}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 18, width: '100%' }}>
        <CharmButton variant="play" onClick={play}>Play ▶</CharmButton>
      </div>

      <div style={{ marginTop: 24, width: '100%', background: '#fff', borderRadius: 24, boxShadow: '0 6px 14px rgba(217,150,120,.22)', padding: '16px 16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15 }}>Your Bracelet</h4>
          <span style={{ fontSize: 12, fontWeight: 700, color: CHARM_HUES.bubblegum.fill }}>{earned.length} found</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {slots.length > 0
            ? slots.map((c, i) => <Charm key={i} hue={c.hue} motif={c.motif} size={46} />)
            : CHARM_HUE_NAMES.slice(0, 5).map(h => <Charm key={h} hue={h} motif={PREVIEW_MOTIF[h]} size={46} style={{ filter: 'grayscale(.85)', opacity: 0.5 }} />)}
        </div>
      </div>
    </div>
  )
}
