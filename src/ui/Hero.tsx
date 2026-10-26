import { CheckCircle } from '@phosphor-icons/react'
import type { UiCopy } from '../data/copy'

export type HeroMetric = { key: string; label: string; value: string; unit: string }
export type HeroIdentity = { dppId: string; serial: string; updated: string; status: string }

export function Hero({
  ui,
  productName,
  identity,
  metrics,
}: {
  ui: UiCopy
  productName: string
  identity: HeroIdentity
  metrics: HeroMetric[]
}) {
  return (
    <section className="hero" aria-labelledby="passport-title">
      <div className="hero-main">
        <span className="eyebrow">{ui.eyebrow}</span>
        <h1 className="hero-title" id="passport-title">
          {productName}
        </h1>
        <p className="hero-description">{ui.heroDescription}</p>

        <dl className="hero-identity">
          <div>
            <dt>{ui.dppId}</dt>
            <dd>{identity.dppId}</dd>
          </div>
          <div>
            <dt>{ui.serial}</dt>
            <dd>{identity.serial}</dd>
          </div>
          <div>
            <dt>{ui.updated}</dt>
            <dd>{identity.updated}</dd>
          </div>
        </dl>
      </div>

      <aside className="hero-specs" aria-label={ui.coreSpecs}>
        <div className="specs-head">
          <h2 className="specs-title">{ui.coreSpecs}</h2>
          <span className="status-pill">
            <CheckCircle size={18} weight="fill" />
            {identity.status}
          </span>
        </div>
        <dl className="specs-list">
          {metrics.map((metric) => (
            <div className="spec" key={metric.key}>
              <dt>{metric.label}</dt>
              <dd>
                <strong>{metric.value}</strong>
                {metric.unit && <span>{metric.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  )
}
