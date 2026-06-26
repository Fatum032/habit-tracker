import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as db from '../lib/db'
import type { PrayerEntry, PrayerEntryType, PrayerTopic, PrayerTopicStatus } from '../types'
import { formatShortDate, todayString } from '../utils/dates'
import {
  PRAYER_ENTRY_TYPE_LABELS,
  PRAYER_ENTRY_TYPE_STYLES,
  PRAYER_TOPIC_STATUS_LABELS,
  PRAYER_TOPIC_STATUS_STYLES,
} from '../utils/prayerLabels'
import { useAuth } from '../context/AuthContext'

const ENTRY_TYPES: PrayerEntryType[] = ['request', 'update', 'answered']
const TOPIC_STATUSES: PrayerTopicStatus[] = ['active', 'waiting', 'answered', 'closed']

function EntryForm({
  initialDate,
  initialContent,
  initialType,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  initialDate: string
  initialContent: string
  initialType: PrayerEntryType
  submitLabel: string
  pending: boolean
  onSubmit: (date: string, content: string, type: PrayerEntryType) => Promise<void>
  onCancel?: () => void
}) {
  const [entryDate, setEntryDate] = useState(initialDate)
  const [content, setContent] = useState(initialContent)
  const [entryType, setEntryType] = useState<PrayerEntryType>(initialType)

  useEffect(() => {
    setEntryDate(initialDate)
    setContent(initialContent)
    setEntryType(initialType)
  }, [initialDate, initialContent, initialType])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(entryDate, content.trim(), entryType)
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEntryType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                entryType === type
                  ? PRAYER_ENTRY_TYPE_STYLES[type]
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {PRAYER_ENTRY_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        placeholder="О чём молился, что изменилось, что нового…"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? 'Сохраняем…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}

function TimelineEntry({
  entry,
  onEdit,
  onDelete,
}: {
  entry: PrayerEntry
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <li className="relative pl-6 pb-6 last:pb-0">
      <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-violet-400 ring-4 ring-violet-50" />
      <span className="absolute left-[4px] top-4 bottom-0 w-px bg-violet-100 last:hidden" />

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {formatShortDate(entry.entryDate)}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRAYER_ENTRY_TYPE_STYLES[entry.entryType]}`}
            >
              {PRAYER_ENTRY_TYPE_LABELS[entry.entryType]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-violet-600 hover:text-violet-800"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
      </div>
    </li>
  )
}

export default function PrayerTopicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userId } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState<PrayerTopic | null>(null)
  const [entries, setEntries] = useState<PrayerEntry[]>([])
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [entryPending, setEntryPending] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleEditing, setTitleEditing] = useState(false)
  const [titlePending, setTitlePending] = useState(false)

  async function loadTopic() {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const [topicData, entriesData] = await Promise.all([
        db.fetchPrayerTopic(id),
        db.fetchPrayerEntries(id),
      ])

      if (!topicData) {
        setError('Сфера не найдена')
        setTopic(null)
        setEntries([])
        return
      }

      setTopic(topicData)
      setTitleDraft(topicData.title)
      setEntries(entriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить сферу')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTopic()
  }, [id])

  async function handleStatusChange(status: PrayerTopicStatus) {
    if (!topic) return

    try {
      const updated = await db.updatePrayerTopic(topic.id, { status })
      setTopic(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус')
    }
  }

  async function handleSaveTitle() {
    if (!topic) return

    const trimmed = titleDraft.trim()
    if (!trimmed) return

    setTitlePending(true)
    try {
      const updated = await db.updatePrayerTopic(topic.id, { title: trimmed })
      setTopic(updated)
      setTitleEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить название')
    } finally {
      setTitlePending(false)
    }
  }

  async function handleDeleteTopic() {
    if (!topic) return
    if (!window.confirm(`Удалить сферу «${topic.title}» и все записи?`)) return

    try {
      await db.deletePrayerTopic(topic.id)
      navigate('/prayers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить сферу')
    }
  }

  async function handleCreateEntry(date: string, content: string, type: PrayerEntryType) {
    if (!userId || !topic || !content) return

    setEntryPending(true)
    setError(null)

    try {
      const entry = await db.createPrayerEntry(userId, topic.id, date, content, type)
      setEntries((prev) =>
        [...prev, entry].sort((a, b) => {
          if (a.entryDate !== b.entryDate) return a.entryDate.localeCompare(b.entryDate)
          return a.createdAt.localeCompare(b.createdAt)
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить запись')
    } finally {
      setEntryPending(false)
    }
  }

  async function handleUpdateEntry(
    entryId: string,
    date: string,
    content: string,
    type: PrayerEntryType
  ) {
    if (!topic || !content) return

    setEntryPending(true)
    setError(null)

    try {
      const updated = await db.updatePrayerEntry(entryId, topic.id, {
        entryDate: date,
        content,
        entryType: type,
      })
      setEntries((prev) => prev.map((entry) => (entry.id === entryId ? updated : entry)))
      setEditingEntryId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить запись')
    } finally {
      setEntryPending(false)
    }
  }

  async function handleDeleteEntry(entryId: string) {
    if (!topic) return
    if (!window.confirm('Удалить эту запись?')) return

    try {
      await db.deletePrayerEntry(entryId, topic.id)
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      if (editingEntryId === entryId) setEditingEntryId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить запись')
    }
  }

  if (loading) {
    return <p className="text-gray-500">Загрузка...</p>
  }

  if (!topic) {
    return (
      <div className="space-y-4">
        <Link to="/prayers" className="text-sm text-violet-600 hover:text-violet-800">
          ← Молитвы
        </Link>
        <p className="text-gray-500">{error ?? 'Сфера не найдена'}</p>
      </div>
    )
  }

  const editingEntry = entries.find((entry) => entry.id === editingEntryId)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/prayers" className="text-sm text-violet-600 hover:text-violet-800">
          ← Молитвы
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {titleEditing ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => void handleSaveTitle()}
                  disabled={titlePending}
                  className="text-sm text-violet-600 hover:text-violet-800"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(topic.title)
                    setTitleEditing(false)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">{topic.title}</h1>
                <button
                  type="button"
                  onClick={() => setTitleEditing(true)}
                  className="text-sm text-violet-600 hover:text-violet-800"
                >
                  Изменить
                </button>
              </div>
            )}
            {topic.description && (
              <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{topic.description}</p>
            )}
          </div>

          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRAYER_TOPIC_STATUS_STYLES[topic.status]}`}
          >
            {PRAYER_TOPIC_STATUS_LABELS[topic.status]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Статус сферы:</span>
          {TOPIC_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => void handleStatusChange(status)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                topic.status === status
                  ? PRAYER_TOPIC_STATUS_STYLES[status]
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {PRAYER_TOPIC_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void handleDeleteTopic()}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Удалить сферу
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Хронология</h2>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Пока нет записей — добавь первую ниже.</p>
        ) : (
          <ol className="relative border-l-0">
            {entries.map((entry) =>
              editingEntryId === entry.id && editingEntry ? (
                <li key={entry.id} className="mb-4 bg-violet-50/50 border border-violet-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Редактирование записи</p>
                  <EntryForm
                    initialDate={editingEntry.entryDate}
                    initialContent={editingEntry.content}
                    initialType={editingEntry.entryType}
                    submitLabel="Сохранить"
                    pending={entryPending}
                    onSubmit={(date, content, type) =>
                      handleUpdateEntry(entry.id, date, content, type)
                    }
                    onCancel={() => setEditingEntryId(null)}
                  />
                </li>
              ) : (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditingEntryId(entry.id)}
                  onDelete={() => void handleDeleteEntry(entry.id)}
                />
              )
            )}
          </ol>
        )}
      </section>

      {!editingEntryId && (
        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <h2 className="text-lg font-medium text-gray-900">Новая запись</h2>
          <EntryForm
            initialDate={todayString()}
            initialContent=""
            initialType="request"
            submitLabel="Добавить"
            pending={entryPending}
            onSubmit={handleCreateEntry}
          />
        </section>
      )}
    </div>
  )
}
