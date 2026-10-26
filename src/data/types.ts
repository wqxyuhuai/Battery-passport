export const LANGS = ['zh', 'en', 'de'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_LABELS: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
  de: 'Deutsch',
}

export type Field = {
  /** Optional: render a multi-line value as chips. Falls back to CHIP_FIELDS in schema.ts. */
  chips?: boolean
  href: string | null
  id: string
  label: string
  locked: boolean
  value: string
}

export type Section = {
  title: string
  fields: Field[]
}

export type Panel = {
  title: string
  sections: Section[]
}

/** Payload shape for one language, as delivered by the passport content source. */
export type PassportContent = {
  productName: string
  panels: Record<string, Panel>
}
