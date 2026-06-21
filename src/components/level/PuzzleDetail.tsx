/**
 * PuzzleDetail — the panel under the focused emblem. Deliberately lean: the
 * instruction animation, the puzzle's own score bar, and a PLAY button. The
 * title lives on the emblem, so it's intentionally absent here.
 */
import type { ComponentKey } from '../../lib/components'
import { isPlayable } from '../../lib/components'
import { HowToAnimation } from '../briefing/HowToAnimation'
import { PUZZLE_THEME } from './puzzleTheme'

export interface PuzzleDetailProps {
  component: ComponentKey
  /** Best score for this puzzle (0..100). */
  score: number
  onPlay: () => void
}

export function PuzzleDetail({ component, score, onPlay }: PuzzleDetailProps) {
  const t = PUZZLE_THEME[component]
  const playable = isPlayable(component)

  return (
    <div
      data-testid={`puzzle-detail-${component}`}
      className="rounded-2xl border bg-arcade-panel p-4"
      style={{ borderColor: `${t.accent}55`, boxShadow: `0 6px 14px ${t.accent}1f, 0 2px 6px rgba(217,150,120,0.18)` }}
    >
      {/* Instruction demo (real per-puzzle animation), or a soon placeholder for Riddle */}
      <div className="rounded-xl border border-arcade-edge bg-vt-filled shadow-panel-inset grid place-items-center py-3">
        {playable ? (
          <HowToAnimation component={component} />
        ) : (
          <div className="h-[170px] grid place-items-center text-center px-6">
            <div>
              <div className="text-3xl mb-2">🧩</div>
              <p className="text-vt-dim text-sm leading-snug">{t.note}</p>
            </div>
          </div>
        )}
      </div>

      {/* This puzzle's score as a bar (hidden for the unplayable placeholder) */}
      {playable && (
        <div className="mt-3 h-2.5 rounded-full bg-arcade-well shadow-panel-inset overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: `linear-gradient(90deg,${t.accent}aa,${t.accent})` }}
          />
        </div>
      )}

      <button
        data-testid={`puzzle-play-${component}`}
        disabled={!playable}
        onClick={playable ? onPlay : undefined}
        className="w-full mt-3 py-3 rounded-xl font-pixel text-[11px] tracking-wider transition active:translate-y-px disabled:cursor-not-allowed"
        style={
          playable
            ? { color: '#FFFFFF', background: `linear-gradient(180deg,${t.accent},${t.banner})`, boxShadow: `0 6px 14px ${t.accent}55` }
            : { color: '#CDBFC1', background: '#FFF1E8' }
        }
      >
        {playable ? '▶ PLAY' : 'SOON'}
      </button>
    </div>
  )
}
