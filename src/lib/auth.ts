import { supabase } from './supabase'

export const signInWithApple = () =>
  supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } })
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
export const signUpWithEmail = (email: string, password: string) =>
  supabase.auth.signUp({ email, password })
export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })
/**
 * Guest sign-in is intentionally LOCAL — it does not call Supabase. There is no
 * hosted backend wired for guests, so we skip the anonymous token exchange and
 * resolve successfully; AuthScreen then drops the player straight on Home.
 */
export const signInAsGuest = async (): Promise<{ data: Record<string, never>; error: null }> => ({
  data: {},
  error: null,
})
export const upgradeGuest = (provider: 'apple' | 'google') =>
  supabase.auth.linkIdentity({ provider })
export const signOut = () => supabase.auth.signOut()
export const getSession = () => supabase.auth.getSession()
export const getUser = () => supabase.auth.getUser()
