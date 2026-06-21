// Maps a palette id (stored on Gap.color) to literal Tailwind classes.
// Kept client-side so shared logic never references Tailwind class strings.

// Five Sherbet candy hues for color-coded rounds (see mockups/sherbet/tokens.css).
// The goal is recall, not trickery — so the set spans the wheel (sky, bubblegum,
// lime, grape, lemon) and is spread across LIGHTNESS as well as hue for
// colour-blind safety. Keep BORDER and FILL on the same hex per id so a gap's
// dashed outline matches its filled piece.
const BORDER: Record<string, string> = {
  cyan: 'border-[#46AEF7]',   // sky
  magenta: 'border-[#FF8FCF]', // bubblegum
  green: 'border-[#5BC16E]',  // lime
  purple: 'border-[#9B8CFF]', // grape
  yellow: 'border-[#FFCE3A]', // lemon
}

const FILL: Record<string, string> = {
  cyan: 'bg-[#46AEF7]',
  magenta: 'bg-[#FF8FCF]',
  green: 'bg-[#5BC16E]',
  purple: 'bg-[#9B8CFF]',
  yellow: 'bg-[#FFCE3A]',
}

/** Border-color class for a gap's palette id (falls back to a neutral border). */
export function gapBorderClass(id: string | undefined): string {
  return (id && BORDER[id]) || 'border-gray-300/70'
}

/** Fill (bg) class for a gap's palette id (falls back to neutral gray). */
export function gapFillClass(id: string | undefined): string {
  return (id && FILL[id]) || 'bg-gray-400'
}
