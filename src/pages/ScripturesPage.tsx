import { useState } from 'react'
import VerseTooltip from '../components/VerseTooltip'
import { scriptureCategories } from '../data/scriptures'
import type { Scripture } from '../data/scriptures'
import { toShortReference } from '../utils/bibleRefs'

function ScriptureListItem({
  scripture,
  isOpen,
  onToggle,
}: {
  scripture: Scripture
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          isOpen ? 'bg-violet-50 text-violet-800' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="shrink-0">
          <VerseTooltip reference={scripture.reference} text={scripture.text} />
        </span>
        {!isOpen && (
          <span className="text-xs text-gray-400 truncate hidden sm:inline">
            — наведи для текста
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mx-3 mb-2 mt-1 px-3 py-3 bg-violet-50/50 border-l-2 border-violet-300 rounded-r-md space-y-3">
          <div>
            <p className="text-xs font-medium text-violet-700 mb-2">{scripture.reference}</p>
            <p className="text-sm text-gray-800 leading-relaxed italic">«{scripture.text}»</p>
          </div>

          {scripture.crossRefs && scripture.crossRefs.length > 0 && (
            <div className="pt-2 border-t border-violet-200/60">
              <p className="text-xs text-gray-500 mb-2">Перекрёстные ссылки — наведи на сокращение:</p>
              <p className="text-sm leading-loose flex flex-wrap gap-x-1 gap-y-1 items-center">
                <span className="text-gray-500 text-xs mr-1">См. также:</span>
                {scripture.crossRefs.map((cross, index) => (
                  <span key={cross.reference} className="inline-flex items-center">
                    <VerseTooltip reference={cross.reference} text={cross.text} />
                    {index < scripture.crossRefs!.length - 1 && (
                      <span className="text-gray-300 mx-1">·</span>
                    )}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function ScripturesPage() {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [openScriptureId, setOpenScriptureId] = useState<string | null>(null)

  function toggleCategory(id: string) {
    setOpenCategoryId((current) => (current === id ? null : id))
    setOpenScriptureId(null)
  }

  function toggleScripture(id: string) {
    setOpenScriptureId((current) => (current === id ? null : id))
  }

  const totalVerses = scriptureCategories.reduce(
    (sum, category) => sum + category.scriptures.length,
    0
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Местописания</h1>
        <p className="text-sm text-gray-500 mt-1">
          {scriptureCategories.length} тем · {totalVerses} мест из Писания. Наведи на сокращение
          ({toShortReference('Притчи 16:18')}) — увидишь стих. Нажми — полный текст и перекрёстные
          ссылки.
        </p>
      </div>

      <ul className="space-y-2">
        {scriptureCategories.map((category) => {
          const isOpen = openCategoryId === category.id

          return (
            <li
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-semibold text-gray-900">{category.title}</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {category.description} · {category.scriptures.length} мест
                  </p>
                </div>
                <span
                  className={`text-gray-400 text-lg shrink-0 transition-transform ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                >
                  ›
                </span>
              </button>

              {isOpen && (
                <ul className="border-t border-gray-100 px-2 py-2 space-y-1">
                  {category.scriptures.map((scripture) => (
                    <ScriptureListItem
                      key={scripture.id}
                      scripture={scripture}
                      isOpen={openScriptureId === scripture.id}
                      onToggle={() => toggleScripture(scripture.id)}
                    />
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <p className="text-xs text-gray-400">Текст по синодальному переводу Библии</p>
    </div>
  )
}
