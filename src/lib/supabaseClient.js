import { createClient } from '@supabase/supabase-js'

// The project URL is public configuration, not a secret.
// Keep a safe fallback so a missing/misconfigured GitHub variable cannot
// prevent the entire Tivorly interface from loading.
const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const fallbackUrl = 'https://zzzsvuhgctrjjfoxbfzz.supabase.co'
const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

const url = isValidHttpUrl(configuredUrl) ? configuredUrl : fallbackUrl
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(
  isValidHttpUrl(url) &&
  publishableKey &&
  !publishableKey.includes('YOUR_SUPABASE')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
