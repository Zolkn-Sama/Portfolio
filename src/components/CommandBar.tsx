import { useEffect, useMemo, useRef, useState } from 'react'
import { suggest, type Command } from '../data/commands'
import { useLang } from '../i18n/LangContext'
import { sectionHref } from '../routing'

/** `/projets` comme `projets` : la barre oblique n’est qu’un déclencheur. */
const stripSlash = (value: string) => value.replace(/^\/+/, '')

export function CommandBar({
  onRun,
  busy,
}: {
  onRun: (query: string) => void
  busy: boolean
}) {
  const { lang, t } = useLang()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const term = stripSlash(query)
  const matches = useMemo<Command[]>(() => suggest(term, lang), [term, lang])
  // Le curseur est borné au rendu : la liste rétrécit au fil de la saisie.
  const sel = matches.length > 0 ? Math.min(cursor, matches.length - 1) : 0
  /**
   * La palette ne s'ouvre que sur « / ». Taper un mot-clé directement reste
   * possible — on valide alors avec Entrée, sans liste qui s'interpose.
   */
  const listOpen = open && query.startsWith('/') && matches.length > 0

  // « / » depuis n’importe où ouvre la liste des sections.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      e.preventDefault()
      setQuery('/')
      setCursor(0)
      setOpen(true)
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fermer la liste au clic à l’extérieur.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const run = (value: string) => {
    const trimmed = stripSlash(value).trim()
    if (!trimmed) return
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    onRun(trimmed)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!listOpen) return
      e.preventDefault()
      setCursor(
        e.key === 'ArrowDown'
          ? (sel + 1) % matches.length
          : (sel - 1 + matches.length) % matches.length,
      )
      return
    }
    if (e.key === 'Tab' && listOpen) {
      e.preventDefault()
      setQuery(`/${matches[sel].label[lang]}`)
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      run(listOpen && matches[sel] ? matches[sel].id : query)
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(query)
        }}
        role="search"
        className="flex items-center gap-2 rounded-box border border-base-300 bg-base-200/80 px-3 py-2 shadow-sm backdrop-blur transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
      >
        <span
          aria-hidden="true"
          className="hidden shrink-0 select-none text-sm text-primary sm:inline"
        >
          {t.prompt}
        </span>
        <span aria-hidden="true" className="shrink-0 select-none text-primary sm:hidden">
          $
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setCursor(0)
            setOpen(true)
          }}
          onFocus={() => {
            if (query.startsWith('/')) setOpen(true)
          }}
          onKeyDown={onKeyDown}
          type="text"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          aria-label={t.searchAria}
          aria-expanded={listOpen}
          aria-controls="command-suggestions"
          role="combobox"
          placeholder={t.searchPlaceholder}
          className="min-w-0 grow bg-transparent text-sm outline-hidden placeholder:text-base-content/40 sm:text-base"
        />

        <kbd
          className="kbd kbd-sm hidden shrink-0 cursor-pointer sm:inline-flex"
          onClick={() => {
            setQuery('/')
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
          /
        </kbd>

        <button
          type="submit"
          disabled={busy || stripSlash(query).trim().length === 0}
          className="btn btn-primary btn-sm shrink-0 font-mono"
        >
          {busy ? <span className="loading loading-xs loading-bars" /> : '⏎'}
          <span className="hidden sm:inline">{t.run}</span>
        </button>
      </form>

      {listOpen && (
        <ul
          id="command-suggestions"
          role="listbox"
          aria-label={t.suggestions}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-box border border-base-300 bg-base-200/97 p-1 shadow-xl backdrop-blur"
        >
          {matches.map((cmd, i) => (
            <li key={cmd.id} role="option" aria-selected={i === sel}>
              <a
                href={sectionHref(cmd.id)}
                onMouseEnter={() => setCursor(i)}
                onClick={(e) => {
                  e.preventDefault()
                  run(cmd.id)
                }}
                className={`flex items-baseline gap-3 rounded-field px-3 py-2 text-sm transition-colors ${
                  i === sel ? 'bg-primary/15 text-primary' : 'hover:bg-base-300'
                }`}
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-center opacity-70">
                  {cmd.glyph}
                </span>
                <span className="shrink-0 font-semibold">{cmd.label[lang]}</span>
                <span className="truncate text-xs text-base-content/60">
                  {cmd.description[lang]}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-xs text-base-content/35"
                >
                  #/{cmd.id}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
