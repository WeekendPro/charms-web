/**
 * Center glyphs for RibbonBadge, ported from mockups/level-screen.html.
 * Note: BADGE_CENTER_BG is exported separately so that fast-refresh isn't affected —
 * keep all non-component exports in this file intentionally (they're tightly coupled).
 */
/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties } from 'react'

/** Currently unused — kept for reference (the main badge now uses ClassicTetrominoGlyph). */
export function PlayGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

/** Upright-T tetromino drawn as filled neon-cyan blocks — The Classic. */
export function ClassicTetrominoGlyph() {
  const cell: CSSProperties = {
    width: 15,
    height: 15,
    borderRadius: 3,
    background: 'linear-gradient(180deg,#7AC6FA,#46AEF7)',
    boxShadow:
      '0 2px 5px rgba(70,174,247,0.35), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(46,146,221,0.30)',
  }
  const empty: CSSProperties = { width: 15, height: 15 }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 15px)', gap: '3px' }}>
      <span style={cell} /><span style={cell} /><span style={cell} />
      <span style={empty} /><span style={cell} /><span style={empty} />
    </div>
  )
}

/** A 2×2 tetromino in the neon palette (cyan/magenta/amber/green) — Chromatic. */
export function ColorQuadGlyph() {
  const block = (color: string, light: string): CSSProperties => ({
    width: 21,
    height: 21,
    borderRadius: 4,
    background: `linear-gradient(180deg,${light},${color})`,
    boxShadow: `0 2px 5px ${color}55, inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(0,0,0,0.12)`,
  })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 21px)', gap: '4px' }}>
      <span style={block('#46AEF7', '#7AC6FA')} />
      <span style={block('#FF8FCF', '#FFB3DF')} />
      <span style={block('#FFB13C', '#FFCE3A')} />
      <span style={block('#2FD09B', '#5BE0B7')} />
    </div>
  )
}

export function SequenceBlocksGlyph() {
  return (
    <div className="flex items-center">
      <div
        style={{ transform: 'rotate(-9deg)' }}
        className="w-[27px] h-[27px] rounded-[7px] bg-red-500 grid place-items-center shadow-[inset_0_2px_0_rgba(255,255,255,.55),inset_0_-3px_0_rgba(0,0,0,.22)]"
      >
        <span className="font-black text-[16px] text-white">1</span>
      </div>
      <div
        style={{ transform: 'rotate(5deg)', marginLeft: '-4px' }}
        className="w-[27px] h-[27px] rounded-[7px] bg-sky-500 grid place-items-center shadow-[inset_0_2px_0_rgba(255,255,255,.55),inset_0_-3px_0_rgba(0,0,0,.22)]"
      >
        <span className="font-black text-[16px] text-white">2</span>
      </div>
      <div
        style={{ transform: 'rotate(-4deg)', marginLeft: '-4px' }}
        className="w-[27px] h-[27px] rounded-[7px] bg-amber-400 grid place-items-center shadow-[inset_0_2px_0_rgba(255,255,255,.55),inset_0_-3px_0_rgba(0,0,0,.22)]"
      >
        <span className="font-black text-[16px] text-white">3</span>
      </div>
    </div>
  )
}

export function EyesGlyph() {
  return <span style={{ fontSize: '44px', lineHeight: 1 }}>👀</span>
}

export function RiddleGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1FC7B6" strokeWidth="2">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  )
}

/** CSS background string for each badge center disc — soft warm-white stages so
 *  the glyph sits on a calm Sherbet stage, faintly tinted with the crest's hue. */
export const BADGE_CENTER_BG: Record<string, string> = {
  play: 'linear-gradient(135deg,#E8FAF1,#FFFFFF)',
  classic: 'linear-gradient(135deg,#EAF5FF,#FFFFFF)',
  quad: 'linear-gradient(135deg,#FFF0F8,#FFFFFF)',
  seq: 'linear-gradient(135deg,#FFF4E6,#FFFFFF)',
  eyes: 'radial-gradient(circle at 50% 38%,#EAFBF4,#FFFFFF)',
  riddle: 'linear-gradient(135deg,#E6FBF7,#FFFFFF)',
}
