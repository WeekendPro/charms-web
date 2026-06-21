import type { CSSProperties, ReactNode } from 'react'
import { Charm } from './Charm'
import { SHERBET, SHADOW, resolveHue, type CharmHue } from './tokens'

/**
 * Tray — the row of candidate Charms the player picks from during Find. A white
 * bottom sheet with a short label and a row of tappable Charms.
 */
export interface TrayProps {
  /** Label above the row. Keep the Find wording plain. */
  label?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Tray({ label = 'Find the charms you saw', children, className = '', style }: TrayProps) {
  return (
    <div
      className={`charm-tray ${className}`.trim()}
      style={{
        background: SHERBET.surface,
        borderRadius: 28,
        boxShadow: SHADOW.pop,
        padding: '16px 14px 18px',
        ...style,
      }}
    >
      <h4
        style={{
          margin: '0 0 12px',
          textAlign: 'center',
          fontFamily: "'Nunito',sans-serif",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: SHERBET.inkSoft,
        }}
      >
        {label}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 11 }}>
        {children}
      </div>
    </div>
  )
}

/**
 * TrayCharm — an interactive Charm candidate. Tap to pick (springy press + mint
 * selection ring); `spent` greys out a used pick; `miss` does a soft coral shake.
 */
export interface TrayCharmProps {
  hue: CharmHue | string
  motif?: ReactNode
  picked?: boolean
  spent?: boolean
  miss?: boolean
  onPick?: () => void
}

export function TrayCharm({ hue, motif, picked, spent, miss, onPick }: TrayCharmProps) {
  const { fill } = resolveHue(hue)
  return (
    <button
      type="button"
      onClick={spent ? undefined : onPick}
      disabled={spent}
      className={`charm-traycharm ${miss ? 'charm-shake' : ''} ${picked ? 'charm-pick' : ''}`.trim()}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '50%',
        border: 'none',
        cursor: spent ? 'default' : 'pointer',
        padding: 3,
        background: 'linear-gradient(160deg,#FFF7EE,#ECD9C8)',
        boxShadow: picked
          ? `${SHADOW.charm},${SHADOW.glossInset},0 0 0 5px rgba(47,208,155,.28)`
          : `${SHADOW.charm},${SHADOW.glossInset}`,
        opacity: spent ? 0.42 : 1,
        filter: spent ? 'grayscale(.5)' : undefined,
      }}
    >
      <span
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          background: `radial-gradient(125% 125% at 32% 24%,rgba(255,255,255,.62),rgba(255,255,255,0) 46%),${fill}`,
          boxShadow: 'inset 0 -6px 10px rgba(0,0,0,.18),inset 0 3px 4px rgba(255,255,255,.3)',
        }}
      >
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
          }}
        />
        <span style={{ position: 'relative', zIndex: 2, fontSize: 26, lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.16))' }}>
          {motif}
        </span>
      </span>
    </button>
  )
}

// Keep the non-interactive Charm reachable from the same module for symmetry.
export { Charm }
