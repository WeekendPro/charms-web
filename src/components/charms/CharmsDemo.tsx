import { useEffect, useState, type ReactNode } from 'react'
import {
  Charm, Setting, Case, Tray, TrayCharm, HUD, FindBar, CharmButton, ScorePanel,
  SHERBET, CHARM_HUES, CHARM_HUE_NAMES, type CharmHue,
} from './index'

/**
 * CharmsDemo — a live gallery of the Charms component library, rendering the six
 * Sherbet screens (auth, home, countdown, glimpse, find, game over) from the real
 * React components. Reached at `#charms` in dev; additive, no game state touched.
 */
export function CharmsDemo() {
  return (
    <div style={{ minHeight: '100dvh', background: '#EFE4DA', padding: '28px 16px 60px', color: SHERBET.ink, fontFamily: "'Nunito',sans-serif" }}>
      <header style={{ maxWidth: 720, margin: '0 auto 26px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 30, margin: 0, background: 'linear-gradient(180deg,#FF8FCF,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          CHARMS · component library
        </h1>
        <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 13.5, margin: '4px 0 0' }}>
          The six Sherbet screens, built live from real components.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center', alignItems: 'flex-start' }}>
        <Phone caption="01 · Auth"><AuthScreen /></Phone>
        <Phone caption="02 · Home"><HomeScreen /></Phone>
        <Phone caption="03 · Countdown"><CountdownScreen /></Phone>
        <Phone caption="04 · Glimpse"><GlimpseScreen /></Phone>
        <Phone caption="05 · Find"><FindScreen /></Phone>
        <Phone caption="06 · Game over"><GameOverScreen /></Phone>
      </div>
    </div>
  )
}

function Phone({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div>
      <div
        style={{
          width: 390,
          minHeight: 720,
          background: SHERBET.bg,
          borderRadius: 42,
          boxShadow: '0 14px 30px rgba(214,140,110,.26)',
          padding: '18px 16px 26px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: SHERBET.inkSoft }}>
        {caption}
      </div>
    </div>
  )
}

const M: Record<string, ReactNode> = {
  strawberry: '🍓', tangerine: '🍑', lemon: '🍋', lime: '🍏',
  teal: '🌊', sky: '💧', grape: '⭐', bubblegum: '🌸',
}

/* ── 01 Auth ─────────────────────────────────────────────────────────────── */
function AuthScreen() {
  const corners: [CharmHue, ReactNode, React.CSSProperties][] = [
    ['strawberry', '🍓', { top: 36, left: -6 }],
    ['lemon', '🐝', { top: 28, right: -6 }],
    ['lime', '🍋', { bottom: 30, left: -2 }],
    ['bubblegum', '🌸', { bottom: 24, right: -4 }],
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 12px 0', position: 'relative' }}>
      {corners.map(([h, m, pos], i) => (
        <div key={i} style={{ position: 'absolute', ...pos }}><Charm hue={h} motif={m} size={40} /></div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8 }}>
        <Word>CHAR</Word>
        <Charm hue="lemon" size={42} />
        <Word>MS</Word>
      </div>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 14, margin: '0 0 26px', textAlign: 'center' }}>
        Glimpse the charms. Remember them. Find them.
      </p>
      <div style={{ width: '100%', background: '#fff', borderRadius: 28, boxShadow: '0 14px 30px rgba(214,140,110,.26)', padding: '22px 20px' }}>
        <Label>Email</Label>
        <Field>hello@charms.app</Field>
        <Label>Password</Label>
        <Field>••••••••</Field>
        <div style={{ marginTop: 4 }}><CharmButton style={{ background: 'linear-gradient(180deg,#FFA0D6,#FF6B6B)' }}>Sign in</CharmButton></div>
        <Divider />
        <CharmButton variant="secondary">Continue with Google</CharmButton>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button style={{ background: 'none', border: 'none', fontFamily: "'Nunito'", fontWeight: 700, fontSize: 14, color: SHERBET.inkSoft, cursor: 'pointer', textDecoration: 'underline' }}>
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  )
}
function Word({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: '.04em', background: 'linear-gradient(180deg,#FF8FCF,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
}
function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: SHERBET.inkSoft, margin: '0 4px 6px' }}>{children}</div>
}
function Field({ children }: { children: ReactNode }) {
  return <div style={{ background: SHERBET.sunken, border: `1.5px solid ${SHERBET.hairline}`, borderRadius: 16, padding: '13px 15px', marginBottom: 16, fontWeight: 600, fontSize: 16, color: SHERBET.ink }}>{children}</div>
}
function Divider() {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: SHERBET.inkFaint, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', margin: '18px 2px' }}>
    <span style={{ flex: 1, height: 1, background: SHERBET.hairline }} />or<span style={{ flex: 1, height: 1, background: SHERBET.hairline }} />
  </div>
}

/* ── 02 Home ─────────────────────────────────────────────────────────────── */
function HomeScreen() {
  const [diff, setDiff] = useState(1)
  const tiers = ['Easy', 'Medium', 'Hard']
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 8px 0' }}>
      <div style={{ marginTop: 20, marginBottom: 18 }}><Charm hue="bubblegum" motif="🍓" size={116} /></div>
      <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 46, letterSpacing: '.05em', margin: 0, background: 'linear-gradient(180deg,#FF8FCF,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>CHARMS</h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 14, margin: '6px 0 0' }}>A cozy little memory game</p>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: SHERBET.inkSoft, margin: '30px 0 10px' }}>Difficulty</div>
      <div style={{ display: 'flex', gap: 8, width: '100%', background: SHERBET.sunken, border: `1.5px solid ${SHERBET.hairline}`, borderRadius: 18, padding: 5 }}>
        {tiers.map((t, i) => (
          <button key={t} onClick={() => setDiff(i)} style={{ flex: 1, border: 'none', borderRadius: 13, padding: '11px 0', cursor: 'pointer', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: i === diff ? '#fff' : 'transparent', color: i === diff ? SHERBET.ink : SHERBET.inkSoft, boxShadow: i === diff ? '0 6px 14px rgba(217,150,120,.22),inset 0 2px 0 rgba(255,255,255,.6)' : 'none' }}>
            {t}
            <span style={{ display: 'flex', gap: 3 }}>{[0, 1, 2].map(p => <i key={p} style={{ width: 6, height: 6, borderRadius: '50%', background: p <= i ? (i === diff ? CHARM_HUES.bubblegum.fill : SHERBET.inkFaint) : SHERBET.inkFaint }} />)}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18, width: '100%' }}><CharmButton variant="play">Play ▶</CharmButton></div>

      <div style={{ marginTop: 24, width: '100%', background: '#fff', borderRadius: 24, boxShadow: '0 6px 14px rgba(217,150,120,.22)', padding: '16px 16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15 }}>Your Bracelet</h4>
          <span style={{ fontSize: 12, fontWeight: 700, color: CHARM_HUES.bubblegum.fill }}>See all →</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {CHARM_HUE_NAMES.slice(0, 4).map(h => <Charm key={h} hue={h} motif={M[h]} size={46} />)}
          {[0, 1].map(i => <Charm key={`l${i}`} hue="lemon" motif="❔" size={46} style={{ filter: 'grayscale(.9)', opacity: 0.5 }} />)}
          <span style={{ fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 13, color: SHERBET.inkSoft }}>+22</span>
        </div>
      </div>
    </div>
  )
}

/* ── 03 Countdown ────────────────────────────────────────────────────────── */
const BEATS = ['3', '2', '1', 'Go!']
function CountdownScreen() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % BEATS.length), 850)
    return () => clearInterval(t)
  }, [])
  return (
    <>
      <HUD score={0} label="Round 3" lives={3} inert />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 12px', color: SHERBET.inkSoft }}>Get ready to glimpse…</div>
      <div style={{ height: 10, borderRadius: 999, background: SHERBET.sunken, margin: '0 6px 16px', opacity: 0.6 }}><div style={{ height: '100%', width: '100%', borderRadius: 999, background: SHERBET.timer.calm }} /></div>
      <Case>
        {Array.from({ length: 25 }).map((_, k) => <Setting key={k} />)}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(255,247,240,.94),rgba(255,247,240,.7) 70%,rgba(255,247,240,0))' }} />
          <span key={i} className="charm-pick" style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: i === 3 ? 64 : 120, lineHeight: 1, background: i === 3 ? 'linear-gradient(180deg,#5BD9C9,#2FD09B)' : 'linear-gradient(180deg,#FFB0DC,#FF6B6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(255,107,129,.3))' }}>{BEATS[i]}</span>
        </div>
      </Case>
    </>
  )
}

/* ── 04 Glimpse ──────────────────────────────────────────────────────────── */
const GLIMPSE: { i: number; hue: CharmHue; m: ReactNode; slip?: boolean }[] = [
  { i: 1, hue: 'strawberry', m: '🍓' },
  { i: 3, hue: 'sky', m: '💧' },
  { i: 7, hue: 'lemon', m: '🍋' },
  { i: 11, hue: 'bubblegum', m: '🌸' },
  { i: 16, hue: 'grape', m: '⭐', slip: true },
  { i: 18, hue: 'lime', m: '🐝', slip: true },
]
function GlimpseScreen() {
  const [slip, setSlip] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlip(true), 1800)
    return () => clearTimeout(t)
  }, [])
  return (
    <>
      <HUD score={0} label="Round 3" lives={3} />
      <div style={{ textAlign: 'center', fontFamily: "'Fredoka'", fontWeight: 600, fontSize: 15, margin: '2px 0 10px' }}>
        Glimpse the charms — <b style={{ color: CHARM_HUES.bubblegum.fill }}>they slip away soon!</b>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: SHERBET.sunken, margin: '0 6px 16px', overflow: 'hidden' }}><div style={{ height: '100%', width: '70%', borderRadius: 999, background: `linear-gradient(90deg,${SHERBET.timer.calm},${SHERBET.timer.warn})` }} /></div>
      <Case>
        {Array.from({ length: 25 }).map((_, k) => {
          const ch = GLIMPSE.find(c => c.i === k)
          const order = ch ? GLIMPSE.indexOf(ch) : 0
          return (
            <Setting key={k}>
              {ch && (
                <div style={{ position: 'absolute', inset: 3 }}>
                  <Charm hue={ch.hue} motif={ch.m} size={56} index={order} state={ch.slip && slip ? 'slipping' : 'settling'} />
                </div>
              )}
            </Setting>
          )
        })}
      </Case>
    </>
  )
}

/* ── 05 Find ─────────────────────────────────────────────────────────────── */
function FindScreen() {
  const cands: { hue: CharmHue; m: ReactNode }[] = [
    { hue: 'lemon', m: '🍋' }, { hue: 'bubblegum', m: '🌸' }, { hue: 'grape', m: '⭐' }, { hue: 'lime', m: '🐝' }, { hue: 'tangerine', m: '🍑' },
  ]
  const [picked, setPicked] = useState<Record<number, 'pick' | 'miss'>>({ 1: 'pick' })
  const spent = new Set([3])
  return (
    <>
      <HUD score={1480} label="Round 3" lives={2} />
      <FindBar combo={3} comboFill={0.72} clockLabel="0:08" fractionRemaining={0.4} />
      <Case>
        {Array.from({ length: 25 }).map((_, k) => {
          const good = k === 1 ? { hue: 'strawberry' as CharmHue, m: '🍓' } : k === 7 ? { hue: 'sky' as CharmHue, m: '💧' } : null
          const bad = k === 11
          return (
            <Setting key={k} state={good ? 'good' : bad ? 'bad' : 'empty'}>
              {good && <div style={{ position: 'absolute', inset: 3 }}><Charm hue={good.hue} motif={good.m} size={56} state="settling" /></div>}
            </Setting>
          )
        })}
      </Case>
      <div style={{ marginTop: 18 }}>
        <Tray>
          {cands.map((c, idx) => (
            <TrayCharm
              key={idx}
              hue={c.hue}
              motif={c.m}
              picked={picked[idx] === 'pick'}
              miss={picked[idx] === 'miss'}
              spent={spent.has(idx)}
              onPick={() => setPicked(p => ({ ...p, [idx]: idx === 4 ? 'miss' : 'pick' }))}
            />
          ))}
        </Tray>
      </div>
      <div style={{ textAlign: 'center', color: SHERBET.inkSoft, fontSize: 13, fontWeight: 600, marginTop: 14 }}>
        Two found — <b style={{ color: SHERBET.success }}>nice eye!</b> Keep the combo going…
      </div>
    </>
  )
}

/* ── 06 Game over ────────────────────────────────────────────────────────── */
function GameOverScreen() {
  const earned: [CharmHue, ReactNode][] = [['lime', '🍏'], ['sky', '💎'], ['bubblegum', '🦋']]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 10px 0', background: 'radial-gradient(120% 80% at 50% 0%,#FFF4E9 0%,#FFEFE0 55%,#FFE8D6 100%)', margin: '-18px -16px -26px', paddingBottom: 26 }}>
      <div style={{ marginTop: 18, marginBottom: 18 }}><Charm hue="bubblegum" motif="🍓" size={108} /></div>
      <h1 style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 34, margin: '0 0 4px', background: `linear-gradient(90deg,${SHERBET.comboA},${SHERBET.comboB})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Lovely run!</h1>
      <p style={{ color: SHERBET.inkSoft, fontWeight: 600, fontSize: 15, margin: '0 0 18px' }}>You found 14 charms — sweet memory.</p>
      <div style={{ width: '100%', padding: '0 12px' }}>
        <ScorePanel score={2140} stars={2}>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${SHERBET.hairline}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: SHERBET.inkSoft, marginBottom: 12 }}>Charms earned this run</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {earned.map(([h, m], i) => <Charm key={i} hue={h} motif={m} size={54} state="settling" index={i} />)}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: SHERBET.success }}>+3 added to your Bracelet ✦</div>
          </div>
        </ScorePanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
          <CharmButton variant="primary">Play again</CharmButton>
          <CharmButton variant="secondary">Home</CharmButton>
        </div>
      </div>
    </div>
  )
}
