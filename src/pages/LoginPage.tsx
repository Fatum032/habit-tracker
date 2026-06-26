import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, loading, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка...
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Не настроен .env — проверь ключи Supabase')
      return
    }

    setError('')
    setInfo('')
    setPendingAction('login')

    const message = await signIn(email, password)
    setPendingAction(null)

    if (message) {
      setError(message)
      return
    }

    navigate('/')
  }

  async function handleRegister() {
    if (!isSupabaseConfigured) {
      setError('Не настроен .env — проверь ключи Supabase')
      return
    }

    setError('')
    setInfo('')
    setPendingAction('register')

    const message = await signUp(email, password)
    setPendingAction(null)

    if (message === '__NEED_EMAIL_CONFIRM__') {
      setInfo(
        'Аккаунт создан. Supabase отправил письмо — открой его и подтверди email, потом нажми «Войти».'
      )
      return
    }

    if (message) {
      setError(message)
      return
    }

    setInfo('Аккаунт создан. Теперь нажми «Войти».')
  }

  const isLoginPending = pendingAction === 'login'
  const isRegisterPending = pendingAction === 'register'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Духовный трекер
        </h1>
        <p className="text-sm text-center text-gray-500">
          Привычки, анализ дня и планы на завтра
        </p>

        {!isSupabaseConfigured && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
            Файл .env не настроен. Добавь URL и anon-ключ из Supabase.
          </p>
        )}

        <form
          onSubmit={handleLogin}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              minLength={6}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

          <button
            type="submit"
            disabled={pendingAction !== null}
            className="w-full py-2 px-4 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {isLoginPending ? 'Подождите...' : 'Войти'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleRegister()}
          disabled={pendingAction !== null}
          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isRegisterPending ? 'Подождите...' : 'Зарегистрироваться'}
        </button>
      </div>
    </div>
  )
}
