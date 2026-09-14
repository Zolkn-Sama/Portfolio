import { useCallback, useEffect, useRef, useState } from 'react'
import { CommandBar } from './components/CommandBar'
import { PANEL_ID, Panel, type PanelTarget } from './components/Panel'
import { Backdrop } from './components/Backdrop'
import { TronTrails } from './components/TronTrails'
import { Toolbar } from './components/Toolbar'
import { commands, resolveCommand } from './data/commands'
import { contact, identity } from './data/profile'
import { useLang } from './i18n/LangContext'
import { LogRail, SystemRail, type LogEntry } from './components/rails'
import { Intrusion } from './games/Intrusion'
import { Invaders } from './games/Invaders'
import type { GameId } from './games/types'
import { pushRoute, readGame, readSlug, sectionHref, slugFor } from './routing'
import photo160 from './assets/photo-160.webp'
import photo320 from './assets/photo-320.webp'
import photo480 from './assets/photo-480.webp'

const BREACH_MS = 950
const DECRYPT_MS = 900
/** Durée de l'effacement des traces, calée sur l'animation `panel-out`. */
const CLOSE_MS = 620

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Hero() {
  const { L, t } = useLang()
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      <div className="scanlines w-40 overflow-hidden rounded-box border border-primary/40 shadow-lg">
        <img
          src={photo320}
          srcSet={`${photo160} 160w, ${photo320} 320w, ${photo480} 480w`}
          sizes="160px"
          alt={`${identity.firstName} ${identity.lastName}`}
          width={320}
          height={302}
          decoding="async"
          className="block w-full"
        />
      </div>

      <p className="flex items-center gap-2 text-[0.7rem] tracking-[0.3em] text-primary uppercase">
        <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
        {t.status}
      </p>

      <h1 className="text-4xl leading-none font-black tracking-tight sm:text-6xl">
        {identity.firstName} <span className="text-primary">{identity.lastName}</span>
      </h1>

      <p className="max-w-2xl text-sm text-base-content/75 sm:text-base">
        {L(identity.headline)}
      </p>

      <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-base-content/85 sm:text-base">
        {L(identity.intro).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs sm:text-sm">
        <li>
          <a href={`mailto:${contact.email}`} className="link link-hover text-primary">
            {contact.email}
          </a>
        </li>
        <li aria-hidden="true" className="text-base-content/30">
          ·
        </li>
        <li>
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="link link-hover text-primary"
          >
            {contact.githubLabel}
          </a>
        </li>
        <li aria-hidden="true" className="text-base-content/30">
          ·
        </li>
        <li>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            className="link link-hover text-primary"
          >
            {contact.linkedinLabel}
          </a>
        </li>
      </ul>
    </header>
  )
}

/**
 * Rappel visuel des sections disponibles, pour les visiteurs qui ne
 * comprennent pas qu’il faut saisir une commande dans la barre du haut.
 */
function QuickAccess({ onRun }: { onRun: (query: string) => void }) {
  const { lang, t } = useLang()
  return (
    <div className="pt-2">
      <p className="mb-2 text-center text-[0.65rem] tracking-[0.15em] text-base-content/45 uppercase">
        {t.quickAccessTitle}
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {commands.map((cmd) => (
          <li key={cmd.id}>
            <a
              href={sectionHref(cmd.id)}
              onClick={(e) => {
                e.preventDefault()
                onRun(cmd.id)
              }}
              className="badge badge-outline gap-1.5 border-primary/40 px-3 py-3 text-primary transition-colors hover:bg-primary/10"
            >
              <span aria-hidden="true">{cmd.glyph}</span>
              {cmd.label[lang]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Section demandée par l’URL au chargement — révélée sans animation d’intrusion. */
function targetFromUrl(): PanelTarget | null {
  const slug = readSlug()
  if (!slug || slug.startsWith('play/')) return null
  return { command: resolveCommand(slug), query: slug }
}

export default function App() {
  const { t } = useLang()
  const [pending, setPending] = useState<PanelTarget | null>(null)
  const [shown, setShown] = useState<PanelTarget | null>(targetFromUrl)
  const [decrypting, setDecrypting] = useState(() => shown !== null)
  const [closing, setClosing] = useState(false)
  const [game, setGame] = useState<GameId | null>(readGame)
  const [log, setLog] = useState<LogEntry[]>(() =>
    shown ? [{ id: 0, section: shown.command?.id ?? null, query: shown.query, at: Date.now() }] : [],
  )
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  // Fin du déchiffrement du lien profond initial, puis nettoyage au démontage.
  useEffect(() => {
    timers.current.push(window.setTimeout(() => setDecrypting(false), DECRYPT_MS))
    return clearTimers
  }, [clearTimers])

  /**
   * Lance l’animation d’intrusion puis révèle la section demandée.
   * `push` inscrit la section dans l’historique ; on le désactive quand la
   * navigation vient déjà de l’URL (retour arrière, lien collé).
   */
  const run = useCallback(
    (query: string, opts?: { push?: boolean; scroll?: boolean }) => {
      const next: PanelTarget = { command: resolveCommand(query), query }
      clearTimers()
      setClosing(false)
      setPending(next)
      setLog((entries) =>
        [
          { id: Date.now(), section: next.command?.id ?? null, query, at: Date.now() },
          ...entries.filter((e) => e.query !== query),
        ].slice(0, 8),
      )
      if (opts?.push !== false) pushRoute(slugFor(query))

      timers.current.push(
        window.setTimeout(() => {
          setPending(null)
          setShown(next)
          setDecrypting(true)
          if (opts?.scroll !== false) {
            document
              .getElementById(PANEL_ID)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, BREACH_MS),
        window.setTimeout(() => setDecrypting(false), BREACH_MS + DECRYPT_MS),
      )
    },
    [clearTimers],
  )

  /** Retour à la page : la section affichée avant le jeu est reprise telle quelle. */
  const closeGame = useCallback(() => {
    setGame(null)
    pushRoute(shown ? slugFor(shown.query) : null)
  }, [shown])

  /** Efface l'état du panneau et l'URL, sans animation. */
  const clearPanel = useCallback(() => {
    setPending(null)
    setShown(null)
    setDecrypting(false)
    setClosing(false)
    pushRoute(null)
  }, [])

  /** Joue l'effacement des traces avant de retirer le panneau. */
  const close = useCallback(() => {
    clearTimers()
    if (!shown || reducedMotion()) {
      clearPanel()
      return
    }
    setPending(null)
    setDecrypting(false)
    setClosing(true)
    timers.current.push(window.setTimeout(clearPanel, CLOSE_MS))
  }, [clearTimers, clearPanel, shown])

  // L’URL fait foi : retour arrière, lien collé ou fragment modifié à la main.
  useEffect(() => {
    const sync = () => {
      const nextGame = readGame()
      setGame(nextGame)
      if (nextGame) return

      const slug = readSlug()
      const current = pending ?? shown
      const currentSlug = current ? slugFor(current.query) : null
      if (slug === currentSlug) return

      if (slug === null) {
        clearTimers()
        clearPanel()
        return
      }
      run(slug, { push: false, scroll: false })
    }

    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [pending, shown, run, clearTimers, clearPanel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (game) closeGame()
      else close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, closeGame, game])

  const busy = pending !== null
  const activeId = shown?.command?.id

  return (
    <div className="min-h-dvh">
      <TronTrails paused={game !== null} />
      <Backdrop />
      <div className="relative z-10 mx-auto grid max-w-[100rem] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-10 xl:grid-cols-[15rem_minmax(0,52rem)_17rem] xl:justify-center">
        <SystemRail route={activeId ?? 'none'} onRun={run} />

        <main className="order-1 mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 xl:order-none xl:max-w-none">
          {/* Premier écran : la barre de saisie se cale en bas, au niveau
              où les rails latéraux s’arrêtent eux aussi. */}
          <section className="flex min-h-[calc(100dvh-3rem)] flex-col gap-8 sm:min-h-[calc(100dvh-5rem)]">
            <div className="flex justify-end">
              <Toolbar />
            </div>

            <div className="flex grow flex-col justify-center">
              <Hero />
            </div>

            <CommandBar onRun={run} busy={busy} />
          </section>

          <Panel
            pending={pending}
            shown={shown}
            decrypting={decrypting}
            closing={closing}
            onRun={run}
            onClose={close}
          />

          <QuickAccess onRun={run} />

          <footer className="mt-4 border-t border-base-300 pt-4 text-center text-[0.7rem] text-base-content/45">
            {t.footerNote}
          </footer>
        </main>

        <LogRail log={log} onRun={run} />
      </div>

      {game === 'invaders' && <Invaders onClose={closeGame} />}
      {game === 'intrusion' && <Intrusion onClose={closeGame} />}
    </div>
  )
}
