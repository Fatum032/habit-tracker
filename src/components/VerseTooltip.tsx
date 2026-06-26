import { useState } from 'react'
import { toShortReference } from '../utils/bibleRefs'

interface VerseTooltipProps {
  reference: string
  text: string
  className?: string
}

export default function VerseTooltip({ reference, text, className = '' }: VerseTooltipProps) {
  const [visible, setVisible] = useState(false)
  const short = toShortReference(reference)

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span
        tabIndex={0}
        className="cursor-help border-b border-dotted border-violet-400 text-violet-700 font-medium"
      >
        {short}
      </span>
      {visible && (
        <span
          role="tooltip"
          className="absolute z-20 bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] px-3 py-2 rounded-lg bg-gray-900 text-white text-xs leading-relaxed shadow-lg pointer-events-none"
        >
          <span className="block font-semibold text-violet-200 mb-1">{reference}</span>
          {text}
        </span>
      )}
    </span>
  )
}
