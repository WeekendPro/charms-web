import { useEffect, useState } from 'react'

const SEGMENTS = 10

/**
 * Full-screen arcade loading overlay — a segmented cyan "power meter" that lights
 * up in a travelling sweep, with a pixel-font LOADING label and faint CRT
 * scanlines, over a dimmed scrim. Driven by `active`; waits `delay`ms before it
 * paints so sub-100ms calls never flash. Purely presentational (no store access).
 */
export function ArcadeLoader({ active, delay = 120 }: { active: boolean; delay?: number }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) {
      setShow(false)
      return
    }
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [active, delay])

  if (!show) return null

  return (
    <div
      data-testid="arcade-loader"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 50%, rgba(255,247,240,0.82), rgba(251,239,230,0.94))',
      }}
    >
      <div
        className="flex gap-[5px] p-[7px] rounded-2xl border"
        style={{
          borderColor: '#F0E0D4',
          background: '#FFFFFF',
          boxShadow: '0 6px 14px rgba(217,150,120,.22)',
        }}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="arcade-seg block w-[14px] h-[30px] rounded-[4px]"
            style={{ backgroundColor: '#FFF1E8', animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      <div
        className="font-pixel text-[11px] tracking-[0.06em] text-vt-cyan"
      >
        LOADING
      </div>

      <div className="absolute inset-0 arcade-scanlines opacity-20" aria-hidden />
    </div>
  )
}
