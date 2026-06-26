import { useEffect, useState } from 'react'
import type { PlanItem } from '../types'

function PlanRow({
  plan,
  onUpdate,
  onRemove,
}: {
  plan: PlanItem
  onUpdate: (id: string, content: string, time: string | null) => void
  onRemove: (id: string) => void
}) {
  const [content, setContent] = useState(plan.content)
  const [time, setTime] = useState(plan.scheduledTime ?? '')

  useEffect(() => {
    setContent(plan.content)
    setTime(plan.scheduledTime ?? '')
  }, [plan.content, plan.scheduledTime])

  function save() {
    const trimmed = content.trim()
    if (!trimmed) return
    if (trimmed === plan.content && (time || null) === plan.scheduledTime) return
    onUpdate(plan.id, trimmed, time || null)
  }

  return (
    <li className="flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={save}
        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={save}
        className="w-28 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <button
        type="button"
        onClick={() => onRemove(plan.id)}
        className="px-2 py-2 text-gray-400 hover:text-red-600 text-sm shrink-0"
        title="Удалить"
      >
        ×
      </button>
    </li>
  )
}

interface PlanListSectionProps {
  title: string
  subtitle?: string
  plans: PlanItem[]
  emptyMessage: string
  placeholder?: string
  onAdd: (content: string, scheduledTime: string | null) => Promise<string | null>
  onUpdate: (id: string, content: string, scheduledTime: string | null) => void
  onRemove: (id: string) => void
}

export default function PlanListSection({
  title,
  subtitle,
  plans,
  emptyMessage,
  placeholder = 'Молитва, чтение...',
  onAdd,
  onUpdate,
  onRemove,
}: PlanListSectionProps) {
  const [newPlan, setNewPlan] = useState('')
  const [newPlanTime, setNewPlanTime] = useState('13:00')
  const [error, setError] = useState('')

  async function handleAdd() {
    setError('')
    const message = await onAdd(newPlan, newPlanTime || null)
    if (message) {
      setError(message)
      return
    }
    setNewPlan('')
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
      <div>
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan) => (
            <PlanRow
              key={plan.id}
              plan={plan}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newPlan}
          onChange={(e) => setNewPlan(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleAdd()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="time"
          value={newPlanTime}
          onChange={(e) => setNewPlanTime(e.target.value)}
          className="w-full sm:w-28 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 shrink-0"
        >
          Добавить
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}
