# Connecting real data

The UI reads through a read model, so wiring a backend is a data-layer change only.
No component in `src/ui` needs to be edited.

## 1. Contract

One payload per language, keyed by language code. `src/data/demo-data.json` is a
complete example, and `scripts/validate-data.mjs` enforces the same shape.

```ts
type FieldPayload = {
  id: string          // stable identifier, used for formatting + hero metrics
  label: string       // already translated
  value: string       // plain text; \n separates lines; "Key: value" lines become rows
  href: string | null // absolute http(s) document URL, or null
  locked: boolean     // renders as restricted
  chips?: boolean     // optional: render a multi-line value as chips
}

type PassportPayload = {
  productName: string // e.g. "Wattsonic Li-LV 5.0", already translated if needed
  panels: Record<"0" | "1" | "2" | "3" | "4", {
    title: string
    sections: Array<{ title: string; fields: FieldPayload[] }>
  }>
}

type Response = Record<"zh" | "en" | "de", PassportPayload>
```

Panel index `"0"`..`"4"` maps to `TAB_KEYS` = basic, performance, materials, health,
compliance (see `src/data/schema.ts`). Keep that order stable, or change `TAB_KEYS`
together with the payload.

### Required field ids

Some ids are referenced by name in `schema.ts`:

| Purpose | Ids |
| --- | --- |
| Hero identity | 005 DPP id, 011 serial, 010 model, 004 updated, 002 status |
| Headline specs | 060 energy, 066 voltage, 057 capacity, 082 cycles, 021 mass |

If one is missing the hero renders an empty value rather than crashing, but the record
is incomplete. The validator treats all ten as required.

### Validation

```bash
npm run validate:data                       # validate the bundled demo payload
node scripts/validate-data.mjs payload.json # validate a backend export before shipping
```

The validator checks language coverage, panel keys, field types, unique ids, identical
id sets across languages and the required hero ids. `npm run build` runs it first, so a
malformed payload fails the Cloudflare Pages build instead of shipping a broken page.

## 2. Choose a fetch strategy

Static JSON (current) — content is bundled, no network call, no loading state:

```ts
// src/data/source.ts
import demoData from "./demo-data.json"
import { createCatalogue } from "./catalogue"
import type { PassportSource } from "./source"

export const catalogue = createCatalogue(demoData as PassportSource)
```

Runtime fetch — one request per passport, cacheable by the CDN:

```ts
// src/data/source.ts
const API_BASE = import.meta.env.VITE_PASSPORT_API_URL

export async function fetchCatalogue(passportId: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/passport/${passportId}`, {
    signal,
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`passport request failed: ${res.status}`)
  return createCatalogue(await res.json())
}
```

The response must use the contract above. `VITE_PASSPORT_API_URL` is typed in
`src/vite-env.d.ts`; set it in the Cloudflare Pages environment (or a local `.env`).

Then load once in `App.tsx` and keep the resolved catalogue in state:

```tsx
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; catalogue: Catalogue }

const [state, setState] = useState<LoadState>({ status: "loading" })

useEffect(() => {
  const controller = new AbortController()
  fetchCatalogue(passportId, controller.signal)
    .then((catalogue) => setState({ status: "ready", catalogue }))
    .catch((error: unknown) => {
      if (controller.signal.aborted) return
      setState({ status: "error", message: String(error) })
    })
  return () => controller.abort()
}, [passportId])
```

Render a layout-stable skeleton while loading (the hero and panel box should keep their
size) and a retry action on error. Never fetch inside render, and never let a failed
request blank the page.

Server-rendered — render the same payload to HTML, then hydrate the app with the payload
embedded as JSON. The components are unchanged.

## 3. Per-request passport

The current build is a single product page. For many batteries, the passport id should
come from the URL (for example `/p/DPP-2027-A001`). The DPP id is already a field (005),
so the same payload contract works; only the fetch key changes. Consider a small router
or a host rule that rewrites `/p/*` to `index.html`.

Resolve the id before rendering, then pass it to `fetchCatalogue`. Keep the language in
local storage as today, but make sure the API returns that language (or all languages).

## 4. Live data (health tab)

The health panel currently shows placeholder values and an "Operational data not
connected" notice (`TELEMETRY_PENDING_TABS` in `schema.ts`). Two options:

- Periodic snapshot: merge BMS telemetry into the same field ids server-side, then
  serve the merged payload. No client change.
- Live stream: fetch telemetry separately and update only the health panel. Keep it
  behind a feature flag and show `ui.liveTelemetry` until the first message arrives;
  never let a failed stream blank the page.

Remove `health` from `TELEMETRY_PENDING_TABS` once a real source is connected.

## 5. Security and compliance notes

- Passport documents are linked with `href`. Serve authorized files from a signed URL;
  keep `locked: true` for anything that must not be public. A field cannot be both
  locked and linked.
- `href` and `value` are rendered as text/links, not HTML, so no sanitizer is needed.
  If rich text is ever required, sanitize on the server.
- Do not put access tokens in the payload. Use short-lived signed URLs instead.
- Regulatory text (EU 2023/1542 / EN 18219) must be reviewed by the compliance owner;
  demo values in `demo-data.json` are illustrative only.
- The online record is authoritative: the PDF footer already says so. Add a revision
  field if records can be superseded.

## 6. Checks before go-live

1. `npm run build` passes (validation + TypeScript + Vite).
2. All three languages present, with the same ids in every language.
3. Required hero ids present (table above).
4. No `--` placeholders left in fields that are meant to be published.
5. Numbers use one convention per language (see known data issues below).
6. Print preview shows every panel and no clipped rows.
7. Lighthouse: no layout shift on load, fonts preloaded.

## Known data issues in the demo payload

- en field `082` reads `6000cycles` (missing space) while other languages read
  `6000 cycles` / `6000 Zyklen`. Normalize units at the source.
- Timeline and warranty values mix ISO dates, localized prose and raw durations
  (`10 years`, `2027-02`). Prefer ISO-8601 in the API and format per locale if exact
  presentation matters.
- Percent, temperature and energy units are embedded in `value`. The UI splits only the
  headline specs, so keep units consistent with `splitMetric()`.
- `productName` is repeated per language. If the product name is always identical, the
  backend can return the same string; the field exists so a localized name is possible.
