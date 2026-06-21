import type { CSSProperties, ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { resolveHue, SHADOW, MOTION, type CharmHue } from './tokens'

/**
 * Charm — the round enamel content piece (replaces the old "tile").
 *
 * A candy-hue disc with a cream/metallic **bezel** rim, a glossy **enamel**
 * face, a top **gloss** sheen, and a centered iconic **motif**. The aesthetic
 * target is an enamel pin / gachapon trinket — round, tactile, a little sweet.
 *
 * States drive the signature motion:
 *  - `idle`      resting (gentle breathing handled by the parent if wanted)
 *  - `settling`  springy scale-settle entrance (memorize: charms appear)
 *  - `slipping`  soft shimmer-fade exit (the "slip away" vanish — never a pop)
 */
export type CharmState = 'idle' | 'settling' | 'slipping'

export interface CharmProps {
  /** One of the 8 palette hues, or a raw hex. */
  hue: CharmHue | string
  /** The iconic motif — an emoji string or inline SVG node. */
  motif?: ReactNode
  /** Disc diameter in px. Default 64. */
  size?: number
  /** Drives the entrance/exit animation. Default `idle`. */
  state?: CharmState
  /** Stagger index — delays settle/slip by `index × staggerMs` for wave motion. */
  index?: number
  className?: string
  style?: CSSProperties
}

const variants: Variants = {
  hidden: { scale: 0.3, opacity: 0 },
  idle: { scale: 1, opacity: 1, y: 0 },
  settling: { scale: 1, opacity: 1, y: 0 },
  // Soft lift + fade; the shimmer overlay (CSS) carries the sweep. No blur-bloom.
  slipping: { scale: 1.05, opacity: 0, y: -4 },
}

export function Charm({
  hue,
  motif,
  size = 64,
  state = 'idle',
  index = 0,
  className = '',
  style,
}: CharmProps) {
  const { fill } = resolveHue(hue)
  const delay = (index * MOTION.staggerMs) / 1000

  const bezelStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    padding: Math.max(2, Math.round(size * 0.045)),
    background: 'linear-gradient(160deg,#FFF7EE,#ECD9C8)',
    boxShadow: `${SHADOW.charm},${SHADOW.glossInset}`,
    ...style,
  }
  const enamelStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    background: `radial-gradient(125% 125% at 32% 24%,rgba(255,255,255,.62),rgba(255,255,255,0) 46%),${fill}`,
    boxShadow: 'inset 0 -6px 10px rgba(0,0,0,.18),inset 0 3px 4px rgba(255,255,255,.3)',
  }

  const transition =
    state === 'slipping'
      ? { duration: MOTION.slipMs / 1000, ease: 'easeInOut' as const, delay }
      : { ...MOTION.spring, delay }

  return (
    <motion.div
      className={`charm-disc ${className}`.trim()}
      style={bezelStyle}
      variants={variants}
      initial={state === 'settling' ? 'hidden' : 'idle'}
      animate={state}
      transition={transition}
    >
      <span style={enamelStyle}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '9%',
            left: '17%',
            width: '52%',
            height: '33%',
            borderRadius: '50%',
            background: 'linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,0))',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <span
          style={{
            position: 'relative',
            zIndex: 2,
            fontSize: Math.round(size * 0.46),
            lineHeight: 1,
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.16))',
          }}
        >
          {motif}
        </span>
        {state === 'slipping' && <span className="charm-shimmer" aria-hidden />}
      </span>
    </motion.div>
  )
}
