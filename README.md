# Wattsonic · Digital Battery Passport

An interactive, trilingual (中文 / English / Deutsch) digital battery passport for the
**Wattsonic Li-LV 5.0** battery. The page presents verified lifecycle, performance,
materials, health and compliance data in a single accessible document-like interface.

Built with React 19, TypeScript and Vite. No backend is required — the app is a fully
static site and can be hosted on any static host.

## Stack

- React 19 + TypeScript
- Vite 6
- Self-hosted SF Pro webfonts (no external font requests)

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the built site
```

Requires Node.js 20 or newer.

## Project structure

```text
index.html              App shell
src/App.tsx             Passport UI (tabs, language switcher, print layout)
src/styles.css          Design system and layout
src/print.css           Print stylesheet
src/data/passport.ts    Typed passport data model and UI copy
src/data/demo-data.json Demo passport record
src/assets/fonts/       Self-hosted SF Pro webfonts
public/favicon.svg      Favicon
```

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

- The repository contains demo data only. Replace `src/data/demo-data.json` and the
  content in `src/data/passport.ts` with production values before publishing real
  passport data.
- `dist/` and `node_modules/` are intentionally ignored by Git; Cloudflare Pages
  builds the site from source.

## License

All rights reserved unless stated otherwise.
