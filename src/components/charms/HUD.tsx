import type { CSSProperties } from 'react'
import { SHERBET, SHADOW, timerColor } from './tokens'

/**
 * HUD — the floating game chrome: score (Fredoka, tabular), a round/level pill,
 * coral lives, and an optional Find row (streak meter + clock). Light and calm so
 * the Case stays the star.
 */
export interface HudProps {
  score: number
  /** Round/level pill text, e.g. "Round 3". */
  label?: string
  lives: number
  maxLives?: number
  /** Dim the whole HUD (e.g. during the pre-roll countdown). */
  inert?: boolean
  /** Briefly enlarge + green the score (e.g. when a payout lands). */
  scoreBump?: boolean
  className?: string
  style?: CSSProperties
}

export function HUD({ score, label, lives, maxLives = 3, inert = false, scoreBump = false, className = '', style }: HudProps) {
  return (
    <div
      className={`charm-hud ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '6px 4px 12px',
        opacity: inert ? 0.6 : 1,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontWeight: 600,
          fontSize: 22,
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          transformOrigin: 'left center',
          transition: 'transform .15s ease, color .15s ease',
          transform: scoreBump ? 'scale(1.14)' : undefined,
          color: scoreBump ? SHERBET.success : undefined,
        }}
      >
        {score.toLocaleString()}
        <small style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: SHERBET.inkSoft }}>
          pts
        </small>
      </div>

      {label && (
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontWeight: 600,
            fontSize: 14,
            background: SHERBET.surface,
            padding: '6px 14px',
            borderRadius: 999,
            boxShadow: `${SHADOW.tile},${SHADOW.glossInset}`,
          }}
        >
          {label}
        </div>
      )}

      <Lives lives={lives} max={maxLives} />
    </div>
  )
}

export function Lives({ lives, max = 3 }: { lives: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: max }).map((_, i) => {
        const lost = i >= lives
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill={lost ? SHERBET.inkFaint : SHERBET.life}
            style={{ filter: lost ? 'none' : 'drop-shadow(0 2px 2px rgba(255,107,129,.4))', transform: lost ? 'scale(.82)' : undefined }}
          >
            <path d="M12 21s-7-4.6-9.3-9C1 8.5 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 5 3.5 3.3 7C19 16.4 12 21 12 21z" />
          </svg>
        )
      })}
    </div>
  )
}

/**
 * FindBar — the streak meter + clock row shown during Find. The clock eases
 * teal → amber → coral by fraction remaining (never a punishing red).
 */
export interface FindBarProps {
  streak: number
  /** Streak meter fill, 0–1. */
  streakFill?: number
  /** Seconds remaining, e.g. "0:08". */
  clockLabel: string
  /** Fraction of the Find clock remaining, 0–1 — drives the color + ring. */
  fractionRemaining: number
  className?: string
}

export function FindBar({ streak, streakFill = 0.7, clockLabel, fractionRemaining, className = '' }: FindBarProps) {
  const tc = timerColor(fractionRemaining)
  const deg = Math.round(360 * Math.max(0, Math.min(1, fractionRemaining)))
  return (
    <div className={`charm-findbar ${className}`.trim()} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 6px 14px' }}>
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontWeight: 600,
          fontSize: 15,
          background: `linear-gradient(90deg,${SHERBET.streakA},${SHERBET.streakB})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          whiteSpace: 'nowrap',
        }}
      >
        Streak <span style={{ fontSize: 19 }}>×{streak}</span>
      </div>
      <div style={{ flex: 1, height: 10, borderRadius: 999, background: SHERBET.sunken, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.06)' }}>
        <div style={{ height: '100%', width: `${Math.round(streakFill * 100)}%`, borderRadius: 999, background: `linear-gradient(90deg,${SHERBET.streakA},${SHERBET.streakB})` }} />
      </div>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 600, fontSize: 14, color: tc, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 18, height: 18, borderRadius: 999, background: `conic-gradient(${tc} ${deg}deg,#F3E2D6 0)` }} />
        {clockLabel}
      </div>
    </div>
  )
}

/**
 * BonusDrain — the round-clear payout row that replaces the FindBar for one beat.
 * It mirrors FindBar's shape (Streak pill + meter + conic dot) but the meter drains
 * `fill` → 0 while a single big `+bonus` headline lifts off it toward the score.
 * Purely presentational: the caller drives `fill`/`lift` over one eased timeline.
 */
export interface BonusDrainProps {
  /** Streak value, frozen at the round-clear count. */
  streak: number
  /** Meter fill for this frame, 0–1 (drains to 0). */
  fill: number
  /** The headline payout shown as the lifting `+N`. */
  bonus: number
  /** Eased progress 0–1 — positions, fades, and shrinks the lift tag. */
  lift: number
  className?: string
}

export function BonusDrain({ streak, fill, bonus, lift, className = '' }: BonusDrainProps) {
  const f = Math.max(0, Math.min(1, fill))
  const tc = timerColor(f)
  const deg = Math.round(360 * f)
  return (
    <div className={`charm-bonusdrain ${className}`.trim()} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, margin: '2px 6px 14px' }}>
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontWeight: 600,
          fontSize: 15,
          background: `linear-gradient(90deg,${SHERBET.streakA},${SHERBET.streakB})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          whiteSpace: 'nowrap',
        }}
      >
        Streak <span style={{ fontSize: 19 }}>×{streak}</span>
      </div>
      <div style={{ flex: 1, height: 10, borderRadius: 999, background: SHERBET.sunken, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.06)' }}>
        <div style={{ height: '100%', width: `${Math.round(f * 100)}%`, borderRadius: 999, background: tc, transition: 'background .2s linear' }} />
      </div>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 600, fontSize: 14, color: tc, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 18, height: 18, borderRadius: 999, background: `conic-gradient(${tc} ${deg}deg,#F3E2D6 0)` }} />
        +{bonus}
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 86,
          top: -2,
          fontFamily: "'Fredoka',sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: SHERBET.success,
          pointerEvents: 'none',
          opacity: 1 - lift,
          transform: `translate(${-14 * lift}px, ${-74 * lift}px) scale(${1 - 0.35 * lift})`,
        }}
      >
        +{bonus}
      </div>
    </div>
  )
}
