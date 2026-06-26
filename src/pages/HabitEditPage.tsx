import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import HabitForm from '../components/HabitForm'
import { useTracker } from '../context/TrackerContext'

export default function HabitEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { habits, updateHabit } = useTracker()
  const [error, setError] = useState('')

  const habit = habits.find((item) => item.id === id)

  if (!habit) {
    return <Navigate to="/habits" replace />
  }

  async function handleSubmit(title: string) {
    if (!id) return

    const message = await updateHabit(id, title)
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
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Редактирование</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <HabitForm
          initialTitle={habit.title}
          submitLabel="Сохранить"
          onSubmit={(title) => void handleSubmit(title)}
          onCancel={() => navigate('/habits')}
        />
      </div>
    </div>
  )
}
