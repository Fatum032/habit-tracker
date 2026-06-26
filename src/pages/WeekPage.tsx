import { useEffect, useMemo, useState } from 'react'
import * as db from '../lib/db'
import SpiritualAnalysisEditor from '../components/SpiritualAnalysisEditor'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../context/TrackerContext'
import type { DailyEntry } from '../types'
import {
  addDays,
  formatDisplayDate,
  formatWeekRange,
  getWeekDates,
  getWeekStart,
  todayString,
} from '../utils/dates'
import { cardClass, errorBoxClass, mutedTextClass, pageTitleClass } from '../utils/ui'

interface DaySummary {
  date: string
  habitsDone: number
  habitsTotal: number
  prayerEntries: number
  analysisText: string
}

export default function WeekPage() {
  const { userId } = useAuth()
  const { habits } = useTracker()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayString()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<DaySummary[]>([])

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const weekEnd = addDays(weekStart, 6)
  const habitsTotal = habits.length

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [dailyEntries, habitCounts, prayerCounts] = await Promise.all([
          db.fetchDailyEntriesInRange(userId!, weekStart, weekEnd),
          db.fetchHabitLogCountsByDate(userId!, weekStart, weekEnd),
          db.fetchPrayerEntryCountsByDate(userId!, weekStart, weekEnd),
        ])

        if (cancelled) return

        const analysisByDate = new Map(
          dailyEntries.map((entry) => [entry.entryDate, entry.spiritualAnalysis])
        )

        const nextSummaries: DaySummary[] = weekDates.map((date) => ({
          date,
          habitsDone: habitCounts[date] ?? 0,
          habitsTotal,
          prayerEntries: prayerCounts[date] ?? 0,
          analysisText: analysisByDate.get(date) ?? '',
        }))

        setSummaries(nextSummaries)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить неделю')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId, weekStart, weekEnd, weekDates, habitsTotal])

  function handleAnalysisSaved(date: string, saved: DailyEntry | null) {
    setSummaries((prev) =>
      prev.map((day) =>
        day.date === date ? { ...day, analysisText: saved?.spiritualAnalysis ?? '' } : day
      )
    )
  }

  const weekTotals = useMemo(() => {
    return summaries.reduce(
      (acc, day) => ({
        habitsDone: acc.habitsDone + day.habitsDone,
        prayerEntries: acc.prayerEntries + day.prayerEntries,
        daysWithAnalysis: acc.daysWithAnalysis + (day.analysisText.trim() ? 1 : 0),
      }),
      { habitsDone: 0, prayerEntries: 0, daysWithAnalysis: 0 }
    )
  }, [summaries])

  const maxPossibleHabits = habitsTotal * 7

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={pageTitleClass}>Неделя</h1>
          <p className={`${mutedTextClass} mt-1 capitalize`}>{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((value) => addDays(value, -7))}
            className="px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getWeekStart(todayString()))}
            className="px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((value) => addDays(value, 7))}
            className="px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            →
          </button>
        </div>
      </div>

      {!loading && (
        <div className={`${cardClass} p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left`}>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Привычки</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {weekTotals.habitsDone}
              {maxPossibleHabits > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {' '}
                  / {maxPossibleHabits}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Записи молитв</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {weekTotals.prayerEntries}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Дней с анализом</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {weekTotals.daysWithAnalysis} / 7
            </p>
          </div>
        </div>
      )}

      {error && <p className={errorBoxClass}>{error}</p>}

      {loading ? (
        <p className={mutedTextClass}>Загрузка...</p>
      ) : (
        <ul className="space-y-3">
          {summaries.map((day) => {
            const isToday = day.date === todayString()
            return (
              <li
                key={day.date}
                className={`${cardClass} p-4 space-y-3 ${isToday ? 'ring-2 ring-violet-300 dark:ring-violet-600' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {formatDisplayDate(day.date)}
                    {isToday && (
                      <span className="ml-2 text-xs font-normal text-violet-600 dark:text-violet-400">
                        сегодня
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
                      Привычки: {day.habitsDone}/{day.habitsTotal}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200">
                      Молитвы: {day.prayerEntries}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Духовный анализ</p>
                  <SpiritualAnalysisEditor
                    entryDate={day.date}
                    text={day.analysisText}
                    onSaved={(saved) => handleAnalysisSaved(day.date, saved)}
                    previewMaxLength={120}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
