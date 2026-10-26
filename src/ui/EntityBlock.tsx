import type { Field } from '../data/types'
import { isKeyValueLine, splitKeyValue, splitLines } from '../data/format'
import { InlineValue } from './FieldCard'

export type EntityRecord = {
  title: string
  name: string
  address: string
  meta: Array<{ key: string; value: string }>
}

export function parseEntity(field: Field): EntityRecord {
  const entity: EntityRecord = { title: field.label, name: '', address: '', meta: [] }

  for (const line of splitLines(field.value)) {
    if (!isKeyValueLine(line)) {
      if (!entity.name) entity.name = line
      else if (!entity.address) entity.address = line
      else entity.meta.push({ key: '', value: line })
      continue
    }

    const [key, value] = splitKeyValue(line)
    if (!entity.name && /^(company|unternehmen)$/i.test(key)) entity.name = value
    else if (!entity.address && /(address|adresse)/i.test(key)) entity.address = value
    else entity.meta.push({ key, value })
  }

  return entity
}

export function EntityBlock({ field }: { field: Field }) {
  const entity = parseEntity(field)

  return (
    <div className="entity">
      <div className="entity-label">{entity.title}</div>
      <div className="entity-name">{entity.name}</div>
      {entity.address && <p className="entity-address">{entity.address}</p>}
      {entity.meta.length > 0 && (
        <dl className="entity-meta">
          {entity.meta.map((item, index) => (
            <div className="entity-meta-row" key={`${item.key}-${index}`}>
              {item.key ? <dt>{item.key}</dt> : <dt aria-hidden="true" />}
              <dd>
                <InlineValue value={item.value} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
