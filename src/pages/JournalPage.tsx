import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as db from '../lib/db'
import type { DailyEntry } from '../types'
import { useAuth } from '../context/AuthContext'
import { formatDisplayDate } from '../utils/dates'
import { cardClass, errorBoxClass, inputClass, mutedTextClass, pageTitleClass } from '../utils/ui'

function JournalEntry({ entry }: { entry: DailyEntry }) {
  const [expanded, setExpanded] = useState(false)
  const text = entry.spiritualAnalysis.trim()
  const isLong = text.length > 200
  const preview = isLong && !expanded ? `${text.slice(0, 200)}…` : text

  return (
    <li className={`${cardClass} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
          {formatDisplayDate(entry.entryDate)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {new Date(entry.updatedAt).toLocaleDateString('ru-RU')}
        </p>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {preview}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
        >
          {expanded ? 'Свернуть' : 'Читать полностью'}
        </button>
      )}
    </li>
  )
}

export default function JournalPage() {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await db.fetchDailyEntriesJournal(userId!)
        if (!cancelled) setEntries(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить журнал')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entries
    return entries.filter((entry) => entry.spiritualAnalysis.toLowerCase().includes(query))
  }, [entries, search])

  if (loading) {
    return <p className={mutedTextClass}>Загрузка...</p>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className={pageTitleClass}>Журнал</h1>
        <p className={`${mutedTextClass} mt-1`}>История духовного анализа</p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по тексту..."
        className={inputClass}
      />

      {error && <p className={errorBoxClass}>{error}</p>}

      {entries.length === 0 ? (
        <div className={`${cardClass} p-8 text-center`}>
          <p className={mutedTextClass}>Пока нет записей в журнале</p>
          <Link
            to="/"
            className="inline-block mt-4 text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400"
          >
            Написать духовный анализ на сегодня →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} p-6 text-center`}>
          <p className={mutedTextClass}>Ничего не найдено по запросу «{search}»</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <JournalEntry key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}
