import type { Field, Lang } from './types'

/** Static per-field presentation rules. Field ids follow the EU battery-passport schema. */
const MONO_FIELDS = new Set(['001', '005', '006', '007', '008', '010', '011', '012'])
const WIDE_FIELDS = new Set(['042', '043', '044'])
const CHIP_FIELDS = new Set(['009', '042'])
const STRONG_FIELDS = new Set(['002'])
export const ENTITY_FIELDS = new Set(['015', '014'])
export const SPLIT_FIELDS = new Set(['043', '044'])

/** Single source of truth for the panels rendered by the UI. */
export const TAB_KEYS = ['basic', 'performance', 'materials', 'health', 'compliance'] as const
export type TabKey = (typeof TAB_KEYS)[number]

/** Field whose value feeds each headline spec in the hero. */
export const METRICS = {
  energy: '060',
  voltage: '066',
  capacity: '057',
  cycles: '082',
  mass: '021',
} as const
export type MetricKey = keyof typeof METRICS
export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[]

/** Fields lifted into the hero identity block. */
export const IDENTITY_FIELDS = {
  dppId: '005',
  serial: '011',
  model: '010',
  updated: '004',
  status: '002',
} as const

/** Tabs whose live telemetry is not yet connected. */
export const TELEMETRY_PENDING_TABS: readonly TabKey[] = ['health']

type FieldFormat = {
  chips?: boolean
  mono?: boolean
  wide?: boolean
  strong?: boolean
}

/** Resolves how a field is presented. Formatting stays a view concern, not data. */
export function fieldFormat(field: Field): FieldFormat {
  return {
    chips: field.chips === true || CHIP_FIELDS.has(field.id),
    mono: MONO_FIELDS.has(field.id),
    wide: WIDE_FIELDS.has(field.id),
    strong: STRONG_FIELDS.has(field.id),
  }
}

export function isAwaitingValue(value: string | null | undefined): boolean {
  const trimmed = (value ?? '').trim()
  return trimmed === '' || trimmed === '--' || trimmed === '\u2014'
}

/** Locale used for number and date formatting. */
export const LOCALE: Record<Lang, string> = { zh: 'zh-CN', en: 'en-GB', de: 'de-DE' }
