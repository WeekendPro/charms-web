import type { HTMLAttributes, ReactNode } from 'react'

interface ArcadePanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function ArcadePanel({ className = '', children, ...rest }: ArcadePanelProps) {
  return (
    <div
      {...rest}
      className={['bg-vt-panel border border-vt-edge shadow-vt-tile rounded-2xl', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
