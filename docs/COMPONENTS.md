# Components

| File | Responsibility |
| --- | --- |
| src/App.tsx | Page shell, tab/language/search state, focus management, print trigger |
| src/ui/BrandMark.tsx | Brand glyph (SVG). Size prop only |
| src/ui/Hero.tsx | Product title, identity block, headline spec list |
| src/ui/SectionNav.tsx | Tab strip with sliding indicator; ARIA tabs pattern |
| src/ui/SectionBlock.tsx | One section: entity grid, field grid, split field pair |
| src/ui/FieldCard.tsx | One field: locked / link / chips / key-value / plain rendering |
| src/ui/EntityBlock.tsx | Company/organisation block parsed from Key: value lines |
| src/ui/LanguageMenu.tsx | Language listbox with keyboard handling |
| src/ui/PrintDocument.tsx | Print-only full record |
| src/ui/icons.ts | Tab icons and icon defaults |

## Conventions

- Components are pure: props in, markup out. No fetching, no localStorage.
- Anything derived from a field id belongs in `src/data/schema.ts`, not inline.
- New UI strings go into `src/data/copy.ts` for all three languages.
- Values that differ per passport (product name, fields) come from the payload; values
  that are UI chrome (labels, button text) come from `copy.ts`.
- Styling goes in `styles.css`; print-only markup goes in `print.css`.
- Keep one component per file and one concern per component.
- Field presentation is decided by `fieldFormat()`; avoid id checks in JSX.
