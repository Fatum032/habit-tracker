import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  return url
    .trim()
    .replace(/^https:\/\/https:\/\//, 'https://')
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase: добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout))
    },
  },
})
