export interface CrossRef {
  reference: string
  text: string
}

export interface Scripture {
  id: string
  reference: string
  text: string
  crossRefs?: CrossRef[]
}

export interface ScriptureCategory {
  id: string
  title: string
  description: string
  scriptures: Scripture[]
}

/** Удобный конструктор перекрёстных ссылок */
export function refs(...items: CrossRef[]): CrossRef[] {
  return items
}
