import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../src/lib/auth', () => ({
  getUser: vi.fn().mockResolvedValue({
    data: { user: { email: 'luis@example.com', is_anonymous: false, user_metadata: {} } },
  }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}))
import * as auth from '../../src/lib/auth'
import { GlobalMenu } from '../../src/components/GlobalMenu'
import { useNavStore } from '../../src/store/navStore'

beforeEach(() => {
  useNavStore.getState().reset()
  vi.clearAllMocks()
})

describe('GlobalMenu', () => {
  it('is simplified to Settings / Logout (no modes, maps, or game controls)', async () => {
    useNavStore.setState({ appView: 'home' })
    const user = userEvent.setup()
    render(<GlobalMenu />)
    await user.click(screen.getByRole('button', { name: /menu/i }))
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument()
    // Game modes, maps, and the old in-game pause controls are gone.
    expect(screen.queryByRole('button', { name: /Reset Journey/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Training Mode/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Subway Map/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Resume/i })).not.toBeInTheDocument()
  })

  it('Logout calls signOut and resets navigation', async () => {
    useNavStore.setState({ appView: 'home' })
    const user = userEvent.setup()
    render(<GlobalMenu />)
    await user.click(screen.getByRole('button', { name: /menu/i }))
    await user.click(screen.getByRole('button', { name: /Logout/i }))
    expect(auth.signOut).toHaveBeenCalledTimes(1)
  })
})
