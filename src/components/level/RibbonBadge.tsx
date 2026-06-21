/**
 * RibbonBadge — hexagon emblem + glyph + pixel title (the "hex tile" design).
 * Ported from mockups/badge-concepts.html (concept 2).
 */
import type { ReactNode } from 'react'

export interface RibbonBadgeProps {
  /** Center content (a glyph component or node) */
  glyph: ReactNode
  /** CSS background string for the hex interior */
  centerBg: string
  /** Badge label — rendered uppercase */
  title: string
  state: 'locked' | 'incomplete' | 'complete' | 'soon'
  /** Score shown inside the gold star when complete */
  score?: number
  /** Accent: green = The Classic; cyan = the badges (hex border + title + card glow) */
  cardAccent?: 'cyan' | 'green'
  /** Force vibrant state regardless of completion (e.g. PLAY badge) */
  vibrant?: boolean
  /** Optional caption rendered below the footer (e.g. the level name on the PLAY badge) */
  caption?: string
  disabled?: boolean
  onClick?: () => void
  'data-testid'?: string
}

/** Star clip-path (matches mockup .star-fill) */
const STAR_CLIP =
  'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'

/** Star outline polygon (same proportions as STAR_CLIP, in a 0..100 box) */
const STAR_POINTS = '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35'

/** A gold star that fills from the bottom in proportion to the score (0–100). */
function ScoreStar({ score = 0 }: { score?: number }) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div className="relative w-[46px] h-[46px]">
      {/* Fill area, clipped to the star shape: faint track + gold fill rising from the bottom */}
      <div className="absolute inset-0" style={{ clipPath: STAR_CLIP }}>
        <div className="absolute inset-0" style={{ background: 'rgba(255,206,58,0.20)' }} />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: `${pct}%`, background: 'linear-gradient(0deg,#FFB13C,#FFCE3A)' }}
        />
      </div>
      {/* Crisp star outline (overflow visible so the stroke isn't clipped) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 4px rgba(255,177,60,.45))' }}
      >
        <polygon points={STAR_POINTS} fill="none" stroke="#FFB13C" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      {/* Score, readable over both the gold fill and the faint track */}
      <span
        className="absolute inset-0 grid place-items-center text-[11px] font-black text-vt-text"
        style={{ textShadow: '0 1px 2px rgba(255,255,255,.9), 0 0 2px rgba(255,255,255,.8)' }}
      >
        {score}
      </span>
    </div>
  )
}

function FooterContent({ state, score }: { state: RibbonBadgeProps['state']; score?: number }) {
  if (state === 'locked') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B8B8E" strokeWidth="2">
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    )
  }
  if (state === 'incomplete') {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CDBFC1"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.8 5.5 21 7.5 13.5 2 9h7z" />
      </svg>
    )
  }
  if (state === 'complete') {
    return <ScoreStar score={score} />
  }
  // soon
  return <span className="text-[8px] font-pixel tracking-wider text-vt-dim">SOON</span>
}

export function RibbonBadge({
  glyph,
  centerBg,
  title,
  state,
  score,
  cardAccent = 'cyan',
  vibrant: vibrantProp,
  caption,
  disabled,
  onClick,
  'data-testid': testId,
}: RibbonBadgeProps) {
  // Crest accent: green marks The Classic, cyan marks the badges. The banner
  // uses a deeper shade of the same so its white title stays readable.
  const accent = cardAccent === 'green' ? '#2FD09B' : '#46AEF7'
  const bannerColor = cardAccent === 'green' ? '#1FA985' : '#2E92DD'
  const vibrant = vibrantProp || state === 'complete'
  // Dim ONLY when the puzzle isn't available yet (locked, or "coming soon").
  // Unlocked puzzles — incomplete or complete — render at full color.
  const dull = state === 'locked' || state === 'soon' ? 'opacity-50 grayscale-[.5]' : ''

  let cardBorderClass: string
  if (cardAccent === 'green') {
    cardBorderClass = 'border-neon-green shadow-[0_6px_14px_rgba(47,208,155,.28)]'
  } else if (vibrant) {
    cardBorderClass = 'border-[#9BD7FB] shadow-[0_6px_14px_rgba(70,174,247,.28)]'
  } else {
    cardBorderClass = 'border-arcade-edge'
  }

  return (
    <button
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`relative rounded-xl border-2 ${cardBorderClass} bg-arcade-panel shadow-panel-inset px-3 pt-4 pb-2 flex flex-col items-center justify-center w-full transition`}
    >
      {/* Crest: shield emblem (glyph up top) + a banner carrying the title */}
      <div className={`relative flex flex-col items-center ${dull}`}>
        <div className="relative shrink-0" style={{ width: '124px', height: '132px' }}>
          {/* Shield interior (glyph background), clipped to the shield path */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "path('M62 4 L116 23 V66 C116 99 95 120 62 130 C29 120 8 99 8 66 V23 Z')",
              background: centerBg,
            }}
          />
          {/* Shield border (+ faint inner outline) */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 124 132"
            preserveAspectRatio="none"
            style={{ filter: `drop-shadow(0 3px 5px rgba(217,150,120,0.30)) drop-shadow(0 0 5px ${accent}33)` }}
          >
            <path d="M62 4 L116 23 V66 C116 99 95 120 62 130 C29 120 8 99 8 66 V23 Z" fill="none" stroke={accent} strokeWidth="3" />
            <path d="M62 13 L108 29 V66 C108 95 89 113 62 122 C35 113 16 95 16 66 V29 Z" fill="none" stroke={accent} strokeWidth="1" opacity="0.45" />
          </svg>
          {/* Glyph on the shield's center, raised ~3px for optical balance
              (the banner below adds visual weight, so dead-center reads low) */}
          <div className="absolute left-0 right-0 grid place-items-center" style={{ top: '27px', height: '72px' }}>
            {glyph}
          </div>
          {/* Banner across the lower third, carrying the title */}
          <svg
            viewBox="0 0 160 40"
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '4px', width: '142px', filter: 'drop-shadow(0 2px 3px rgba(217,150,120,0.35))' }}
          >
            <path d="M4 7 L156 7 L147 22 L156 37 L4 37 L13 22 Z" fill={bannerColor} stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
            <text
              x="80" y="23" textAnchor="middle" dominantBaseline="central" fill="#fff"
              fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing=".3"
            >
              {title.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>

      {/* Footer: lock / hollow star / gold star with score / SOON */}
      <div className="h-11 grid place-items-center mt-2">
        <FooterContent state={state} score={score} />
      </div>

      {/* Optional caption (e.g. the level name on the PLAY badge) — never wraps */}
      {caption && (
        <div className="text-[13px] font-bold tracking-wide text-neon-cyan whitespace-nowrap leading-tight">
          {caption}
        </div>
      )}
    </button>
  )
}
