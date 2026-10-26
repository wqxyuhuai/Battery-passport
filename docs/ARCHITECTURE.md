# Architecture

The app is a single-page, statically built React application. There is no server
component in the current build: all passport content is bundled at build time. The
data entry point is isolated so the same UI can later read from an API.

## Layers

```text
src/main.tsx                 React entry point + global stylesheet
src/App.tsx                  Page composition, UI state, keyboard + focus handling
src/ui/*                     Presentational components (no data fetching)
src/data/source.ts           The only module that knows where content comes from
src/data/catalogue.ts        Turns a raw payload into a per-language catalogue
src/data/repository.ts       Read model: panels, panel(tab), field(id)
src/data/schema.ts           Field ids, tab keys, metric mapping, format rules
src/data/copy.ts             Static UI copy for zh / en / de
src/data/format.ts           Pure string/number formatting helpers
src/data/types.ts            Shared types (Field, Section, Panel, PassportContent)
src/data/demo-data.json      Demo payload (same shape as the planned API response)
scripts/validate-data.mjs    Contract validator used by `npm run build`
```

Dependencies point downwards only: App -> ui -> data. Presentational components
never import the payload directly; they receive Panel, Section or Field props.
That keeps them reusable once data arrives over the network.

## Runtime flow

1. `source.ts` loads one payload and calls `createCatalogue()`.
2. `createCatalogue()` builds one `Locale` per language. Each locale carries the
   product name plus a `Passport` read model exposing `panels`, `panel(tab)` and
   `field(id)`.
3. `App` keeps three pieces of view state: active language, active tab, search query.
4. The hero identity block and the five headline specs are resolved from field ids
   declared in `schema.ts` (`IDENTITY_FIELDS`, `METRICS`), not from hardcoded strings.
5. Search filters the active panel only; switching tabs clears the query.

Panel keys `"0"`..`"4"` map to `TAB_KEYS` in order. Keep the payload order and the
tab list in sync; `npm run validate:data` rejects missing panels.

## Presentation rules

Formatting is a view concern and lives in `schema.ts` / `ui/FieldCard.tsx`:

| Rule | Source |
| --- | --- |
| Tab order and keys | `TAB_KEYS` |
| Headline specs | `METRICS` |
| Hero identity | `IDENTITY_FIELDS` |
| Monospace / wide / chip styling | `fieldFormat()` in `schema.ts` |
| Key-value lines (Brand: Wattsonic) | parsed by `format.ts` |
| Missing values (`--`, em dash, empty) | `isAwaitingValue()` -> "Awaiting data" |
| Health telemetry notice | `TELEMETRY_PENDING_TABS` |

Chips are opt-in per field via `chips: true` in the payload; two ids (`009`, `042`)
also default to chips in `CHIP_FIELDS` for backwards compatibility. A field can change
value, language or wording without touching component code.

## Print

`PrintDocument` renders a separate, always-present but visually hidden tree. The
`@media print` block in `print.css` hides the app shell and shows that tree, so the
PDF contains every tab in one document. Keep print styles out of `styles.css`.

## Accessibility

- Tab strip implements the WAI-ARIA tabs pattern: roving tabIndex, arrow/Home/End
  keys, `aria-selected`, and a single `aria-controls="passport-panel"` panel.
- The language switcher is a listbox with Escape/Tab/arrow handling, outside-click
  dismissal and focus return to its trigger.
- A skip link targets `#passport-panel`.
- `prefers-reduced-motion` disables entrance animations and scroll animation.
