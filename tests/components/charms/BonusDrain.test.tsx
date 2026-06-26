import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BonusDrain } from '../../../src/components/charms/HUD'

describe('BonusDrain', () => {
  it('shows the streak and the +N payout (clock readout + lift tag)', () => {
    render(<BonusDrain streak={3} fill={0.5} bonus={186} lift={0} />)
    expect(screen.getByText('×3')).toBeInTheDocument()
    // The bonus renders twice: the clock readout and the lifting headline.
    expect(screen.getAllByText('+186')).toHaveLength(2)
  })

  it('draws the meter at the given fill width', () => {
    const { container } = render(<BonusDrain streak={2} fill={0.5} bonus={120} lift={0} />)
    expect(container.querySelector('div[style*="width: 50%"]')).toBeTruthy()
  })

  it('empties the meter at fill 0', () => {
    const { container } = render(<BonusDrain streak={2} fill={0} bonus={0} lift={1} />)
    expect(container.querySelector('div[style*="width: 0%"]')).toBeTruthy()
  })
})
