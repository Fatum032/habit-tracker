import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EventsSidebar from '../components/EventsSidebar'
import PlanListSection from '../components/PlanListSection'
import { useTracker } from '../context/TrackerContext'
import { formatDisplayDate, todayString, tomorrowString } from '../utils/dates'

export default function DashboardPage() {
  const {
    loading,
    error,
    habits,
    completedToday,
    spiritualAnalysis,
    todayPlans,
    tomorrowPlans,
    toggleHabit,
    saveSpiritualAnalysis,
    addTodayPlan,
    addTomorrowPlan,
    updatePlan,
    removePlan,
  } = useTracker()

  const [analysisDraft, setAnalysisDraft] = useState('')
  const [analysisMessage, setAnalysisMessage] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [analysisPending, setAnalysisPending] = useState(false)

  useEffect(() => {
    setAnalysisDraft(spiritualAnalysis)
  }, [spiritualAnalysis])

  const completedCount = habits.filter((habit) => completedToday.has(habit.id)).length
  const todayLabel = formatDisplayDate(todayString())
  const tomorrowLabel = formatDisplayDate(tomorrowString())

  async function handleSaveAnalysis() {
    setAnalysisMessage('')
    setAnalysisError('')
    setAnalysisPending(true)

    const message = await saveSpiritualAnalysis(analysisDraft)
    setAnalysisPending(false)

    if (message) {
      setAnalysisError(message)
      return
    }

    setAnalysisMessage('Сохранено')
  }

  if (loading) {
    return <p className="text-gray-500">Загрузка...</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
      <EventsSidebar />

      <div className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{todayLabel}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Привычки: {completedCount} из {habits.length}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}

        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-900">Привычки</h2>
            <Link
              to="/habits/new"
              className="text-sm text-violet-600 hover:text-violet-800 font-medium"
            >
              + Добавить
            </Link>
          </div>

          {habits.length === 0 ? (
            <p className="text-sm text-gray-500">
              Пока нет привычек.{' '}
              <Link to="/habits/new" className="text-violet-600 hover:underline">
                Создай первую
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {habits.map((habit) => {
                const done = completedToday.has(habit.id)
                return (
                  <li key={habit.id}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => void toggleHabit(habit.id)}
                        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span
                        className={`text-sm transition-colors ${
                          done
                            ? 'line-through text-gray-400'
                            : 'text-gray-800 group-hover:text-gray-900'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <PlanListSection
          title="План на сегодня"
          subtitle="Из вчерашних планов + можно дополнять и менять в течение дня"
          plans={todayPlans}
          emptyMessage="Пока пусто — добавь дела на сегодня"
          onAdd={addTodayPlan}
          onUpdate={(id, content, time) => void updatePlan(id, content, time)}
          onRemove={(id) => void removePlan(id)}
        />

        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <h2 className="text-lg font-medium text-gray-900">Духовный анализ</h2>
          <textarea
            value={analysisDraft}
            onChange={(e) => setAnalysisDraft(e.target.value)}
            rows={5}
            placeholder="Что Бог показал тебе сегодня? За что благодарен?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-y"
          />
          {analysisError && <p className="text-sm text-red-600">{analysisError}</p>}
          {analysisMessage && <p className="text-sm text-green-700">{analysisMessage}</p>}
          <button
            type="button"
            onClick={() => void handleSaveAnalysis()}
            disabled={analysisPending}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {analysisPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </section>

        <PlanListSection
          title="Планы на завтра"
          subtitle={tomorrowLabel}
          plans={tomorrowPlans}
          emptyMessage="Добавь дело и время — завтра появится в «План на сегодня»"
          onAdd={addTomorrowPlan}
          onUpdate={(id, content, time) => void updatePlan(id, content, time)}
          onRemove={(id) => void removePlan(id)}
        />
      </div>
    </div>
  )
}
