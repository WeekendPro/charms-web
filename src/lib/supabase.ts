import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

// Local-only mode: with no creds set, createClient() would throw at module load
// ("supabaseUrl is required") and crash the whole app before it can render. We
// fall back to a harmless placeholder so the app still boots — backend calls then
// fail gracefully and App.tsx's getSession().catch() drops the player on AuthScreen.
// Run `supabase start` and paste the local url/anon key into .env.local to enable
// the real backend. (Never point this at the original game's hosted project.)
export const hasSupabaseCreds = Boolean(url && anon)

if (!hasSupabaseCreds) {
  console.warn(
    '[vanishing-tiles] No Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
      'Running local-only — backend calls will fail until you wire a v2 project.',
  )
}

export const supabase = createClient(
  url || 'http://localhost:54321',
  anon || 'local-anon-placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } },
)
