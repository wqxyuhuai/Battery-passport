import { CaretDown, Check, Globe } from '@phosphor-icons/react'
import type { KeyboardEvent, MutableRefObject, RefObject } from 'react'
import { LANG_LABELS, LANGS } from '../data/types'
import type { Lang } from '../data/types'

type LanguageMenuProps = {
  lang: Lang
  open: boolean
  mounted: boolean
  label: string
  menuLabel: string
  wrapRef: RefObject<HTMLDivElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  optionRefs: MutableRefObject<Array<HTMLButtonElement | null>>
  onToggle: () => void
  onOpen: () => void
  onClose: () => void
  onChoose: (lang: Lang) => void
  onMenuKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
}

export function LanguageMenu({
  lang,
  open,
  mounted,
  label,
  menuLabel,
  wrapRef,
  triggerRef,
  optionRefs,
  onToggle,
  onOpen,
  onClose,
  onChoose,
  onMenuKeyDown,
}: LanguageMenuProps) {
  return (
    <div className="language" ref={wrapRef}>
      <button
        ref={triggerRef}
        className="language-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            onOpen()
          } else if (event.key === 'Escape') {
            onClose()
          }
        }}
      >
        <Globe size={20} weight="fill" />
        <span>{LANG_LABELS[lang]}</span>
        <CaretDown size={14} weight="bold" className="language-caret" />
      </button>
      {mounted && (
        <div
          className={`language-menu${open ? ' is-open' : ' is-closing'}`}
          inert={!open}
          role="listbox"
          aria-label={menuLabel}
        >
          <div className="language-menu-label">{menuLabel}</div>
          {LANGS.map((item, index) => (
            <button
              className="language-option"
              type="button"
              role="option"
              aria-selected={item === lang}
              key={item}
              ref={(node) => {
                optionRefs.current[index] = node
              }}
              onClick={() => onChoose(item)}
              onKeyDown={(event) => onMenuKeyDown(event, index)}
            >
              <span>{LANG_LABELS[item]}</span>
              {item === lang && <Check size={17} weight="bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
