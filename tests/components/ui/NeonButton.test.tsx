import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NeonButton } from '../../../src/components/ui/NeonButton'

describe('NeonButton', () => {
  it('renders its label as a button (accessible name preserved)', () => {
    render(<NeonButton>Done ✓</NeonButton>)
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument()
  })

  it('defaults to the primary (candy sky) variant', () => {
    render(<NeonButton>Play</NeonButton>)
    const btn = screen.getByRole('button', { name: /Play/i })
    expect(btn.className).toContain('bg-vt-cyan')
    expect(btn.className).toContain('text-white')
    expect(btn.className).toContain('font-pixel')
  })

  it('applies the go (mint) variant classes', () => {
    render(<NeonButton variant="go">Go</NeonButton>)
    const btn = screen.getByRole('button', { name: /Go/i })
    expect(btn.className).toContain('bg-vt-lime')
    expect(btn.className).toContain('shadow-vt-tile')
  })

  it('applies the danger (coral) variant classes', () => {
    render(<NeonButton variant="danger">Sign Out</NeonButton>)
    expect(screen.getByRole('button', { name: /Sign Out/i }).className).toContain('border-vt-red')
  })

  it('adds w-full when fullWidth is set', () => {
    render(<NeonButton fullWidth>Wide</NeonButton>)
    expect(screen.getByRole('button', { name: /Wide/i }).className).toContain('w-full')
  })

  it('forwards disabled and onClick like a native button', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(<NeonButton onClick={onClick}>Tap</NeonButton>)
    await user.click(screen.getByRole('button', { name: /Tap/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(<NeonButton onClick={onClick} disabled>Tap</NeonButton>)
    expect(screen.getByRole('button', { name: /Tap/i })).toBeDisabled()
  })
})
