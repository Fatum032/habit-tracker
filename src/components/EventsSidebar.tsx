import { useState } from 'react'
import { useTracker } from '../context/TrackerContext'
import { formatShortDate, formatTime, todayString } from '../utils/dates'
import { cardClass, inputClass, mutedTextClass, sectionTitleClass } from '../utils/ui'
import MonthCalendar from './MonthCalendar'

export default function EventsSidebar() {
  const { events, eventDates, addEvent, removeEvent } = useTracker()
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [error, setError] = useState('')

  const upcomingEvents = events.filter((event) => event.eventDate >= todayString())

  async function handleAddEvent() {
    setError('')
    const message = await addEvent(title, selectedDate, time)
    if (message) {
      setError(message)
      return
    }
    setTitle('')
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-8">
      <section className={`${cardClass} p-4`}>
        <h2 className={`${sectionTitleClass} text-sm mb-3`}>Календарь</h2>
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          datesWithEvents={eventDates}
        />
      </section>

      <section className={`${cardClass} p-4 space-y-3`}>
        <h2 className={`${sectionTitleClass} text-sm`}>Новое мероприятие</h2>
        <p className="text-xs text-gray-400 capitalize">
          {formatShortDate(selectedDate)}
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Молитва, служение..."
          className={inputClass}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="button"
          onClick={() => void handleAddEvent()}
          className="w-full py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
        >
          Добавить
        </button>
      </section>

      <section className={`${cardClass} p-4 space-y-3`}>
        <h2 className={`${sectionTitleClass} text-sm`}>Мероприятия</h2>
        {upcomingEvents.length === 0 ? (
          <p className={mutedTextClass}>Пока нет запланированных дел</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-start justify-between gap-2 text-sm border-l-2 border-violet-200 dark:border-violet-700 pl-3 py-1"
              >
                <div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatShortDate(event.eventDate)} · {formatTime(event.eventTime)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeEvent(event.id)}
                  className="text-gray-400 hover:text-red-600 shrink-0"
                  title="Удалить"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
