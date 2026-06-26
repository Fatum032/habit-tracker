function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayString(): string {
  return localDateString(new Date())
}

export function tomorrowString(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return localDateString(date)
}

export function formatDisplayDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

/** "13:00:00" → "13:00" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return ''
  return time.slice(0, 5)
}

export function compareDateTime(
  dateA: string,
  timeA: string | null,
  dateB: string,
  timeB: string | null
): number {
  if (dateA !== dateB) return dateA < dateB ? -1 : 1
  const tA = timeA ?? '99:99'
  const tB = timeB ?? '99:99'
  return tA.localeCompare(tB)
}

export function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const days: (string | null)[] = []

  for (let i = 0; i < startWeekday; i++) days.push(null)

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(localDateString(new Date(year, month, day)))
  }

  return days
}

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]
