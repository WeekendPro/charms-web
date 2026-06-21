import { describe, it, expect } from 'vitest'
import { signInAsGuest } from '../../src/lib/auth'

describe('signInAsGuest', () => {
  it('resolves locally with no error (no Supabase token exchange)', async () => {
    const result = await signInAsGuest()
    expect(result.error).toBeNull()
  })
})
