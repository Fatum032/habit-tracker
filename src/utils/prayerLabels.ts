import type { PrayerEntryType, PrayerTopicStatus } from '../types'

export const PRAYER_TOPIC_STATUS_LABELS: Record<PrayerTopicStatus, string> = {
  active: 'Активна',
  waiting: 'Жду',
  answered: 'Ответ получен',
  closed: 'Закрыта',
}

export const PRAYER_ENTRY_TYPE_LABELS: Record<PrayerEntryType, string> = {
  request: 'Молитва',
  update: 'Обновление',
  answered: 'Ответ',
}

export const PRAYER_TOPIC_STATUS_STYLES: Record<PrayerTopicStatus, string> = {
  active: 'bg-violet-100 text-violet-800',
  waiting: 'bg-amber-100 text-amber-800',
  answered: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-600',
}

export const PRAYER_ENTRY_TYPE_STYLES: Record<PrayerEntryType, string> = {
  request: 'bg-violet-100 text-violet-800',
  update: 'bg-sky-100 text-sky-800',
  answered: 'bg-emerald-100 text-emerald-800',
}
