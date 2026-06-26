import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProfileCreatedAt } from '../lib/db'
import { formatDisplayDate } from '../utils/dates'

export default function ProfilePage() {
  const { userId, userEmail } = useAuth()
  const [createdAt, setCreatedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    void fetchProfileCreatedAt(userId).then(setCreatedAt)
  }, [userId])

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← На главную
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Профиль</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
          <p className="text-sm text-gray-800 mt-1">{userEmail}</p>
        </div>
        {createdAt && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">С нами с</p>
            <p className="text-sm text-gray-800 mt-1 capitalize">
              {formatDisplayDate(createdAt.slice(0, 10))}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
