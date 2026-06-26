import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import * as db from '../lib/db'
import type { PrayerTopicStatus, PrayerTopicWithMeta } from '../types'
import { formatShortDate } from '../utils/dates'
import {
  PRAYER_TOPIC_STATUS_LABELS,
  PRAYER_TOPIC_STATUS_STYLES,
} from '../utils/prayerLabels'
import { useAuth } from '../context/AuthContext'
import { cardClass, errorBoxClass, mutedTextClass, pageTitleClass } from '../utils/ui'

const ACTIVE_STATUSES: PrayerTopicStatus[] = ['active', 'waiting']
const ARCHIVE_STATUSES: PrayerTopicStatus[] = ['answered', 'closed']

const STATUS_SECTION_LABELS: Record<PrayerTopicStatus, string> = {
  active: 'Активные',
  waiting: 'Жду',
  answered: 'Ответ получен',
  closed: 'Закрытые',
}

function TopicCard({ topic }: { topic: PrayerTopicWithMeta }) {
  return (
    <Link
      to={`/prayers/${topic.id}`}
      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{topic.title}</p>
          {topic.lastEntryPreview ? (
            <p className={`${mutedTextClass} mt-1 line-clamp-2`}>{topic.lastEntryPreview}</p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 italic">Пока нет записей</p>
          )}
        </div>
        <div className="shrink-0 text-right space-y-1">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${PRAYER_TOPIC_STATUS_STYLES[topic.status]}`}
          >
            {PRAYER_TOPIC_STATUS_LABELS[topic.status]}
          </span>
          {topic.lastEntryDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{formatShortDate(topic.lastEntryDate)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

function TopicSection({ status, items }: { status: PrayerTopicStatus; items: PrayerTopicWithMeta[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {STATUS_SECTION_LABELS[status]}
      </h2>
      <ul className={`${cardClass} divide-y divide-gray-100 dark:divide-gray-700`}>
        {items.map((topic) => (
          <li key={topic.id}>
            <TopicCard topic={topic} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function PrayersPage() {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<PrayerTopicWithMeta[]>([])
  const [archiveOpen, setArchiveOpen] = useState(false)

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await db.fetchPrayerTopicsWithMeta(userId!)
        if (!cancelled) setTopics(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить молитвы')
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

  const grouped = useMemo(() => {
    const map = new Map<PrayerTopicStatus, PrayerTopicWithMeta[]>()
    for (const status of [...ACTIVE_STATUSES, ...ARCHIVE_STATUSES]) map.set(status, [])
    for (const topic of topics) {
      map.get(topic.status)?.push(topic)
    }
    return map
  }, [topics])

  const archiveTopics = useMemo(
    () => ARCHIVE_STATUSES.flatMap((status) => grouped.get(status) ?? []),
    [grouped]
  )

  if (loading) {
    return <p className={mutedTextClass}>Загрузка...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={pageTitleClass}>Молитвы</h1>
          <p className={`${mutedTextClass} mt-1`}>Сферы молитвы и как они меняются со временем</p>
        </div>
        <Link
          to="/prayers/new"
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
        >
          + Новая сфера
        </Link>
      </div>

      {error && <p className={errorBoxClass}>{error}</p>}

      {topics.length === 0 ? (
        <div className={`${cardClass} p-8 text-center`}>
          <p className={mutedTextClass}>Пока нет сфер молитвы</p>
          <Link
            to="/prayers/new"
            className="inline-block mt-4 text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 font-medium"
          >
            Создать первую →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ACTIVE_STATUSES.map((status) => (
            <TopicSection key={status} status={status} items={grouped.get(status) ?? []} />
          ))}

          {archiveTopics.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setArchiveOpen((value) => !value)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
              >
                <span className="text-xs">{archiveOpen ? '▼' : '▶'}</span>
                Архив
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                  ({archiveTopics.length})
                </span>
              </button>

              {archiveOpen && (
                <div className="space-y-6 pl-1">
                  {ARCHIVE_STATUSES.map((status) => (
                    <TopicSection key={status} status={status} items={grouped.get(status) ?? []} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
