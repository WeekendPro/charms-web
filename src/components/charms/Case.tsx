import type { CSSProperties, ReactNode } from 'react'
import { SHERBET } from './tokens'

/**
 * Case — the board / play field: a sunken warm well holding a grid of Settings
 * ("board" is an acceptable internal synonym). Presentational; the consumer maps
 * Settings/Charms as children.
 */
export interface CaseProps {
  /** Columns in the grid. Default 5. */
  columns?: number
  /** Settings (and any overlay like the countdown). */
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Case({ columns = 5, children, className = '', style }: CaseProps) {
  return (
    <div
      className={`charm-case ${className}`.trim()}
      style={{
        position: 'relative',
        background: SHERBET.board,
        borderRadius: 30,
        padding: 16,
        boxShadow: 'inset 0 2px 10px rgba(180,120,90,.16)',
        display: 'grid',
        gridTemplateColumns: `repeat(${columns},1fr)`,
        gap: 12,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
