import { supabase } from './supabase'
import type {
  CalendarEvent,
  DailyEntry,
  Habit,
  PlanItem,
  PrayerEntry,
  PrayerTopic,
  PrayerTopicWithMeta,
} from '../types'
import { formatTime } from '../utils/dates'

interface HabitRow {
  id: string
  user_id: string
  title: string
  sort_order: number
  created_at: string
}

interface PlanItemRow {
  id: string
  user_id: string
  planned_for: string
  content: string
  scheduled_time: string | null
  sort_order: number
  created_at: string
}

interface DailyEntryRow {
  id: string
  user_id: string
  entry_date: string
  spiritual_analysis: string
  updated_at: string
}

interface CalendarEventRow {
  id: string
  user_id: string
  title: string
  event_date: string
  event_time: string
  created_at: string
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

function mapPlanItem(row: PlanItemRow): PlanItem {
  return {
    id: row.id,
    userId: row.user_id,
    plannedFor: row.planned_for,
    content: row.content,
    scheduledTime: row.scheduled_time ? formatTime(row.scheduled_time) : null,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

function mapDailyEntry(row: DailyEntryRow): DailyEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    spiritualAnalysis: row.spiritual_analysis,
    updatedAt: row.updated_at,
  }
}

function mapCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    eventDate: row.event_date,
    eventTime: formatTime(row.event_time),
    createdAt: row.created_at,
  }
}

function sortPlans(items: PlanItem[]): PlanItem[] {
  return [...items].sort((a, b) => {
    if (a.scheduledTime && b.scheduledTime) {
      const byTime = a.scheduledTime.localeCompare(b.scheduledTime)
      if (byTime !== 0) return byTime
    }
    if (a.scheduledTime && !b.scheduledTime) return -1
    if (!a.scheduledTime && b.scheduledTime) return 1
    return a.sortOrder - b.sortOrder
  })
}

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
    .order('created_at')

  if (error) throw new Error(error.message)
  return (data as HabitRow[]).map(mapHabit)
}

export async function createHabit(userId: string, title: string): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, title })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapHabit(data as HabitRow)
}

export async function updateHabit(id: string, title: string): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update({ title })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapHabit(data as HabitRow)
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchCompletedHabitIds(
  userId: string,
  logDate: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('log_date', logDate)

  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.habit_id as string))
}

export async function markHabitDone(
  userId: string,
  habitId: string,
  logDate: string
): Promise<void> {
  const { error } = await supabase.from('habit_logs').insert({
    user_id: userId,
    habit_id: habitId,
    log_date: logDate,
  })

  if (error) throw new Error(error.message)
}

export async function unmarkHabitDone(habitId: string, logDate: string): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('log_date', logDate)

  if (error) throw new Error(error.message)
}

export async function fetchDailyEntry(
  userId: string,
  entryDate: string
): Promise<DailyEntry | null> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', entryDate)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapDailyEntry(data as DailyEntryRow) : null
}

export async function saveDailyEntry(
  userId: string,
  entryDate: string,
  spiritualAnalysis: string
): Promise<DailyEntry> {
  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(
      {
        user_id: userId,
        entry_date: entryDate,
        spiritual_analysis: spiritualAnalysis,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    )
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapDailyEntry(data as DailyEntryRow)
}

export async function fetchPlanItems(
  userId: string,
  plannedFor: string
): Promise<PlanItem[]> {
  const { data, error } = await supabase
    .from('plan_items')
    .select('*')
    .eq('user_id', userId)
    .eq('planned_for', plannedFor)
    .order('sort_order')
    .order('created_at')

  if (error) throw new Error(error.message)
  return sortPlans((data as PlanItemRow[]).map(mapPlanItem))
}

export async function createPlanItem(
  userId: string,
  plannedFor: string,
  content: string,
  sortOrder: number,
  scheduledTime?: string | null
): Promise<PlanItem> {
  const { data, error } = await supabase
    .from('plan_items')
    .insert({
      user_id: userId,
      planned_for: plannedFor,
      content,
      sort_order: sortOrder,
      scheduled_time: scheduledTime || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapPlanItem(data as PlanItemRow)
}

export async function updatePlanItem(
  id: string,
  content: string,
  scheduledTime?: string | null
): Promise<PlanItem> {
  const { data, error } = await supabase
    .from('plan_items')
    .update({
      content,
      scheduled_time: scheduledTime || null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapPlanItem(data as PlanItemRow)
}

export async function deletePlanItem(id: string): Promise<void> {
  const { error } = await supabase.from('plan_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchUpcomingEvents(
  userId: string,
  fromDate: string
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', fromDate)
    .order('event_date')
    .order('event_time')

  if (error) throw new Error(error.message)
  return (data as CalendarEventRow[]).map(mapCalendarEvent)
}

export async function createCalendarEvent(
  userId: string,
  title: string,
  eventDate: string,
  eventTime: string
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      title,
      event_date: eventDate,
      event_time: eventTime,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapCalendarEvent(data as CalendarEventRow)
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchProfileCreatedAt(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data?.created_at as string | undefined) ?? null
}

interface PrayerTopicRow {
  id: string
  user_id: string
  title: string
  description: string
  status: PrayerTopic['status']
  created_at: string
  updated_at: string
}

interface PrayerEntryRow {
  id: string
  user_id: string
  topic_id: string
  entry_date: string
  content: string
  entry_type: PrayerEntry['entryType']
  created_at: string
  updated_at: string
}

function mapPrayerTopic(row: PrayerTopicRow): PrayerTopic {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPrayerEntry(row: PrayerEntryRow): PrayerEntry {
  return {
    id: row.id,
    userId: row.user_id,
    topicId: row.topic_id,
    entryDate: row.entry_date,
    content: row.content,
    entryType: row.entry_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function attachLastEntryMeta(
  topics: PrayerTopic[],
  entries: PrayerEntry[]
): PrayerTopicWithMeta[] {
  const lastByTopic = new Map<string, PrayerEntry>()

  for (const entry of entries) {
    const existing = lastByTopic.get(entry.topicId)
    if (!existing || entry.entryDate > existing.entryDate) {
      lastByTopic.set(entry.topicId, entry)
    } else if (
      entry.entryDate === existing.entryDate &&
      entry.createdAt > existing.createdAt
    ) {
      lastByTopic.set(entry.topicId, entry)
    }
  }

  return topics.map((topic) => {
    const last = lastByTopic.get(topic.id)
    const preview = last?.content.trim()
    return {
      ...topic,
      lastEntryDate: last?.entryDate ?? null,
      lastEntryPreview: preview
        ? preview.length > 80
          ? `${preview.slice(0, 80)}…`
          : preview
        : null,
    }
  })
}

export async function fetchPrayerTopicsWithMeta(userId: string): Promise<PrayerTopicWithMeta[]> {
  const [topicsResult, entriesResult] = await Promise.all([
    supabase
      .from('prayer_topics')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('prayer_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  if (topicsResult.error) throw new Error(topicsResult.error.message)
  if (entriesResult.error) throw new Error(entriesResult.error.message)

  const topics = (topicsResult.data as PrayerTopicRow[]).map(mapPrayerTopic)
  const entries = (entriesResult.data as PrayerEntryRow[]).map(mapPrayerEntry)
  return attachLastEntryMeta(topics, entries)
}

export async function fetchPrayerTopic(id: string): Promise<PrayerTopic | null> {
  const { data, error } = await supabase.from('prayer_topics').select('*').eq('id', id).maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapPrayerTopic(data as PrayerTopicRow) : null
}

export async function createPrayerTopic(
  userId: string,
  title: string,
  description = ''
): Promise<PrayerTopic> {
  const { data, error } = await supabase
    .from('prayer_topics')
    .insert({ user_id: userId, title, description })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapPrayerTopic(data as PrayerTopicRow)
}

export async function updatePrayerTopic(
  id: string,
  updates: Partial<Pick<PrayerTopic, 'title' | 'description' | 'status'>>
): Promise<PrayerTopic> {
  const payload: Record<string, string> = { updated_at: new Date().toISOString() }
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.status !== undefined) payload.status = updates.status

  const { data, error } = await supabase
    .from('prayer_topics')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapPrayerTopic(data as PrayerTopicRow)
}

export async function deletePrayerTopic(id: string): Promise<void> {
  const { error } = await supabase.from('prayer_topics').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchPrayerEntries(topicId: string): Promise<PrayerEntry[]> {
  const { data, error } = await supabase
    .from('prayer_entries')
    .select('*')
    .eq('topic_id', topicId)
    .order('entry_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as PrayerEntryRow[]).map(mapPrayerEntry)
}

export async function createPrayerEntry(
  userId: string,
  topicId: string,
  entryDate: string,
  content: string,
  entryType: PrayerEntry['entryType']
): Promise<PrayerEntry> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('prayer_entries')
    .insert({
      user_id: userId,
      topic_id: topicId,
      entry_date: entryDate,
      content,
      entry_type: entryType,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('prayer_topics').update({ updated_at: now }).eq('id', topicId)

  return mapPrayerEntry(data as PrayerEntryRow)
}

export async function updatePrayerEntry(
  id: string,
  topicId: string,
  updates: Partial<Pick<PrayerEntry, 'entryDate' | 'content' | 'entryType'>>
): Promise<PrayerEntry> {
  const payload: Record<string, string> = { updated_at: new Date().toISOString() }
  if (updates.entryDate !== undefined) payload.entry_date = updates.entryDate
  if (updates.content !== undefined) payload.content = updates.content
  if (updates.entryType !== undefined) payload.entry_type = updates.entryType

  const { data, error } = await supabase
    .from('prayer_entries')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await supabase
    .from('prayer_topics')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', topicId)

  return mapPrayerEntry(data as PrayerEntryRow)
}

export async function deletePrayerEntry(id: string, topicId: string): Promise<void> {
  const { error } = await supabase.from('prayer_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await supabase
    .from('prayer_topics')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', topicId)
}
