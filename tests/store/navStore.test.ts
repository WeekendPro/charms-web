import { describe, it, expect, beforeEach } from 'vitest'
import { useNavStore } from '../../src/store/navStore'

beforeEach(() => {
  useNavStore.getState().reset()
})

describe('navStore', () => {
  it('starts on the auth view', () => {
    expect(useNavStore.getState().appView).toBe('auth')
  })

  it('goHome moves to the home landing page', () => {
    useNavStore.getState().goHome()
    expect(useNavStore.getState().appView).toBe('home')
  })

  it('goStagger enters the Infinite Stagger view; goAuth returns to auth', () => {
    useNavStore.getState().goStagger()
    expect(useNavStore.getState().appView).toBe('stagger')
    useNavStore.getState().goAuth()
    expect(useNavStore.getState().appView).toBe('auth')
  })

  it('reset returns to the initial auth view', () => {
    useNavStore.getState().goStagger()
    useNavStore.getState().reset()
    expect(useNavStore.getState().appView).toBe('auth')
  })
})
