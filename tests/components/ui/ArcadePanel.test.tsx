import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArcadePanel } from '../../../src/components/ui/ArcadePanel'

describe('ArcadePanel', () => {
  it('renders children', () => {
    render(<ArcadePanel><span>Inside</span></ArcadePanel>)
    expect(screen.getByText('Inside')).toBeInTheDocument()
  })

  it('applies the Sherbet white-card panel classes', () => {
    render(<ArcadePanel data-testid="panel">x</ArcadePanel>)
    const el = screen.getByTestId('panel')
    expect(el.className).toContain('bg-vt-panel')
    expect(el.className).toContain('border-vt-edge')
    expect(el.className).toContain('shadow-vt-tile')
    expect(el.className).toContain('rounded-2xl')
  })

  it('merges a caller-supplied className', () => {
    render(<ArcadePanel data-testid="panel" className="p-6">x</ArcadePanel>)
    expect(screen.getByTestId('panel').className).toContain('p-6')
  })
})
