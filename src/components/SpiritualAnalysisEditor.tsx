import { useEffect, useState } from 'react'
import * as db from '../lib/db'
import type { DailyEntry } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../context/TrackerContext'
import { todayString } from '../utils/dates'
import { inputClass, mutedTextClass } from '../utils/ui'

interface SpiritualAnalysisEditorProps {
  entryDate: string
  text: string
  onSaved: (entry: DailyEntry | null) => void
  placeholder?: string
  previewMaxLength?: number
}

export default function SpiritualAnalysisEditor({
  entryDate,
  text,
  onSaved,
  placeholder = 'Что Бог показал в этот день? За что благодарен? Допиши заметки…',
  previewMaxLength = 200,
}: SpiritualAnalysisEditorProps) {
  const { userId } = useAuth()
  const { syncSpiritualAnalysis } = useTracker()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [expanded, setExpanded] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    setDraft(text)
  }, [text])

  const trimmed = text.trim()
  const isLong = trimmed.length > previewMaxLength
  const preview =
    isLong && !expanded && !editing
      ? `${trimmed.slice(0, previewMaxLength)}…`
      : trimmed

  async function handleSave() {
    if (!userId) return

    setError('')
    setSavedMessage('')
    setPending(true)

    try {
      const saved = await db.saveDailyEntry(userId, entryDate, draft)
      if (entryDate === todayString()) {
        syncSpiritualAnalysis(draft)
      }

      const hasText = draft.trim().length > 0
      onSaved(hasText ? saved : null)
      setEditing(false)
      setExpanded(false)
      setSavedMessage('Сохранено')
      setTimeout(() => setSavedMessage(''), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setPending(false)
    }
  }

  function handleCancel() {
    setDraft(text)
    setEditing(false)
    setError('')
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
          autoFocus
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={pending}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {pending ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Отмена
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {trimmed ? (
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {previewMaxLength >= 100 && !expanded ? (
            <span className={previewMaxLength <= 100 ? 'italic' : ''}>«{preview}»</span>
          ) : (
            preview
          )}
        </p>
      ) : (
        <p className={`${mutedTextClass} italic`}>Пока нет записи — можно дописать</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
        >
          {trimmed ? 'Редактировать' : 'Добавить запись'}
        </button>
        {isLong && !editing && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {expanded ? 'Свернуть' : 'Читать полностью'}
          </button>
        )}
        {savedMessage && (
          <span className="text-sm text-green-700 dark:text-green-400">{savedMessage}</span>
        )}
      </div>
    </div>
  )
}
