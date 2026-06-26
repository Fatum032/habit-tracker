import { useMemo, useState } from 'react'
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  getMonthGrid,
  todayString,
} from '../utils/dates'

interface MonthCalendarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  datesWithEvents: Set<string>
}

export default function MonthCalendar({
  selectedDate,
  onSelectDate,
  datesWithEvents,
}: MonthCalendarProps) {
  const initial = useMemo(() => {
    const [y, m] = selectedDate.split('-').map(Number)
    return { year: y, month: m - 1 }
  }, [selectedDate])

  const [year, setYear] = useState(initial.year)
  const [month, setMonth] = useState(initial.month)

  const days = getMonthGrid(year, month)
  const today = todayString()

  function goMonth(delta: number) {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="p-1 text-gray-500 hover:text-gray-800 rounded"
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-900">
          {MONTH_LABELS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="p-1 text-gray-500 hover:text-gray-800 rounded"
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dateStr, index) => {
          if (!dateStr) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today
          const hasEvents = datesWithEvents.has(dateStr)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`h-8 rounded-md text-sm relative transition-colors ${
                isSelected
                  ? 'bg-violet-600 text-white'
                  : isToday
                    ? 'bg-violet-50 text-violet-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {Number(dateStr.slice(8, 10))}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
