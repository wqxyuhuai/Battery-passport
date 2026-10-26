import { TAB_KEYS } from './schema'
import type { Field, Panel } from './types'

/**
 * Read access over one language payload. Panels are keyed by index ("0".."4")
 * in the order declared by TAB_KEYS.
 */
export function createPassport(panels: Record<string, Panel>) {
  const byTab = Object.fromEntries(
    TAB_KEYS.map((key, index) => [key, panels[String(index)]]),
  ) as Record<(typeof TAB_KEYS)[number], Panel>

  const allFields = Object.values(byTab).flatMap((panel) =>
    panel.sections.flatMap((section) => section.fields),
  )
  const byId = new Map(allFields.map((field) => [field.id, field]))

  return {
    panels: TAB_KEYS.map((key) => byTab[key]),
    panel(tab: (typeof TAB_KEYS)[number]): Panel {
      return byTab[tab]
    },
    field(id: string): Field | undefined {
      return byId.get(id)
    },
    fields: allFields,
  }
}

export type Passport = ReturnType<typeof createPassport>
