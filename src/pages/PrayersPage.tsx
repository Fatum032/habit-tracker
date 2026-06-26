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

const STATUS_ORDER: PrayerTopicStatus[] = ['active', 'waiting', 'answered', 'closed']

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
      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{topic.title}</p>
          {topic.lastEntryPreview ? (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.lastEntryPreview}</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1 italic">Пока нет записей</p>
          )}
        </div>
        <div className="shrink-0 text-right space-y-1">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${PRAYER_TOPIC_STATUS_STYLES[topic.status]}`}
          >
            {PRAYER_TOPIC_STATUS_LABELS[topic.status]}
          </span>
          {topic.lastEntryDate && (
            <p className="text-xs text-gray-400">{formatShortDate(topic.lastEntryDate)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function PrayersPage() {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<PrayerTopicWithMeta[]>([])

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
    for (const status of STATUS_ORDER) map.set(status, [])
    for (const topic of topics) {
      map.get(topic.status)?.push(topic)
    }
    return map
  }, [topics])

  if (loading) {
    return <p className="text-gray-500">Загрузка...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Молитвы</h1>
          <p className="text-sm text-gray-500 mt-1">
            Сферы молитвы и как они меняются со временем
          </p>
        </div>
        <Link
          to="/prayers/new"
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
        >
          + Новая сфера
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {topics.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Пока нет сфер молитвы</p>
          <Link
            to="/prayers/new"
            className="text-violet-600 hover:text-violet-800 font-medium text-sm"
          >
            Создать первую →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {STATUS_ORDER.map((status) => {
            const items = grouped.get(status) ?? []
            if (items.length === 0) return null

            return (
              <section key={status}>
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  {STATUS_SECTION_LABELS[status]}
                </h2>
                <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {items.map((topic) => (
                    <li key={topic.id}>
                      <TopicCard topic={topic} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
