# Wattsonic · Digital Battery Passport

An interactive, trilingual (中文 / English / Deutsch) digital battery passport for the
**Wattsonic Li-LV 5.0** battery. It presents verified lifecycle, performance, materials,
health and compliance data in one accessible, document-like interface.

Built with React 19, TypeScript and Vite. The current build is a static site with demo
content, structured so that a backend can supply the same payload without changing any
presentational component.

## Stack

- React 19 + TypeScript
- Vite 6
- Self-hosted SF Pro webfonts (no external font requests)

## Local development

```bash
npm install
npm run dev            # http://localhost:5173
npm run validate:data  # check the payload contract
npm run build          # validate + type-check + production build -> dist/
npm run preview        # preview the built site
```

Requires Node.js 20 or newer.

## Project structure

```text
index.html                  App shell
src/App.tsx                 Page composition, tab/language/search state, print trigger
src/styles.css              Design system and screen layout
src/print.css               Print-only document layout
src/ui/                     Presentational components (no fetching)
src/data/source.ts          The only module that knows where content comes from
src/data/catalogue.ts       Payload -> per-language catalogue
src/data/repository.ts      Read model: panels, panel(tab), field(id)
src/data/schema.ts          Tab order, hero fields, presentation rules
src/data/types.ts           Payload and read-model types
src/data/copy.ts            Static UI copy for zh / en / de
src/data/format.ts          Pure formatting and parsing helpers
src/data/demo-data.json     Demo payload, same shape as the planned API response
scripts/validate-data.mjs   Payload contract validator
src/assets/fonts/           Self-hosted SF Pro webfonts
public/favicon.svg          Favicon
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — layers, runtime flow, accessibility, print
- [Data integration](docs/DATA_INTEGRATION.md) — API contract and how to connect a backend
- [Components](docs/COMPONENTS.md) — component responsibilities and conventions
- [Design notes](DESIGN.md) — visual direction and interaction rules

## Data status

All content currently comes from `src/data/demo-data.json`. Field ids follow the EU
battery-passport schema and are stable; some ids also drive the hero block and headline
specs (see `src/data/schema.ts`). Run `npm run validate:data` after editing the payload.

To connect real data, change `src/data/source.ts` only. The components already consume
the read model, so no UI code needs to change. The full procedure, including error and
loading states, is in [docs/DATA_INTEGRATION.md](docs/DATA_INTEGRATION.md).

## Deployment

The site is published with **Cloudflare Pages** connected to this GitHub repository.
Every push to `main` triggers a production build and deploy.

Cloudflare Pages build settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repository root) |
| Node version | 20 or newer |

Suggested custom domain: `passport.carlwang.cn`.

### 中文部署摘要

1. 在 Cloudflare 控制台进入 **Workers & Pages → Create → Pages → Connect to Git**，
   选择仓库 `wqxyuhuai/Battery-passport`。
2. 构建命令填 `npm run build`，输出目录填 `dist`，生产分支填 `main`。
3. 首次部署完成后，在项目的 **Custom domains** 中添加 `passport.carlwang.cn`。
4. 如果域名已经在同一个 Cloudflare 账号下托管，Cloudflare 会自动创建
   `passport` 的 CNAME 记录，无需手动改 DNS。

## Notes

- `dist/` and `node_modules/` are ignored by Git; Cloudflare Pages builds from source.
- The self-hosted variable font is large (~690 KB). It is intentionally kept because
  removing it changes German and CJK text wrapping. Subset it with a glyph-coverage
  check before optimising for transfer size.
- See the known data issues at the end of [docs/DATA_INTEGRATION.md](docs/DATA_INTEGRATION.md)
  before publishing production values.

## License

All rights reserved unless stated otherwise.
