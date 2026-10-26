import demoData from './demo-data.json'
import { createCatalogue, type Catalogue } from './catalogue'
import type { Lang, PassportContent } from './types'

export type PassportSource = Record<Lang, PassportContent>

/**
 * The only module that knows where passport content comes from.
 *
 * Demo build: bundled JSON, no network.
 * Backend build: replace this body with a fetch (see docs/DATA_INTEGRATION.md)
 * and expose `loadCatalogue()` returning a Promise<Catalogue>.
 */
export function loadCatalogue(): Catalogue {
  return createCatalogue(demoData as PassportSource)
}

export const catalogue: Catalogue = loadCatalogue()
