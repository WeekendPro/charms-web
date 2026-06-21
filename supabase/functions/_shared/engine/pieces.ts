import type { PieceCells, PieceDefinition, PieceType, Rotation } from '../types.ts'

// Colours are Sherbet candy hues (see mockups/sherbet/tokens.css) as literal
// Tailwind arbitrary-value classes so each piece reads as a distinct candy tile.
export const PIECE_DEFINITIONS: PieceDefinition[] = [
  { type: 'I', color: 'bg-[#1FC7B6]', cells: [[0,0],[0,1],[0,2],[0,3]] }, // teal
  { type: 'O', color: 'bg-[#FFCE3A]', cells: [[0,0],[0,1],[1,0],[1,1]] }, // lemon
  { type: 'T', color: 'bg-[#9B8CFF]', cells: [[0,0],[0,1],[0,2],[1,1]] }, // grape
  { type: 'S', color: 'bg-[#5BC16E]', cells: [[0,1],[0,2],[1,0],[1,1]] }, // lime
  { type: 'Z', color: 'bg-[#FF6B6B]', cells: [[0,0],[0,1],[1,1],[1,2]] }, // strawberry
  { type: 'J', color: 'bg-[#46AEF7]', cells: [[0,0],[1,0],[1,1],[1,2]] }, // sky
  { type: 'L', color: 'bg-[#FF9E45]', cells: [[0,2],[1,0],[1,1],[1,2]] }, // tangerine
]

function normalizeCells(cells: PieceCells): PieceCells {
  const minR = Math.min(...cells.map(([r]) => r))
  const minC = Math.min(...cells.map(([, c]) => c))
  const shifted = cells.map(([r, c]) => [r - minR, c - minC] as [number, number])
  return shifted.sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2)
}

export function rotateCells(cells: PieceCells): PieceCells {
  const maxR = Math.max(...cells.map(([r]) => r))
  const rotated = cells.map(([r, c]) => [c, maxR - r] as [number, number])
  return normalizeCells(rotated)
}

export function getRotatedCells(type: PieceType, rotation: Rotation): PieceCells {
  const def = PIECE_DEFINITIONS.find(p => p.type === type)!
  let cells = normalizeCells(def.cells)
  for (let i = 0; i < rotation; i++) cells = rotateCells(cells)
  return cells
}

function serializeCells(cells: PieceCells): string {
  return normalizeCells(cells).map(([r, c]) => `${r},${c}`).join('|')
}

export function getAllRotations(type: PieceType): { rotation: Rotation; cells: PieceCells }[] {
  const seen = new Set<string>()
  const results: { rotation: Rotation; cells: PieceCells }[] = []
  for (let r = 0; r < 4; r++) {
    const cells = getRotatedCells(type, r as Rotation)
    const key = serializeCells(cells)
    if (!seen.has(key)) {
      seen.add(key)
      results.push({ rotation: r as Rotation, cells })
    }
  }
  return results
}

export function getPieceColor(type: PieceType): string {
  return PIECE_DEFINITIONS.find(p => p.type === type)!.color
}
