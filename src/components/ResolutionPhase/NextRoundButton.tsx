import { useRef } from 'react'
import { motion } from 'framer-motion'

export type CtaVariant = 'next' | 'retry' | 'newgame'

interface Props {
  show: boolean
  onClick: () => void
  label: string
  variant: CtaVariant
}

const VARIANT_CLASSES: Record<CtaVariant, string> = {
  next:    'bg-neon-green text-white border-neon-green shadow-vt-lime hover:brightness-105',
  retry:   'bg-neon-magenta text-white border-neon-magenta shadow-vt-magenta hover:brightness-105',
  newgame: 'bg-neon-cyan text-white border-neon-cyan shadow-vt-cyan hover:brightness-105',
}

export function NextRoundButton({ show, onClick, label, variant }: Props) {
  const fired = useRef(false)

  if (!show) return null

  const handleClick = () => {
    if (fired.current) return
    fired.current = true
    onClick()
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`w-full py-3 cursor-pointer font-pixel uppercase tracking-[0.08em] text-xs rounded-full border-2 transition ${VARIANT_CLASSES[variant]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {label}
    </motion.button>
  )
}
