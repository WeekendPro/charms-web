import type { ReactNode } from 'react'
import { SHADOW, SHERBET } from './tokens'

/**
 * ScorePanel — the end-of-run result card: a big Fredoka score, a caption, and a
 * row of stars filling to the result. Encouraging, never a "fail" screen.
 */
export interface ScorePanelProps {
  score: number
  caption?: string
  /** Stars earned, out of `maxStars`. */
  stars: number
  maxStars?: number
  children?: ReactNode
  className?: string
}

export function ScorePanel({ score, caption = 'final score', stars, maxStars = 3, children, className = '' }: ScorePanelProps) {
  return (
    <div
      className={`charm-scorepanel ${className}`.trim()}
      style={{ width: '100%', background: '#fff', borderRadius: 28, boxShadow: SHADOW.pop, padding: '22px 22px 18px', textAlign: 'center' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: 46, fontVariantNumeric: 'tabular-nums' }}>
          {score.toLocaleString()}
        </span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: SHERBET.inkSoft, marginTop: 2 }}>
        {caption}
      </div>
      <Stars value={stars} max={maxStars} />
      {children}
    </div>
  )
}

export function Stars({ value, max = 3, size = 32 }: { value: number; max?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '16px 0 2px' }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} fill={i < value ? SHERBET.star : '#F0E2D2'}>
          <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" />
        </svg>
      ))}
    </div>
  )
}
