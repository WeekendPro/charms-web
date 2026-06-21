import { motion } from 'framer-motion'

interface Props {
  /** When true, the badge animates in; when false, it's hidden. */
  show: boolean
}

const CONFETTI_OFFSETS = [
  { x: -50, y: -58 },
  { x:  50, y: -58 },
  { x: -70, y:   0 },
  { x:  70, y:   0 },
  { x: -40, y:  48 },
  { x:  40, y:  48 },
]
const CONFETTI_COLORS = ['#FFCE3A', '#2FD09B', '#FF8FCF', '#46AEF7', '#FFCE3A', '#FF9E45']

export function CelebrationBadge({ show }: Props) {
  if (!show) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-20">
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #2FD09B, #1FC7B6)',
          boxShadow: '0 8px 24px rgba(47,208,155,.30), 0 0 0 4px rgba(47,208,155,.14)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: [0, 1.15, 1] }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.svg
          width={38} height={38} viewBox="0 0 40 40"
          fill="none" stroke="white" strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
        >
          <motion.path d="M8 22 L17 30 L33 12" />
        </motion.svg>

        {/* Confetti dots */}
        {CONFETTI_OFFSETS.map((o, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: 6, height: 6, background: CONFETTI_COLORS[i], left: '50%', top: '50%' }}
            initial={{ x: -3, y: -3, scale: 0, opacity: 0 }}
            animate={{
              x: [-3, o.x - 3],
              y: [-3, o.y - 3],
              scale: [0, 1],
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: 'easeOut',
              times: [0, 0.4, 1],
            }}
          />
        ))}
      </motion.div>

      <motion.span
        className="mt-3 font-pixel text-xs uppercase tracking-[0.1em] text-neon-green"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        Perfect!
      </motion.span>
    </div>
  )
}
