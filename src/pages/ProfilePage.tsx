import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { fetchProfileCreatedAt } from '../lib/db'
import { formatDisplayDate } from '../utils/dates'
import { cardClass, mutedTextClass, pageTitleClass } from '../utils/ui'

export default function ProfilePage() {
  const { userId, userEmail } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const [createdAt, setCreatedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    void fetchProfileCreatedAt(userId).then(setCreatedAt)
  }, [userId])

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← На главную
        </Link>
        <h1 className={`${pageTitleClass} mt-2`}>Профиль</h1>
      </div>

      <div className={`${cardClass} p-6 space-y-4`}>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Email</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{userEmail}</p>
        </div>
        {createdAt && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">С нами с</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 capitalize">
              {formatDisplayDate(createdAt.slice(0, 10))}
            </p>
          </div>
        )}
      </div>

      <div className={`${cardClass} p-6 space-y-4`}>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Тёмная тема</p>
          <p className={`${mutedTextClass} mt-1`}>Сохраняется в браузере на этом устройстве</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              theme === 'light'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Светлая
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              theme === 'dark'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Тёмная
          </button>
        </div>
        <p className={`text-xs ${mutedTextClass}`}>
          Сейчас: {isDark ? 'тёмная' : 'светлая'}
        </p>
      </div>
    </div>
  )
}
