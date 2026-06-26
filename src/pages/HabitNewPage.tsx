import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HabitForm from '../components/HabitForm'
import { useTracker } from '../context/TrackerContext'

export default function HabitNewPage() {
  const navigate = useNavigate()
  const { createHabit } = useTracker()
  const [error, setError] = useState('')

  async function handleSubmit(title: string) {
    const message = await createHabit(title)
    if (message) {
      setError(message)
      return
    }
    navigate('/habits')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to="/habits" className="text-sm text-gray-500 hover:text-gray-700">
          ← К списку
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Новая привычка</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <HabitForm
          submitLabel="Создать"
          onSubmit={(title) => void handleSubmit(title)}
          onCancel={() => navigate('/habits')}
        />
      </div>
    </div>
  )
}
