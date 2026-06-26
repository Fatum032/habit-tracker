import { useState } from 'react'
import type { FormEvent } from 'react'

interface HabitFormProps {
  initialTitle?: string
  submitLabel?: string
  onSubmit: (title: string) => void
  onCancel: () => void
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'

export default function HabitForm({
  initialTitle = '',
  submitLabel = 'Сохранить',
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Введите название')
      return
    }

    setError('')
    onSubmit(title.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="habit-title" className="block text-sm font-medium text-gray-700 mb-1">
          Название привычки
        </label>
        <input
          id="habit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Утренняя молитва"
          autoFocus
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
