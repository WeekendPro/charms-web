import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../src/lib/auth', () => ({ signOut: vi.fn().mockResolvedValue({ error: null }) }))
import { HomeScreen } from '../../src/components/HomeScreen'
import { useNavStore } from '../../src/store/navStore'
import { useSettingsStore } from '../../src/store/settingsStore'
import { useCharmsGameStore } from '../../src/store/charmsGameStore'

beforeEach(() => {
  useNavStore.getState().reset()
  useSettingsStore.setState({ settings: { difficulty: 'easy' } })
  useCharmsGameStore.getState().exit()
  vi.clearAllMocks()
})

describe('HomeScreen', () => {
  it('Play starts a Charms run and enters the game view', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Play/i }))
    expect(useNavStore.getState().appView).toBe('game')
    expect(useCharmsGameStore.getState().phase).toBe('countdown')
  })

  it('defaults the difficulty selector to Easy', () => {
    render(<HomeScreen />)
    expect(screen.getByRole('button', { name: /Easy/i, pressed: true })).toBeTruthy()
  })

  it('selecting Medium / Hard updates the difficulty setting', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Medium/i }))
    expect(useSettingsStore.getState().settings.difficulty).toBe('medium')
    await user.click(screen.getByRole('button', { name: /Hard/i }))
    expect(useSettingsStore.getState().settings.difficulty).toBe('hard')
  })

  it('starts the run at the selected difficulty', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    await user.click(screen.getByRole('button', { name: /Hard/i }))
    await user.click(screen.getByRole('button', { name: /Play/i }))
    expect(useCharmsGameStore.getState().difficulty).toBe('hard')
  })
})
