import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'go' | 'danger' | 'ghost' | 'accent'
type Size = 'sm' | 'md' | 'lg'

// Sherbet buttons: clean candy pills on white. The default/primary variant is a
// filled candy pill with white ink and a soft drop shadow; the others are
// outline/secondary — white surface with a candy border + matching candy ink that
// fills in softly on hover. `ghost` is the quiet neutral on a hairline.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'border-vt-cyan bg-vt-cyan text-white shadow-vt-tile hover:brightness-105',
  go: 'border-vt-lime bg-vt-lime text-white shadow-vt-tile hover:brightness-105',
  danger: 'border-vt-red text-vt-red bg-vt-panel hover:bg-vt-red/10',
  accent: 'border-vt-magenta text-vt-magenta bg-vt-panel hover:bg-vt-magenta/10',
  ghost: 'border-vt-edge text-vt-dim bg-vt-panel hover:border-vt-cyan hover:text-vt-cyan',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'py-2 px-3 text-[10px]',
  md: 'py-3 px-4 text-xs',
  lg: 'py-4 px-5 text-sm',
}

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
}

export function NeonButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: NeonButtonProps) {
  return (
    <button
      {...rest}
      className={[
        'font-pixel uppercase tracking-[0.08em] rounded-full border-2',
        'transition active:translate-y-px active:scale-[0.97]',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  )
}
