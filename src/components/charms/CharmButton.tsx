import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SHADOW, SHERBET } from './tokens'

/**
 * CharmButton — full-width candy pill. `primary` is a mint→ glossy fill with
 * white ink; `secondary` is a white surface with hairline; `play` is the big
 * hero CTA. Everything you touch squishes (scale 0.96) and bounces back.
 */
type Variant = 'primary' | 'secondary' | 'play'

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: {
    color: '#fff',
    background: 'linear-gradient(180deg,#43E0AB,#2FD09B)',
    boxShadow: `${SHADOW.tile},${SHADOW.glossInset}`,
  },
  secondary: {
    color: SHERBET.ink,
    background: '#fff',
    border: `1.5px solid ${SHERBET.hairline}`,
    boxShadow: `${SHADOW.tile},${SHADOW.glossInset}`,
  },
  play: {
    color: '#fff',
    background: 'linear-gradient(180deg,#43E0AB,#2FD09B)',
    boxShadow: '0 12px 24px rgba(47,208,155,.4),inset 0 2px 0 rgba(255,255,255,.6)',
  },
}

export interface CharmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

export function CharmButton({ variant = 'primary', fullWidth = true, className = '', children, style, ...rest }: CharmButtonProps) {
  const isPlay = variant === 'play'
  return (
    <button
      {...rest}
      className={`charm-button ${className}`.trim()}
      style={{
        fontFamily: "'Fredoka',sans-serif",
        fontWeight: isPlay ? 700 : 600,
        fontSize: isPlay ? 24 : 18,
        letterSpacing: isPlay ? '.03em' : undefined,
        border: 'none',
        width: fullWidth ? '100%' : undefined,
        padding: isPlay ? '20px 0' : '16px 0',
        borderRadius: isPlay ? 26 : 999,
        cursor: 'pointer',
        transition: 'transform .12s',
        ...VARIANT_STYLE[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
