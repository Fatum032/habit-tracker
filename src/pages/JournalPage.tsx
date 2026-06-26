import { useEffect, useMemo, useState } from 'react'
import * as db from '../lib/db'
import type { DailyEntry } from '../types'
import { useAuth } from '../context/AuthContext'
import SpiritualAnalysisEditor from '../components/SpiritualAnalysisEditor'
import { formatDisplayDate } from '../utils/dates'
import { cardClass, errorBoxClass, inputClass, mutedTextClass, pageTitleClass } from '../utils/ui'

function JournalEntryCard({
  entry,
  onSaved,
}: {
  entry: DailyEntry
  onSaved: (entryDate: string, saved: DailyEntry | null) => void
}) {
  return (
    <li className={`${cardClass} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
          {formatDisplayDate(entry.entryDate)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          обновлено {new Date(entry.updatedAt).toLocaleDateString('ru-RU')}
        </p>
      </div>
      <SpiritualAnalysisEditor
        entryDate={entry.entryDate}
        text={entry.spiritualAnalysis}
        onSaved={(saved) => onSaved(entry.entryDate, saved)}
        previewMaxLength={200}
      />
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

  function handleSaved(entryDate: string, saved: DailyEntry | null) {
    if (!saved) {
      setEntries((prev) => prev.filter((entry) => entry.entryDate !== entryDate))
      return
    }

    setEntries((prev) => {
      const index = prev.findIndex((entry) => entry.entryDate === entryDate)
      if (index === -1) {
        return [saved, ...prev].sort((a, b) => b.entryDate.localeCompare(a.entryDate))
      }
      const next = [...prev]
      next[index] = saved
      return next
    })
  }

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
        <p className={`${mutedTextClass} mt-1`}>
          История духовного анализа — можно редактировать и дописывать
        </p>
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
          <p className={`${mutedTextClass} mt-2 text-sm`}>
            Напиши анализ на главной или в разделе «Неделя»
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} p-6 text-center`}>
          <p className={mutedTextClass}>Ничего не найдено по запросу «{search}»</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onSaved={handleSaved} />
          ))}
        </ul>
      )}
    </div>
  )
}
