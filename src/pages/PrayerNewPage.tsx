import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as db from '../lib/db'
import { useAuth } from '../context/AuthContext'

export default function PrayerNewPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!userId) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Введите название сферы')
      return
    }

    setError('')
    setPending(true)

    try {
      const topic = await db.createPrayerTopic(userId, trimmedTitle, description.trim())
      navigate(`/prayers/${topic.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать сферу')
      setPending(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link to="/prayers" className="text-sm text-violet-600 hover:text-violet-800">
          ← Молитвы
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Новая сфера</h1>
        <p className="text-sm text-gray-500 mt-1">
          Например: «Семья», «Служение», «Здоровье мамы»
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="О чём эта сфера молитвы?"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Заметка <span className="text-gray-400 font-normal">(необязательно)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            placeholder="С чего началась эта молитва?"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {pending ? 'Создаём…' : 'Создать'}
          </button>
          <Link to="/prayers" className="text-sm text-gray-600 hover:text-gray-900">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  )
}
