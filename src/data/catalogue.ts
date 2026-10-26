import { createPassport, type Passport } from './repository'
import type { Lang, Panel, PassportContent } from './types'

export type Locale = {
  lang: Lang
  productName: string
  passport: Passport
  panels: Panel[]
}

export type Catalogue = Record<Lang, Locale>

/** Single place that adapts a raw content payload into the UI-facing catalogue. */
export function createCatalogue(raw: Record<Lang, PassportContent>): Catalogue {
  return Object.fromEntries(
    (Object.keys(raw) as Lang[]).map((lang) => {
      const passport = createPassport(raw[lang].panels)
      const locale: Locale = {
        lang,
        productName: raw[lang].productName,
        passport,
        panels: passport.panels,
      }
      return [lang, locale]
    }),
  ) as Catalogue
}
