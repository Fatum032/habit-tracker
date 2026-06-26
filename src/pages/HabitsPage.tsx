import { Link } from 'react-router-dom'
import { useTracker } from '../context/TrackerContext'

export default function HabitsPage() {
  const { loading, habits, deleteHabit } = useTracker()

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Удалить привычку «${title}»?`)) return
    await deleteHabit(id)
  }

  if (loading) {
    return <p className="text-gray-500">Загрузка...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Привычки</h1>
          <p className="text-sm text-gray-500 mt-1">Список повторяется каждый день</p>
        </div>
        <Link
          to="/habits/new"
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
        >
          + Новая
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Пока нет привычек</p>
          <Link
            to="/habits/new"
            className="text-violet-600 hover:text-violet-800 font-medium text-sm"
          >
            Создать первую →
          </Link>
        </div>
      ) : (
        <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm text-gray-800">{habit.title}</span>
              <div className="flex items-center gap-3">
                <Link
                  to={`/habits/${habit.id}/edit`}
                  className="text-sm text-violet-600 hover:text-violet-800"
                >
                  Изменить
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(habit.id, habit.title)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
