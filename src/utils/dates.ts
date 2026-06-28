/** Новый «день» трекера начинается в 4:00 (локальное время), не в полночь */
export const DAY_ROLLOVER_HOUR = 4

function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Текущий момент с учётом сдвига дня (00:00–03:59 → ещё «вчера») */
function getLogicalNow(): Date {
  const now = new Date()
  if (now.getHours() < DAY_ROLLOVER_HOUR) {
    const shifted = new Date(now)
    shifted.setDate(shifted.getDate() - 1)
    return shifted
  }
  return now
}

export function todayString(): string {
  return localDateString(getLogicalNow())
}

export function tomorrowString(): string {
  const date = getLogicalNow()
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

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`)
}

/** Понедельник недели, в которую попадает dateStr */
export function getWeekStart(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  const weekday = date.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  date.setDate(date.getDate() + diff)
  return localDateString(date)
}

export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr)
  date.setDate(date.getDate() + days)
  return localDateString(date)
}

export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function formatWeekRange(weekStart: string): string {
  const weekEnd = addDays(weekStart, 6)
  const startLabel = new Date(`${weekStart}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
  const endLabel = new Date(`${weekEnd}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${startLabel} — ${endLabel}`
}

export function previewText(text: string, maxLength = 120): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength)}…`
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
