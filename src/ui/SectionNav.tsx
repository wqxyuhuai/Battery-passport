import type { KeyboardEvent, MutableRefObject, RefObject } from 'react'
import type { UiCopy } from '../data/copy'
import { TAB_KEYS } from '../data/schema'
import type { Panel } from '../data/types'
import { TAB_ICONS } from './icons'

type Indicator = { x: number; y: number; width: number; height: number }

export function SectionNav({
  ui,
  panels,
  active,
  indicator,
  ready,
  listRef,
  tabRefs,
  onSelect,
  onKeyDown,
}: {
  ui: UiCopy
  panels: Panel[]
  active: (typeof TAB_KEYS)[number]
  indicator: Indicator
  ready: boolean
  listRef: RefObject<HTMLDivElement | null>
  tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>
  onSelect: (tab: (typeof TAB_KEYS)[number]) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
}) {
  const indicatorClass = 'section-nav-indicator' + (ready ? ' is-ready' : '')
  const indicatorStyle = {
    width: indicator.width,
    height: indicator.height,
    transform: 'translate3d(' + indicator.x + 'px, ' + indicator.y + 'px, 0)',
  }

  return (
    <nav className="section-nav" aria-label={ui.summary}>
      <div className="section-nav-label">{ui.summary}</div>
      <div className="section-nav-list" ref={listRef} role="tablist" aria-orientation="vertical">
        <div className={indicatorClass} style={indicatorStyle} aria-hidden="true" />
        {TAB_KEYS.map((key, index) => {
          const Icon = TAB_ICONS[key]
          const panel = panels[index]
          const selected = active === key
          return (
            <button
              className="nav-item"
              type="button"
              role="tab"
              id={'passport-tab-' + key}
              aria-selected={selected}
              aria-controls="passport-panel"
              tabIndex={selected ? 0 : -1}
              key={key}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              onClick={() => onSelect(key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <Icon size={21} weight="fill" className="nav-item-icon" />
              <span className="nav-item-label">{panel.title}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
