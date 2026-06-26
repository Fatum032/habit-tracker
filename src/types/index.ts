export interface Habit {
  id: string
  userId: string
  title: string
  sortOrder: number
  createdAt: string
}

export interface PlanItem {
  id: string
  userId: string
  plannedFor: string
  content: string
  scheduledTime: string | null
  sortOrder: number
  createdAt: string
}

export interface DailyEntry {
  id: string
  userId: string
  entryDate: string
  spiritualAnalysis: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  userId: string
  title: string
  eventDate: string
  eventTime: string
  createdAt: string
}

export type PrayerTopicStatus = 'active' | 'waiting' | 'answered' | 'closed'
export type PrayerEntryType = 'request' | 'update' | 'answered'

export interface PrayerTopic {
  id: string
  userId: string
  title: string
  description: string
  status: PrayerTopicStatus
  createdAt: string
  updatedAt: string
}

export interface PrayerEntry {
  id: string
  userId: string
  topicId: string
  entryDate: string
  content: string
  entryType: PrayerEntryType
  createdAt: string
  updatedAt: string
}

export interface PrayerTopicWithMeta extends PrayerTopic {
  lastEntryDate: string | null
  lastEntryPreview: string | null
}
