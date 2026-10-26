import { ENTITY_FIELDS, SPLIT_FIELDS } from '../data/schema'
import type { Section } from '../data/types'
import { EntityBlock } from './EntityBlock'
import { FieldCard } from './FieldCard'

export function SectionBlock({ section, awaitingLabel }: { section: Section; awaitingLabel: string }) {
  const entities = section.fields.filter((field) => ENTITY_FIELDS.has(field.id))
  const fields = section.fields.filter((field) => !ENTITY_FIELDS.has(field.id))
  const splitFields = fields.filter((field) => SPLIT_FIELDS.has(field.id))
  const gridFields = fields.filter((field) => !SPLIT_FIELDS.has(field.id))
  const paired = splitFields.length === 2

  return (
    <section className="section" aria-label={section.title}>
      <h3 className="section-title">{section.title}</h3>
      <div className="section-body">
        {entities.length > 0 && (
          <div className="entity-grid">
            {entities.map((field) => (
              <EntityBlock key={field.id} field={field} />
            ))}
          </div>
        )}
        {gridFields.length > 0 && (
          <div
            className={`field-grid${entities.length > 0 ? ' field-grid--after-entities' : ''}${gridFields.length === 1 ? ' field-grid--single' : ''}`}
          >
            {gridFields.map((field) => (
              <FieldCard key={field.id} field={field} awaitingLabel={awaitingLabel} />
            ))}
          </div>
        )}
        {paired && (
          <div
            className={`field-split${gridFields.length > 0 || entities.length > 0 ? ' field-split--stacked' : ''}`}
          >
            {splitFields.map((field) => (
              <FieldCard key={field.id} field={field} awaitingLabel={awaitingLabel} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
