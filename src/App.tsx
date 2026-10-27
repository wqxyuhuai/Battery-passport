import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DownloadSimple, IconContext, MagnifyingGlass, Pulse, X } from '@phosphor-icons/react'
import type { KeyboardEvent } from 'react'
import './print.css'
import { UI } from './data/copy'
import { formatMetricNumber, splitMetric } from './data/format'
import { IDENTITY_FIELDS, METRICS, METRIC_KEYS, TAB_KEYS, TELEMETRY_PENDING_TABS } from './data/schema'
import type { TabKey } from './data/schema'
import { LANGS } from './data/types'
import type { Lang } from './data/types'
import { BrandMark } from './ui/BrandMark'
import { Hero } from './ui/Hero'
import { ICON_DEFAULTS } from './ui/icons'
import { LanguageMenu } from './ui/LanguageMenu'
import { PrintDocument } from './ui/PrintDocument'
import { SectionBlock } from './ui/SectionBlock'
import { SectionNav } from './ui/SectionNav'

import { catalogue } from './data/source'

const LANG_STORAGE_KEY = 'wattsonic-passport-lang'

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
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
  const locale = catalogue[lang]
  const productName = locale.productName
  const panels = locale.panels
  const activePanel = locale.passport.panel(tab)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'de' ? 'de' : 'en'
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
    document.title = ui.brand + ' · ' + ui.product + ' · ' + productName
  }, [lang, productName, ui.brand, ui.product])

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

    const onPointerDown = (event: PointerEvent) => {
      if (!langWrapRef.current?.contains(event.target as Node)) closeLang()
    }
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      closeLang()
      langTriggerRef.current?.focus()
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
      dppId: locale.passport.field(IDENTITY_FIELDS.dppId)?.value ?? '',
      serial: locale.passport.field(IDENTITY_FIELDS.serial)?.value ?? '',
      model: locale.passport.field(IDENTITY_FIELDS.model)?.value ?? '',
      updated: locale.passport.field(IDENTITY_FIELDS.updated)?.value ?? '',
      status: locale.passport.field(IDENTITY_FIELDS.status)?.value ?? '',
    }),
    [locale],
  )

  const metrics = useMemo(
    () =>
      METRIC_KEYS.map((key) => {
        const field = locale.passport.field(METRICS[key])
        const parsed = splitMetric(field?.value ?? '')
        return {
          key,
          label: ui.metricSubtitles[key],
          value: formatMetricNumber(parsed.number, lang),
          unit: parsed.unit,
        }
      }),
    [locale, lang, ui],
  )

  const query = search.trim().toLowerCase()
  const filteredSections = useMemo(() => {
    if (!query) return activePanel.sections
    return activePanel.sections
      .map((section) => {
        const sectionHit = section.title.toLowerCase().includes(query)
        return {
          ...section,
          fields: sectionHit
            ? section.fields
            : section.fields.filter((field) =>
                (field.label + ' ' + field.value + ' ' + field.id).toLowerCase().includes(query),
              ),
        }
      })
      .filter((section) => section.fields.length > 0)
  }, [activePanel, query])

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

  const telemetryPending = TELEMETRY_PENDING_TABS.includes(tab)

  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <a className="skip-link" href="#passport-panel">
        {ui.skipToContent}
      </a>

      <div className="app">
        <header className={'topbar' + (isScrolled ? ' is-scrolled' : '')}>
          <a className="topbar-brand" href="https://www.wattsonic.com" target="_blank" rel="noreferrer noopener">
            <BrandMark size={36} />
            <span className="topbar-brand-copy">
              <span className="topbar-brand-name">{ui.brand}</span>
              <span className="topbar-brand-sub">{ui.product}</span>
            </span>
          </a>

          <div className="topbar-spacer" />

          <div className="topbar-actions">
            <LanguageMenu
              lang={lang}
              open={langOpen}
              mounted={langMounted}
              label={ui.selectLanguage}
              menuLabel={ui.displayLanguage}
              wrapRef={langWrapRef}
              triggerRef={langTriggerRef}
              optionRefs={langOptionRefs}
              onToggle={() => (langOpen ? closeLang() : openLang())}
              onOpen={openLang}
              onClose={closeLang}
              onChoose={chooseLang}
              onMenuKeyDown={onLangMenuKeyDown}
            />

            <button className="button button--primary" type="button" onClick={handlePrint}>
              <DownloadSimple size={18} weight="fill" />
              <span>{ui.downloadPdf}</span>
            </button>
          </div>
        </header>

        <main className="main">
          <Hero ui={ui} productName={productName} identity={identity} metrics={metrics} />

          <div className="workspace">
            <SectionNav
              ui={ui}
              panels={panels}
              active={tab}
              indicator={navIndicator}
              ready={navIndicatorReady}
              listRef={navListRef}
              tabRefs={tabRefs}
              onSelect={selectTab}
              onKeyDown={onTabKeyDown}
            />

            <section
              className="panel"
              id="passport-panel"
              ref={panelRef}
              role="tabpanel"
              aria-labelledby={'passport-tab-' + tab}
              tabIndex={-1}
            >
              <div>
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
                      <button className="search-clear" type="button" aria-label={ui.clear} onClick={() => setSearch('')}>
                        <X size={17} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="panel-body">
                  {telemetryPending && (
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
                          key={tab + '-' + section.title + '-' + index}
                          section={section}
                          awaitingLabel={ui.awaitingData}
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

      <PrintDocument
        lang={lang}
        productName={productName}
        panels={panels}
        identity={identity}
        metrics={metrics}
      />
    </IconContext.Provider>
  )
}
