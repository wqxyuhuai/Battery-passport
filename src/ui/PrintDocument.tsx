import { CheckCircle } from '@phosphor-icons/react'
import { UI } from '../data/copy'
import { LOCALE } from '../data/schema'
import type { Field, Lang, Panel } from '../data/types'
import { BrandMark } from './BrandMark'

function PrintValue({ field }: { field: Field }) {
  return (
    <div className="print-field">
      <div className="print-field-label">{field.label}</div>
      <div className="print-field-value">
        {field.value.split('\n').map((line, index) => (
          <span key={`${line}-${index}`}>{line}</span>
        ))}
        {field.href && <a href={field.href}>{field.href}</a>}
      </div>
    </div>
  )
}

export type PrintMetric = { label: string; value: string; unit: string }
export type PrintIdentity = {
  dppId: string
  serial: string
  model: string
  updated: string
  status: string
}

/** Print-only document tree. Hidden on screen, rendered by the browser print dialog. */
export function PrintDocument({
  lang,
  productName,
  panels,
  identity,
  metrics,
}: {
  lang: Lang
  productName: string
  panels: Panel[]
  identity: PrintIdentity
  metrics: PrintMetric[]
}) {
  const ui = UI[lang]
  const generated = new Intl.DateTimeFormat(LOCALE[lang], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())

  return (
    <div className="print-document" aria-hidden="true">
      <header className="print-header">
        <div className="print-brand">
          <BrandMark size={28} />
          <div>
            <strong>{ui.brand}</strong>
            <span>{ui.product}</span>
          </div>
        </div>
        <div className="print-stamp">
          <CheckCircle size={16} weight="fill" />
          {ui.confirmed}
        </div>
      </header>

      <div className="print-eyebrow">{ui.eyebrow}</div>
      <h1 className="print-title">{productName}</h1>
      <p className="print-subtitle">{ui.printTitle}</p>

      <dl className="print-identity">
        <div>
          <dt>{ui.dppId}</dt>
          <dd>{identity.dppId}</dd>
        </div>
        <div>
          <dt>{ui.serial}</dt>
          <dd>{identity.serial}</dd>
        </div>
        <div>
          <dt>{ui.model}</dt>
          <dd>{identity.model}</dd>
        </div>
        <div>
          <dt>{ui.updated}</dt>
          <dd>{identity.updated}</dd>
        </div>
      </dl>

      <div className="print-metrics">
        {metrics.map((metric) => (
          <div className="print-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.value} <small>{metric.unit}</small>
            </strong>
          </div>
        ))}
      </div>

      {panels.map((panel) => (
        <section className="print-panel" key={panel.title}>
          <h2>{panel.title}</h2>
          {panel.sections.map((section) => (
            <div className="print-section" key={section.title}>
              <h3>{section.title}</h3>
              <div className="print-fields">
                {section.fields.map((field) => (
                  <PrintValue field={field} key={field.id} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <footer className="print-footer">
        <span>{ui.printFooter}</span>
        <span>
          {ui.generated}: {generated}
        </span>
      </footer>
    </div>
  )
}
