import type { CSSProperties, ReactNode } from 'react'
import { SHERBET } from './tokens'

/**
 * Setting — a single empty round slot in the Case where a Charm sits
 * (replaces the old "cell"). Sunken and quiet at rest; on a Find pick it
 * shows a mint success ring (`good`) or a soft coral miss ring (`bad`).
 */
export type SettingState = 'empty' | 'good' | 'bad'

export interface SettingProps {
  state?: SettingState
  /** A settled Charm, or a badge. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function Setting({ state = 'empty', children, className = '', style }: SettingProps) {
  const ring =
    state === 'good'
      ? `inset 0 0 0 2px rgba(47,208,155,.5),0 0 0 4px rgba(47,208,155,.22)`
      : state === 'bad'
        ? `inset 0 0 0 2px rgba(255,107,129,.45)`
        : `inset 0 2px 4px rgba(180,120,90,.14),inset 0 -1px 0 rgba(255,255,255,.5)`

  return (
    <div
      className={`charm-setting ${state === 'bad' ? 'charm-shake' : ''} ${className}`.trim()}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '50%',
        background: SHERBET.sunken,
        border: `1px solid ${SHERBET.hairline}`,
        boxShadow: ring,
        display: 'grid',
        placeItems: 'center',
        ...style,
      }}
    >
      {children}
      {state === 'good' && <Badge kind="check" />}
      {state === 'bad' && <Badge kind="cross" />}
    </div>
  )
}

function Badge({ kind }: { kind: 'check' | 'cross' }) {
  const isCheck = kind === 'check'
  return (
    <div
      className="charm-badge"
      style={{
        position: 'absolute',
        right: -3,
        top: -3,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: isCheck ? SHERBET.success : SHERBET.surface,
        border: isCheck ? 'none' : `2px solid ${SHERBET.life}`,
        display: 'grid',
        placeItems: 'center',
        boxShadow: isCheck ? '0 3px 7px rgba(47,208,155,.5)' : '0 6px 14px rgba(217,150,120,.22)',
        zIndex: 4,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={isCheck ? 14 : 12}
        height={isCheck ? 14 : 12}
        fill="none"
        stroke={isCheck ? '#fff' : SHERBET.life}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isCheck ? <path d="M5 13l4 4L19 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
    </div>
  )
}
