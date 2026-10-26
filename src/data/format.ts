import { LOCALE } from './schema'
import type { Lang } from './types'

export function formatMetricNumber(raw: string, lang: Lang): string {
  if (!raw) return '\u2014'
  const normalized = raw.replace(',', '.')
  if (!normalized.includes('.')) {
    const value = Number(normalized.replace(/[^\d-]/g, ''))
    if (Number.isFinite(value)) return new Intl.NumberFormat(LOCALE[lang]).format(value)
  }
  return raw
}

export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function isKeyValueLine(line: string): boolean {
  return /^[A-Za-z][A-Za-z ]{1,38}:\s/.test(line)
}

export function splitKeyValue(line: string): [string, string] {
  const index = line.indexOf(':')
  return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
}

export function splitMetric(value: string): { number: string; unit: string } {
  const match = value.match(/^(-?[\d.,]+)\s*(.*)$/)
  if (!match) return { number: value, unit: '' }
  return { number: match[1], unit: match[2] }
}
