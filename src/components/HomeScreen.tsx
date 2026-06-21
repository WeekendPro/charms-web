import { useNavStore } from '../store/navStore'
import { useStaggerStore } from '../store/staggerStore'
import { useSettingsStore, type Difficulty } from '../store/settingsStore'
import { useShallow } from 'zustand/shallow'
import { Wordmark, VanishingMotif } from './ui'

/**
 * The primary landing page shown right after sign-in. PLAY (straight into
 * Infinite Stagger, the heart of the game) is pinned to the bottom thumb arc,
 * with the Difficulty selector directly beneath it.
 */

/** The three reveal difficulties, rendered as a segmented candy switch. Each tier
 *  owns a colour on the heat arc (mint → lemon → coral) and a one-line vibe. */
const DIFFICULTIES: { value: Difficulty; label: string; hint: string; active: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    hint: 'Colours light the way',
    active: 'bg-neon-green text-white shadow-vt-tile',
  },
  {
    value: 'medium',
    label: 'Medium',
    hint: 'A fleeting glance',
    active: 'bg-neon-yellow text-arcade-bg shadow-vt-tile',
  },
  {
    value: 'hard',
    label: 'Hard',
    hint: 'Trust your memory alone',
    active: 'bg-neon-red text-white shadow-vt-tile',
  },
]

export function HomeScreen() {
  const goStagger = useNavStore(s => s.goStagger)
  const startStagger = useStaggerStore(s => s.startRun)
  const { difficulty, setDifficulty } = useSettingsStore(useShallow(s => ({
    difficulty: s.settings.difficulty,
    setDifficulty: s.setDifficulty,
  })))

  const play = () => { startStagger(); goStagger() }

  const activeHint = DIFFICULTIES.find(d => d.value === difficulty)?.hint

  return (
    <div className="relative min-h-dvh overflow-hidden bg-arcade-glow text-vt-text">
      <section className="min-h-dvh flex flex-col items-center px-6 pt-10 pb-10">
        {/* Wordmark grows to fill the gap, pushing PLAY into the thumb arc. */}
        <div className="flex-1 w-full max-w-sm flex flex-col justify-center">
          {/* Brand motif: gap shapes bloom, then vanish — the name in motion. */}
          <VanishingMotif className="mb-5" />
          {/* VANISHING / TILES stacked. */}
          <Wordmark size="lg" stacked className="text-3xl" />
          <p className="mt-3 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-neon-magenta">
            A memory game
          </p>
        </div>

        {/* Bottom-pinned cluster: PLAY + difficulty. */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          {/* PLAY → Infinite Stagger. */}
          <button
            onClick={play}
            className="font-pixel uppercase tracking-[0.08em] rounded-full border-2 border-vt-lime bg-vt-lime text-white
              shadow-vt-tile transition active:translate-y-px active:scale-[0.98] py-4 text-base flex items-center
              justify-center hover:brightness-105"
          >
            Play
          </button>

          {/* Difficulty — segmented candy switch (Easy / Medium / Hard). */}
          <div>
            <p className="text-center font-display text-[10px] font-medium uppercase tracking-[0.22em] text-vt-dim mb-2">
              Difficulty
            </p>
            <div className="flex rounded-full border-2 border-vt-edge bg-vt-panel overflow-hidden">
              {DIFFICULTIES.map(d => {
                const active = d.value === difficulty
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    aria-pressed={active}
                    className={`flex-1 py-3 font-pixel uppercase text-xs tracking-[0.08em] transition
                      ${active ? d.active : 'text-vt-dim hover:text-vt-text'}`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-center text-[11px] text-vt-dim font-display min-h-[16px]">
              {activeHint}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
