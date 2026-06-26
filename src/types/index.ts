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
