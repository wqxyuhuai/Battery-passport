import { ArrowUpRight, FileText, Lock, Minus } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { isAwaitingValue, fieldFormat } from '../data/schema'
import { isKeyValueLine, splitKeyValue, splitLines } from '../data/format'
import type { Field } from '../data/types'

function DocButton({ field }: { field: Field }) {
  return (
    <a
      className="field-link"
      href={field.href ?? '#'}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${field.label} · ${field.value}`}
    >
      <FileText size={20} weight="fill" className="field-link-icon" />
      <span className="field-link-text">{field.value}</span>
      <ArrowUpRight size={18} weight="bold" />
    </a>
  )
}

function PlainLines({ lines }: { lines: string[] }) {
  return (
    <span className="field-lines">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>{line}</span>
      ))}
    </span>
  )
}

export function InlineValue({ value }: { value: string }) {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return (
      <a className="inline-link" href={value} target="_blank" rel="noreferrer noopener">
        {value}
      </a>
    )
  }
  if (value.includes('@') && !value.includes(' ')) {
    return (
      <a className="inline-link" href={`mailto:${value}`}>
        {value}
      </a>
    )
  }
  return <>{value}</>
}

export function StructuredLines({ lines }: { lines: string[] }) {
  return (
    <span className="field-lines field-lines--kv">
      {lines.map((line, index) => {
        if (!isKeyValueLine(line)) return <span key={`${line}-${index}`}>{line}</span>
        const [key, value] = splitKeyValue(line)
        return (
          <span className="field-kv" key={`${line}-${index}`}>
            <span className="field-kv-key">{key}</span>
            <span className="field-kv-value">
              <InlineValue value={value} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function ValueLines({ value }: { value: string }) {
  const lines = splitLines(value)
  if (lines.length === 0) return null
  if (lines.length > 1 && lines.some(isKeyValueLine)) return <StructuredLines lines={lines} />
  if (lines.length > 1) return <PlainLines lines={lines} />
  return <>{value}</>
}

export function FieldCard({ field, awaitingLabel }: { field: Field; awaitingLabel: string }) {
  const format = fieldFormat(field)
  const lines = splitLines(field.value)

  let valueNode: ReactNode
  if (field.locked) {
    valueNode = (
      <span className="field-locked">
        <Lock size={18} weight="fill" />
        {field.value}
      </span>
    )
  } else if (field.href) {
    valueNode = <DocButton field={field} />
  } else if (isAwaitingValue(field.value)) {
    valueNode = (
      <span className="field-awaiting">
        <Minus size={17} weight="bold" />
        {awaitingLabel}
      </span>
    )
  } else if (format.chips) {
    valueNode = (
      <span className="chips">
        {lines.map((line, index) => (
          <span className="chip" key={`${line}-${index}`}>
            {line}
          </span>
        ))}
      </span>
    )
  } else {
    valueNode = <ValueLines value={field.value} />
  }

  const valueClassName = ['field-value', format.mono ? 'field-value--mono' : '', format.strong ? 'field-value--strong' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`field${format.wide ? ' field--wide' : ''}${format.chips ? ' field--chips' : ''}`}>
      <div className="field-label">{field.label}</div>
      <div className={valueClassName}>{valueNode}</div>
    </div>
  )
}
