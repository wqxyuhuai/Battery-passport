import {
  ArrowUpRight,
  BatteryCharging,
  CaretDown,
  Check,
  CheckCircle,
  DownloadSimple,
  FileText,
  Gauge,
  Globe,
  Heartbeat,
  IconContext,
  Leaf,
  Lock,
  MagnifyingGlass,
  Minus,
  Pulse,
  ShieldCheck,
  X,
} from '@phosphor-icons/react'
import type { ComponentType, KeyboardEvent, ReactNode } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './print.css'
import {
  findFieldAcross,
  getPanel,
  getPanels,
  isKeyValueLine,
  LANGS,
  LANG_LABELS,
  METRIC_KEYS,
  METRICS,
  splitKeyValue,
  splitLines,
  splitMetric,
  TAB_KEYS,
  UI,
  type Field,
  type Lang,
  type Panel,
  type Section,
  type TabKey,
} from './data/passport'

type IconProps = { size?: number; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; className?: string }
type IconComponent = ComponentType<IconProps>

const LOCALE: Record<Lang, string> = { zh: 'zh-CN', en: 'en-GB', de: 'de-DE' }
const PRODUCT_NAME = 'Wattsonic Li-LV 5.0'
const ICON_DEFAULTS = { weight: 'fill', size: 20 } as const

const TAB_ICONS: Record<TabKey, IconComponent> = {
  basic: BatteryCharging,
  performance: Gauge,
  materials: Leaf,
  health: Heartbeat,
  compliance: ShieldCheck,
}

const MONO_FIELDS = new Set(['001', '005', '006', '007', '008', '010', '011', '012'])
const WIDE_FIELDS = new Set(['042', '043', '044'])

function formatMetricNumber(raw: string, lang: Lang): string {
  if (!raw) return '—'
  const normalized = raw.replace(',', '.')
  if (!normalized.includes('.')) {
    const value = Number(normalized.replace(/[^\d-]/g, ''))
    if (Number.isFinite(value)) return new Intl.NumberFormat(LOCALE[lang]).format(value)
  }
  return raw
}

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none">
        <rect x="3.4" y="3.8" width="25.2" height="24.4" rx="4.6" fill="currentColor" />
        <rect x="8.4" y="8.2" width="2.2" height="15.6" rx="1.1" fill="var(--primary)" />
        <rect x="13" y="9.6" width="8.6" height="2.4" rx="1.2" fill="var(--primary)" opacity="0.6" />
        <rect x="13" y="14.1" width="6.4" height="2.4" rx="1.2" fill="var(--primary)" opacity="0.6" />
        <rect x="13" y="18.6" width="7.8" height="2.4" rx="1.2" fill="var(--primary)" opacity="0.6" />
      </svg>
    </span>
  )
}

function DocButton({ field }: { field: Field }) {
  return (
    <a
      className="field-link"
      href={field.href ?? '#'}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${field.label} · ${field.value}`}
    >
      <FileText size={20} weight="fill" className="field-link-icon" />
      <span className="field-link-text">{field.value}</span>
      <ArrowUpRight size={18} weight="bold" />
    </a>
  )
}

function PlainLines({ lines }: { lines: string[] }) {
  return (
    <span className="field-lines">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>{line}</span>
      ))}
    </span>
  )
}

function InlineValue({ value }: { value: string }) {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return (
      <a className="inline-link" href={value} target="_blank" rel="noreferrer noopener">
        {value}
      </a>
    )
  }
  if (value.includes('@') && !value.includes(' ')) {
    return (
      <a className="inline-link" href={`mailto:${value}`}>
        {value}
      </a>
    )
  }
  return <>{value}</>
}

function StructuredLines({ lines }: { lines: string[] }) {
  return (
    <span className="field-lines field-lines--kv">
      {lines.map((line, index) => {
        if (!isKeyValueLine(line)) return <span key={`${line}-${index}`}>{line}</span>
        const [key, value] = splitKeyValue(line)
        return (
          <span className="field-kv" key={`${line}-${index}`}>
            <span className="field-kv-key">{key}</span>
            <span className="field-kv-value">
              <InlineValue value={value} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

type EntityRecord = {
  title: string
  name: string
  address: string
  meta: Array<{ key: string; value: string }>
}

function parseEntity(field: Field): EntityRecord {
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

function EntityBlock({ field }: { field: Field }) {
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

function FieldCard({ field, ui }: { field: Field; ui: (typeof UI)[Lang] }) {
  const lines = splitLines(field.value)
  const wide = WIDE_FIELDS.has(field.id) || lines.length > 2
  const isMono = MONO_FIELDS.has(field.id)
  const isChips = field.id === '042' || field.id === '009'
  const isAwaiting = field.value.trim() === '--' || field.value.trim() === '—'

  let valueNode: ReactNode
  if (field.locked) {
    valueNode = (
      <span className="field-locked">
        <Lock size={18} weight="fill" />
        {field.value}
      </span>
    )
  } else if (field.href) {
    valueNode = <DocButton field={field} />
  } else if (isAwaiting) {
    valueNode = (
      <span className="field-awaiting">
        <Minus size={17} weight="bold" />
        {ui.awaitingData}
      </span>
    )
  } else if (field.id === '042' || field.id === '009') {
    valueNode = (
      <span className="chips">
        {lines.map((line, index) => (
          <span className="chip" key={`${line}-${index}`}>
            {line}
          </span>
        ))}
      </span>
    )
  } else if (lines.length > 1 && lines.some(isKeyValueLine)) {
    valueNode = <StructuredLines lines={lines} />
  } else if (lines.length > 1) {
    valueNode = <PlainLines lines={lines} />
  } else {
    valueNode = field.value
  }

  return (
    <div className={`field${wide ? ' field--wide' : ''}${isChips ? ' field--chips' : ''}`}>
      <div className="field-label">{field.label}</div>
      <div
        className={[
          'field-value',
          isMono ? 'field-value--mono' : '',
          field.id === '002' ? 'field-value--strong' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {valueNode}
      </div>
    </div>
  )
}

const SPLIT_FIELDS = new Set(['043', '044'])

function SectionBlock({ section, ui }: { section: Section; ui: (typeof UI)[Lang] }) {
  const entities = section.fields.filter((field) => field.id === '015' || field.id === '014')
  const fields = section.fields.filter((field) => field.id !== '015' && field.id !== '014')
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
            className={`field-grid${entities.length > 0 ? ' field-grid--after-entities' : ''}${
              gridFields.length === 1 ? ' field-grid--single' : ''
            }`}
          >
            {gridFields.map((field) => (
              <FieldCard key={field.id} field={field} ui={ui} />
            ))}
          </div>
        )}
        {paired && (
          <div className={`field-split${gridFields.length > 0 || entities.length > 0 ? ' field-split--stacked' : ''}`}>
            {splitFields.map((field) => (
              <FieldCard key={field.id} field={field} ui={ui} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PrintValue({ field }: { field: Field }) {
  return (
    <div className="print-field">
      <div className="print-field-label">{field.label}</div>
      <div className="print-field-value">
        {field.value.split('\n').map((line, index) => (
          <span key={`${line}-${index}`}>{line}</span>
        ))}
        {field.href && <a href={field.href}>{field.href}</a>}
      </div>
    </div>
  )
}

function PrintDocument({
  lang,
  panels,
  identity,
  metrics,
}: {
  lang: Lang
  panels: Panel[]
  identity: { dppId: string; serial: string; model: string; updated: string; status: string }
  metrics: Array<{ label: string; value: string; unit: string }>
}) {
  const ui = UI[lang]
  const generated = new Intl.DateTimeFormat(LOCALE[lang], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())

  return (
    <div className="print-document" aria-hidden="true">
      <header className="print-header">
        <div className="print-brand">
          <BrandMark size={28} />
          <div>
            <strong>{ui.brand}</strong>
            <span>{ui.product}</span>
          </div>
        </div>
        <div className="print-stamp">
          <CheckCircle size={16} weight="fill" />
          {ui.confirmed}
        </div>
      </header>

      <div className="print-eyebrow">{ui.eyebrow}</div>
      <h1 className="print-title">{PRODUCT_NAME}</h1>
      <p className="print-subtitle">{ui.printTitle}</p>

      <dl className="print-identity">
        <div>
          <dt>{ui.dppId}</dt>
          <dd>{identity.dppId}</dd>
        </div>
        <div>
          <dt>{ui.serial}</dt>
          <dd>{identity.serial}</dd>
        </div>
        <div>
          <dt>{ui.model}</dt>
          <dd>{identity.model}</dd>
        </div>
        <div>
          <dt>{ui.updated}</dt>
          <dd>{identity.updated}</dd>
        </div>
      </dl>

      <div className="print-metrics">
        {metrics.map((metric) => (
          <div className="print-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.value} <small>{metric.unit}</small>
            </strong>
          </div>
        ))}
      </div>

      {panels.map((panel) => (
        <section className="print-panel" key={panel.title}>
          <h2>{panel.title}</h2>
          {panel.sections.map((section) => (
            <div className="print-section" key={section.title}>
              <h3>{section.title}</h3>
              <div className="print-fields">
                {section.fields.map((field) => (
                  <PrintValue field={field} key={field.id} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <footer className="print-footer">
        <span>{ui.printFooter}</span>
        <span>
          {ui.generated}: {generated}
        </span>
      </footer>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = window.localStorage.getItem('wattsonic-passport-lang')
    return LANGS.includes(saved as Lang) ? (saved as Lang) : 'zh'
  })
  const [tab, setTab] = useState<TabKey>('basic')
  const [search, setSearch] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [langMounted, setLangMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [navIndicatorReady, setNavIndicatorReady] = useState(false)
  const [navIndicator, setNavIndicator] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const langWrapRef = useRef<HTMLDivElement>(null)
  const langTriggerRef = useRef<HTMLButtonElement>(null)
  const langOptionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const langCloseTimer = useRef(0)
  const navListRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const ui = UI[lang]
  const panels = useMemo(() => getPanels(lang), [lang])
  const activePanel = useMemo(() => getPanel(lang, tab), [lang, tab])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'de' ? 'de' : 'en'
    window.localStorage.setItem('wattsonic-passport-lang', lang)
    document.title = `${ui.brand} · ${ui.product} · ${PRODUCT_NAME}`
  }, [lang, ui.brand, ui.product])

  useEffect(() => {
    return () => window.clearTimeout(langCloseTimer.current)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const next = window.scrollY > 8
      setIsScrolled((current) => (current === next ? current : next))
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useLayoutEffect(() => {
    const list = navListRef.current
    const active = tabRefs.current[TAB_KEYS.indexOf(tab)]
    if (!list || !active) return
    let disposed = false
    let frame = 0

    const measure = () => {
      frame = 0
      if (disposed) return
      setNavIndicator({
        x: active.offsetLeft,
        y: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      })
    }
    const schedule = () => {
      if (disposed || frame) return
      frame = window.requestAnimationFrame(measure)
    }

    measure()
    const observer = new ResizeObserver(schedule)
    observer.observe(list)
    observer.observe(active)
    window.addEventListener('resize', schedule)
    void document.fonts?.ready.then(schedule)
    const readyFrame = window.requestAnimationFrame(() => {
      if (!disposed) setNavIndicatorReady(true)
    })

    return () => {
      disposed = true
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(readyFrame)
    }
  }, [tab, lang])

  useEffect(() => {
    if (!langOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!langWrapRef.current?.contains(event.target as Node)) closeLang()
    }
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        closeLang()
        langTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [langOpen])

  useEffect(() => {
    if (!langOpen) return
    const index = LANGS.indexOf(lang)
    const timer = window.setTimeout(() => langOptionRefs.current[index]?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [langOpen, lang])

  const identity = useMemo(
    () => ({
      dppId: findFieldAcross(lang, '005')?.value ?? 'DPP-2027-A001',
      serial: findFieldAcross(lang, '011')?.value ?? 'A001',
      model: findFieldAcross(lang, '010')?.value ?? 'WTS-LiLV-5.12',
      updated: findFieldAcross(lang, '004')?.value ?? '',
      status: findFieldAcross(lang, '002')?.value ?? '',
    }),
    [lang],
  )

  const metrics = useMemo(
    () =>
      METRIC_KEYS.map((key) => {
        const field = findFieldAcross(lang, METRICS[key])
        const parsed = splitMetric(field?.value ?? '')
        return {
          key,
          label: ui.metricSubtitles[key],
          value: formatMetricNumber(parsed.number, lang),
          unit: parsed.unit,
        }
      }),
    [lang, ui],
  )

  const query = search.trim().toLowerCase()
  const filteredSections = useMemo(
    () =>
      activePanel.sections
        .map((section) => {
          if (!query) return section
          const sectionHit = section.title.toLowerCase().includes(query)
          return {
            ...section,
            fields: sectionHit
              ? section.fields
              : section.fields.filter((field) =>
                  `${field.label} ${field.value} ${field.id}`.toLowerCase().includes(query),
                ),
          }
        })
        .filter((section) => section.fields.length > 0),
    [activePanel, query],
  )

  function revealActivePanel() {
    window.requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const top = panel.getBoundingClientRect().top
      const topbar = document.querySelector<HTMLElement>('.topbar')
      const offset = (topbar?.offsetHeight ?? 72) + 20
      if (top >= offset) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({
        top: window.scrollY + top - offset,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    })
  }

  function selectTab(next: TabKey) {
    setTab(next)
    setSearch('')
    revealActivePanel()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % TAB_KEYS.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + TAB_KEYS.length) % TAB_KEYS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TAB_KEYS.length - 1
    else return
    event.preventDefault()
    selectTab(TAB_KEYS[nextIndex])
    window.setTimeout(() => tabRefs.current[nextIndex]?.focus(), 0)
  }

  function openLang() {
    window.clearTimeout(langCloseTimer.current)
    setLangMounted(true)
    setLangOpen(true)
  }

  function closeLang() {
    window.clearTimeout(langCloseTimer.current)
    setLangOpen(false)
    langCloseTimer.current = window.setTimeout(() => setLangMounted(false), 150)
  }

  function chooseLang(next: Lang) {
    setLang(next)
    closeLang()
    langTriggerRef.current?.focus()
  }

  function onLangMenuKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % LANGS.length
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + LANGS.length) % LANGS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = LANGS.length - 1
    else if (event.key === 'Escape') {
      event.preventDefault()
      closeLang()
      langTriggerRef.current?.focus()
      return
    } else if (event.key === 'Tab') {
      closeLang()
      return
    } else return
    event.preventDefault()
    langOptionRefs.current[nextIndex]?.focus()
  }

  function handlePrint() {
    window.setTimeout(() => window.print(), 60)
  }

  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <a className="skip-link" href="#passport-panel">
        {lang === 'zh' ? '跳到护照内容' : lang === 'de' ? 'Zum Batteriepass springen' : 'Skip to passport content'}
      </a>

      <div className="app">
        <header className={`topbar${isScrolled ? ' is-scrolled' : ''}`}>
          <a className="topbar-brand" href="https://www.wattsonic.com" target="_blank" rel="noreferrer noopener">
            <BrandMark size={32} />
            <span className="topbar-brand-copy">
              <span className="topbar-brand-name">{ui.brand}</span>
              <span className="topbar-brand-sub">{ui.product}</span>
            </span>
          </a>

          <div className="topbar-spacer" />

          <div className="topbar-actions">
            <div className="language" ref={langWrapRef}>
              <button
                ref={langTriggerRef}
                className="language-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={lang === 'zh' ? '选择显示语言' : 'Select display language'}
                onClick={() => (langOpen ? closeLang() : openLang())}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault()
                    openLang()
                  }
                }}
              >
                <Globe size={20} weight="fill" />
                <span>{LANG_LABELS[lang]}</span>
                <CaretDown size={14} weight="bold" className="language-caret" />
              </button>
              {langMounted && (
                <div
                  className={`language-menu${langOpen ? ' is-open' : ' is-closing'}`}
                  inert={!langOpen}
                  role="listbox"
                  aria-label={lang === 'zh' ? '显示语言' : 'Display language'}
                >
                  <div className="language-menu-label">
                    {lang === 'zh' ? '显示语言' : lang === 'de' ? 'Sprache' : 'Language'}
                  </div>
                  {LANGS.map((item, index) => (
                    <button
                      className="language-option"
                      type="button"
                      role="option"
                      aria-selected={item === lang}
                      key={item}
                      ref={(node) => {
                        langOptionRefs.current[index] = node
                      }}
                      onClick={() => chooseLang(item)}
                      onKeyDown={(event) => onLangMenuKeyDown(event, index)}
                    >
                      <span>{LANG_LABELS[item]}</span>
                      {item === lang && <Check size={17} weight="bold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="button button--primary" type="button" onClick={handlePrint}>
              <DownloadSimple size={18} weight="fill" />
              <span>{ui.downloadPdf}</span>
            </button>
          </div>
        </header>

        <main className="main">
          <section className="hero" aria-labelledby="passport-title">
            <div className="hero-main">
              <span className="eyebrow">{ui.eyebrow}</span>
              <h1 className="hero-title" id="passport-title">
                {PRODUCT_NAME}
              </h1>
              <p className="hero-description">{ui.heroDescription}</p>

              <dl className="hero-identity">
                <div>
                  <dt>{ui.dppId}</dt>
                  <dd>{identity.dppId}</dd>
                </div>
                <div>
                  <dt>{ui.serial}</dt>
                  <dd>{identity.serial}</dd>
                </div>
                <div>
                  <dt>{ui.updated}</dt>
                  <dd>{identity.updated}</dd>
                </div>
              </dl>
            </div>

            <aside className="hero-specs" aria-label={ui.coreSpecs}>
              <div className="specs-head">
                <h2 className="specs-title">{ui.coreSpecs}</h2>
                <span className="status-pill">
                  <CheckCircle size={18} weight="fill" />
                  {identity.status}
                </span>
              </div>
              <dl className="specs-list">
                {metrics.map((metric) => (
                  <div className="spec" key={metric.key}>
                    <dt>{metric.label}</dt>
                    <dd>
                      <strong>{metric.value}</strong>
                      {metric.unit && <span>{metric.unit}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </section>

          <div className="workspace">
            <nav className="section-nav" aria-label={ui.overview}>
              <div className="section-nav-label">{ui.summary}</div>
              <div className="section-nav-list" ref={navListRef} role="tablist" aria-orientation="vertical">
                <div
                  className={`section-nav-indicator${navIndicatorReady ? ' is-ready' : ''}`}
                  style={{
                    width: navIndicator.width,
                    height: navIndicator.height,
                    transform: `translate3d(${navIndicator.x}px, ${navIndicator.y}px, 0)`,
                  }}
                  aria-hidden="true"
                />
                {TAB_KEYS.map((key, index) => {
                  const TabIcon = TAB_ICONS[key]
                  const panel = panels[index]
                  const selected = tab === key
                  return (
                    <button
                      className="nav-item"
                      type="button"
                      role="tab"
                      id={`passport-tab-${key}`}
                      aria-selected={selected}
                      aria-controls={`passport-tab-panel-${key}`}
                      tabIndex={selected ? 0 : -1}
                      key={key}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      onClick={() => selectTab(key)}
                      onKeyDown={(event) => onTabKeyDown(event, index)}
                    >
                      <TabIcon size={21} weight="fill" className="nav-item-icon" />
                      <span className="nav-item-label">{panel.title}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            <section
              className="panel"
              id="passport-panel"
              ref={panelRef}
              role="tabpanel"
              aria-labelledby={`passport-tab-${tab}`}
              tabIndex={-1}
            >
              <div className="panel-swap" key={tab}>
              <div className="panel-head">
                <h2 className="panel-title">{activePanel.title}</h2>
                <div className="search">
                  <MagnifyingGlass size={19} weight="fill" className="search-icon" />
                  <input
                    className="search-input"
                    type="search"
                    value={search}
                    aria-label={ui.search}
                    placeholder={ui.search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && (
                    <button
                      className="search-clear"
                      type="button"
                      aria-label={ui.clear}
                      onClick={() => setSearch('')}
                    >
                      <X size={17} weight="bold" />
                    </button>
                  )}
                </div>
              </div>

              <div className="panel-body">
                {tab === 'health' && (
                  <div className="notice">
                    <Pulse size={22} weight="fill" className="notice-icon" />
                    <div>
                      <div className="notice-title">{ui.liveTelemetry}</div>
                      <p className="notice-text">{ui.liveTelemetryBody}</p>
                    </div>
                  </div>
                )}

                {filteredSections.length > 0 ? (
                  <div className="section-list">
                    {filteredSections.map((section, index) => (
                      <SectionBlock
                        key={`${tab}-${section.title}-${index}`}
                        section={section}
                        ui={ui}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <MagnifyingGlass size={26} weight="fill" className="empty-icon" />
                    <h4 className="empty-title">{ui.noResults}</h4>
                    <p className="empty-text">{ui.noResultsHint}</p>
                    <button className="button button--secondary" type="button" onClick={() => setSearch('')}>
                      {ui.clear}
                    </button>
                  </div>
                )}
              </div>
              </div>
            </section>
          </div>

          <footer className="footer">
            <span>
              © 2026 {ui.brand} · {ui.product}
            </span>
          </footer>
        </main>
      </div>

      <PrintDocument lang={lang} panels={panels} identity={identity} metrics={metrics} />
    </IconContext.Provider>
  )
}
