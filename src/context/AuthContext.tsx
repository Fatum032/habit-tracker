import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  userId: string | null
  userEmail: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    'Email not confirmed':
      'Email не подтверждён. Открой письмо от Supabase и нажми ссылку — или отключи Confirm email в Supabase (см. инструкцию).',
    'Invalid login credentials': 'Неверный email или пароль',
    'User already registered': 'Этот email уже зарегистрирован — нажми «Войти»',
  }

  return translations[message] ?? message
}

function formatAuthError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const message = error.message.toLowerCase()
  if (message.includes('abort') || message.includes('aborted')) {
    return 'Supabase не ответил. Проверь VITE_SUPABASE_URL в .env — должно быть https://xxx.supabase.co без /rest/v1/'
  }

  return error.message || fallback
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error: unknown) => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error(message))
      })
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = session?.user.id ?? null
  const userEmail = session?.user.email ?? null

  useEffect(() => {
    let active = true

    void withTimeout(supabase.auth.getSession(), 10000, 'Таймаут при проверке сессии')
      .then(({ data: { session: current } }) => {
        if (active) setSession(current)
      })
      .catch(() => {
        // Покажем форму входа
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        'Сервер не ответил за 15 секунд. Попробуй режим инкогнито.'
      )
      return error ? translateAuthError(error.message) : null
    } catch (error) {
      return formatAuthError(error, 'Ошибка входа')
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        15000,
        'Сервер не ответил за 15 секунд. Попробуй режим инкогнито.'
      )
      if (error) return translateAuthError(error.message)
      if (data.user && !data.session) {
        return '__NEED_EMAIL_CONFIRM__'
      }
      return null
    } catch (error) {
      return formatAuthError(error, 'Ошибка регистрации')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    session,
    userId,
    userEmail,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth нужно вызывать внутри AuthProvider')
  }
  return context
}
