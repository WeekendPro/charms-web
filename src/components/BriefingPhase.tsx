import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { useShallow } from 'zustand/shallow'
import { COMPONENT_LABEL, isPlayable } from '../lib/components'
import { BRIEFING_OBJECTIVE } from '../lib/briefingCopy'
import { HowToAnimation } from './briefing/HowToAnimation'

export function BriefingPhase() {
  const { activeComponent, beginCountdown } = useGameStore(useShallow(s => ({
    activeComponent: s.activeComponent,
    beginCountdown: s.beginCountdown,
  })))
  const setBriefingHidden = useSettingsStore(s => s.setBriefingHidden)
  // Selector tolerates a null/non-playable component (hooks must run unconditionally).
  const dontShowAgain = useSettingsStore(s =>
    activeComponent && isPlayable(activeComponent) ? !!s.settings.hideBriefing[activeComponent] : false,
  )

  // Riddle isn't reachable (not playable); render nothing rather than guess.
  if (!activeComponent || !isPlayable(activeComponent)) return null

  const title = COMPONENT_LABEL[activeComponent].toUpperCase()
  const objective = BRIEFING_OBJECTIVE[activeComponent]

  return (
    <div className="flex flex-col items-center text-center gap-5 w-full max-w-[360px]">
      <h2 className="font-pixel font-bold text-[15px] text-neon-cyan tracking-wide">{title}</h2>
      <p className="text-vt-text text-[15px] leading-relaxed max-w-[300px]">{objective}</p>

      <div className="text-[9px] font-pixel tracking-[0.2em] text-vt-dim">HOW IT WORKS</div>
      <div className="rounded-xl border border-arcade-edge bg-arcade-panel shadow-panel-inset p-5">
        <HowToAnimation component={activeComponent} />
      </div>

      <div className="inline-flex flex-col items-stretch w-full">
        <button
          data-testid="briefing-play"
          onClick={beginCountdown}
          className="font-pixel font-bold text-[15px] tracking-[0.15em] text-white rounded-full py-5 w-full transition active:translate-y-px shadow-vt-tile"
          style={{
            background: 'linear-gradient(135deg,#46AEF7,#2E92DD)',
            boxShadow: '0 6px 14px rgba(70,174,247,.30), inset 0 2px 0 rgba(255,255,255,.45)',
          }}
        >
          PLAY
        </button>
        <div className="text-vt-dim text-[11px] mt-3">3 lives · Play starts the countdown</div>

        {/* Opt out of this puzzle's instructions (persisted as a user setting). */}
        <button
          type="button"
          role="checkbox"
          aria-checked={dontShowAgain}
          data-testid="briefing-dont-show"
          onClick={() => setBriefingHidden(activeComponent, !dontShowAgain)}
          className="mt-4 mx-auto flex items-center gap-2 text-vt-dim hover:text-vt-text transition-colors"
        >
          <span
            className={`grid place-items-center w-[18px] h-[18px] rounded border-2 transition-colors ${
              dontShowAgain ? 'bg-neon-cyan border-neon-cyan' : 'border-arcade-edge bg-transparent'
            }`}
          >
            {dontShowAgain && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 6" />
              </svg>
            )}
          </span>
          <span className="text-[12px]">Don't show this again</span>
        </button>
      </div>
    </div>
  )
}
