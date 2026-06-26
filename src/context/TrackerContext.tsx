import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as db from '../lib/db'
import type { CalendarEvent, Habit, PlanItem } from '../types'
import { todayString, tomorrowString } from '../utils/dates'
import { useAuth } from './AuthContext'

interface TrackerContextValue {
  loading: boolean
  error: string | null
  habits: Habit[]
  completedToday: Set<string>
  spiritualAnalysis: string
  todayPlans: PlanItem[]
  tomorrowPlans: PlanItem[]
  events: CalendarEvent[]
  eventDates: Set<string>
  refresh: () => Promise<void>
  toggleHabit: (habitId: string) => Promise<string | null>
  saveSpiritualAnalysis: (text: string) => Promise<string | null>
  syncSpiritualAnalysis: (text: string) => void
  addTodayPlan: (content: string, scheduledTime?: string | null) => Promise<string | null>
  addTomorrowPlan: (content: string, scheduledTime?: string | null) => Promise<string | null>
  updatePlan: (
    id: string,
    content: string,
    scheduledTime?: string | null
  ) => Promise<string | null>
  removePlan: (id: string) => Promise<string | null>
  addEvent: (title: string, eventDate: string, eventTime: string) => Promise<string | null>
  removeEvent: (id: string) => Promise<string | null>
  createHabit: (title: string) => Promise<string | null>
  updateHabit: (id: string, title: string) => Promise<string | null>
  deleteHabit: (id: string) => Promise<string | null>
}

const TrackerContext = createContext<TrackerContextValue | null>(null)

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [spiritualAnalysis, setSpiritualAnalysis] = useState('')
  const [todayPlans, setTodayPlans] = useState<PlanItem[]>([])
  const [tomorrowPlans, setTomorrowPlans] = useState<PlanItem[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const today = todayString()
  const tomorrow = tomorrowString()

  const eventDates = useMemo(
    () => new Set(events.map((event) => event.eventDate)),
    [events]
  )

  const refresh = useCallback(async () => {
    if (!userId) {
      setHabits([])
      setCompletedToday(new Set())
      setSpiritualAnalysis('')
      setTodayPlans([])
      setTomorrowPlans([])
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [habitsData, completed, entry, plansToday, plansTomorrow, eventsData] =
        await Promise.all([
          db.fetchHabits(userId),
          db.fetchCompletedHabitIds(userId, today),
          db.fetchDailyEntry(userId, today),
          db.fetchPlanItems(userId, today),
          db.fetchPlanItems(userId, tomorrow),
          db.fetchUpcomingEvents(userId, today),
        ])

      setHabits(habitsData)
      setCompletedToday(completed)
      setSpiritualAnalysis(entry?.spiritualAnalysis ?? '')
      setTodayPlans(plansToday)
      setTomorrowPlans(plansTomorrow)
      setEvents(eventsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [userId, today, tomorrow])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function toggleHabit(habitId: string): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    try {
      if (completedToday.has(habitId)) {
        await db.unmarkHabitDone(habitId, today)
        setCompletedToday((prev) => {
          const next = new Set(prev)
          next.delete(habitId)
          return next
        })
      } else {
        await db.markHabitDone(userId, habitId, today)
        setCompletedToday((prev) => new Set(prev).add(habitId))
      }
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function saveSpiritualAnalysis(text: string): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    try {
      await db.saveDailyEntry(userId, today, text)
      setSpiritualAnalysis(text)
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  const syncSpiritualAnalysis = useCallback((text: string) => {
    setSpiritualAnalysis(text)
  }, [])

  async function addTodayPlan(
    content: string,
    scheduledTime?: string | null
  ): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    const trimmed = content.trim()
    if (!trimmed) return 'Введите текст плана'

    try {
      const item = await db.createPlanItem(
        userId,
        today,
        trimmed,
        todayPlans.length,
        scheduledTime
      )
      setTodayPlans((prev) => [...prev, item].sort(sortPlansLocal))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function addTomorrowPlan(
    content: string,
    scheduledTime?: string | null
  ): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    const trimmed = content.trim()
    if (!trimmed) return 'Введите текст плана'

    try {
      const item = await db.createPlanItem(
        userId,
        tomorrow,
        trimmed,
        tomorrowPlans.length,
        scheduledTime
      )
      setTomorrowPlans((prev) => [...prev, item].sort(sortPlansLocal))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function updatePlan(
    id: string,
    content: string,
    scheduledTime?: string | null
  ): Promise<string | null> {
    const trimmed = content.trim()
    if (!trimmed) return 'Текст не может быть пустым'

    try {
      const item = await db.updatePlanItem(id, trimmed, scheduledTime)
      setTodayPlans((prev) =>
        prev.map((plan) => (plan.id === id ? item : plan)).sort(sortPlansLocal)
      )
      setTomorrowPlans((prev) =>
        prev.map((plan) => (plan.id === id ? item : plan)).sort(sortPlansLocal)
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function removePlan(id: string): Promise<string | null> {
    try {
      await db.deletePlanItem(id)
      setTodayPlans((prev) => prev.filter((plan) => plan.id !== id))
      setTomorrowPlans((prev) => prev.filter((plan) => plan.id !== id))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка удаления'
    }
  }

  async function addEvent(
    title: string,
    eventDate: string,
    eventTime: string
  ): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    const trimmed = title.trim()
    if (!trimmed) return 'Введите название мероприятия'
    if (!eventTime) return 'Укажите время'

    try {
      const event = await db.createCalendarEvent(userId, trimmed, eventDate, eventTime)
      setEvents((prev) =>
        [...prev, event].sort((a, b) => {
          if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate)
          return a.eventTime.localeCompare(b.eventTime)
        })
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function removeEvent(id: string): Promise<string | null> {
    try {
      await db.deleteCalendarEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка удаления'
    }
  }

  async function createHabit(title: string): Promise<string | null> {
    if (!userId) return 'Нужно войти в аккаунт'

    try {
      const habit = await db.createHabit(userId, title.trim())
      setHabits((prev) => [...prev, habit])
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка создания'
    }
  }

  async function updateHabit(id: string, title: string): Promise<string | null> {
    try {
      const habit = await db.updateHabit(id, title.trim())
      setHabits((prev) => prev.map((item) => (item.id === id ? habit : item)))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка сохранения'
    }
  }

  async function deleteHabit(id: string): Promise<string | null> {
    try {
      await db.deleteHabit(id)
      setHabits((prev) => prev.filter((item) => item.id !== id))
      setCompletedToday((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка удаления'
    }
  }

  const value: TrackerContextValue = {
    loading,
    error,
    habits,
    completedToday,
    spiritualAnalysis,
    todayPlans,
    tomorrowPlans,
    events,
    eventDates,
    refresh,
    toggleHabit,
    saveSpiritualAnalysis,
    syncSpiritualAnalysis,
    addTodayPlan,
    addTomorrowPlan,
    updatePlan,
    removePlan,
    addEvent,
    removeEvent,
    createHabit,
    updateHabit,
    deleteHabit,
  }

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}

function sortPlansLocal(a: PlanItem, b: PlanItem): number {
  if (a.scheduledTime && b.scheduledTime) {
    const byTime = a.scheduledTime.localeCompare(b.scheduledTime)
    if (byTime !== 0) return byTime
  }
  if (a.scheduledTime && !b.scheduledTime) return -1
  if (!a.scheduledTime && b.scheduledTime) return 1
  return a.sortOrder - b.sortOrder
}

export function useTracker() {
  const context = useContext(TrackerContext)
  if (!context) {
    throw new Error('useTracker нужно вызывать внутри TrackerProvider')
  }
  return context
}
