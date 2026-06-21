/**
 * Charms × Sherbet — design tokens (TS source of truth).
 *
 * Mirrors `mockups/sherbet/tokens.css` as typed values so the React components
 * (and a future React Native port) share one palette. Hex values are identical
 * to the CSS custom properties and the `vt-*` Tailwind colors.
 */

/** The 8-hue candy palette. Each hue ships a paired `rim` (~14% darker) used as
 *  the enamel's inner shade so a Charm reads as a deliberate object. */
export const CHARM_HUES = {
  strawberry: { fill: '#FF6B6B', rim: '#E84F58' },
  tangerine:  { fill: '#FF9E45', rim: '#E8842F' },
  lemon:      { fill: '#FFCE3A', rim: '#EDB31F' },
  lime:       { fill: '#5BC16E', rim: '#45A857' },
  teal:       { fill: '#1FC7B6', rim: '#15A99A' },
  sky:        { fill: '#46AEF7', rim: '#2E92DD' },
  grape:      { fill: '#9B8CFF', rim: '#7E6DF0' },
  bubblegum:  { fill: '#FF8FCF', rim: '#ED74BC' },
} as const

export type CharmHue = keyof typeof CHARM_HUES

export const CHARM_HUE_NAMES = Object.keys(CHARM_HUES) as CharmHue[]

/** Resolve a hue name (or a raw hex) to its `{ fill, rim }` pair. */
export function resolveHue(hue: CharmHue | string): { fill: string; rim: string } {
  if (hue in CHARM_HUES) return CHARM_HUES[hue as CharmHue]
  return { fill: hue, rim: hue }
}

/** Grounds, ink, and semantic colors. */
export const SHERBET = {
  bg: '#FFF7F0',
  board: '#FBEFE6',
  surface: '#FFFFFF',
  sunken: '#FFF1E8',
  hairline: '#F0E0D4',
  ink: '#46383B',
  inkSoft: '#9B8B8E',
  inkFaint: '#CDBFC1',
  success: '#2FD09B',
  life: '#FF6B81',
  star: '#FFCE3A',
  comboA: '#FF6B6B',
  comboB: '#FFA94D',
  timer: { calm: '#46C7B6', warn: '#FFB13C', hot: '#FF8A5B' },
} as const

/** Soft, warm-tinted elevation — never grey/black halos. */
export const SHADOW = {
  charm: '0 6px 13px rgba(196,130,100,.30)',
  tile: '0 6px 14px rgba(217,150,120,.22)',
  pop: '0 14px 30px rgba(214,140,110,.26)',
  glossInset: 'inset 0 2px 0 rgba(255,255,255,.6)',
} as const

/** Motion timings + the signature spring (overshoot → settle). */
export const MOTION = {
  settleMs: 500,
  slipMs: 1600,
  staggerMs: 80,
  /** Springy entrance: stiffness ~260, damping ~18 (overshoot then settle). */
  spring: { type: 'spring', stiffness: 260, damping: 18 } as const,
} as const

/** A small, on-brand set of charm-worthy motifs (cute + iconic + simple). */
export const CHARM_MOTIFS = [
  '🍓', '🐝', '🍋', '🌸', '⭐', '💎', '🍒', '🦋',
  '🍏', '🌊', '💧', '🍑', '🔑', '🔔', '👑', '🍀',
] as const

/** Timer easing: cool → amber → coral by fraction remaining (never punishing red). */
export function timerColor(fractionRemaining: number): string {
  if (fractionRemaining > 0.5) return SHERBET.timer.calm
  if (fractionRemaining > 0.2) return SHERBET.timer.warn
  return SHERBET.timer.hot
}
