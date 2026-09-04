import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLang } from '../i18n/LangContext'
import {
  addScore,
  readLeaderboard,
  readPlayerName,
  writePlayerName,
  type Entry,
} from './leaderboard'
import { isSoundEnabled, setSoundEnabled, unlockAudio } from './audio'
import type { GameId } from './types'

/** Résultat remonté par un jeu quand la partie se termine. */
export type GameResult = { score: number; detail: string; won: boolean }

/** Remonté (via `key`) après chaque score enregistré, ce qui relit les deux couches. */
export function Leaderboard({ game }: { game: GameId }) {
  const { t } = useLang()
  const [scores, setScores] = useState<Entry[] | null>(null)

  useEffect(() => {
    let alive = true
    void readLeaderboard(game).then((entries) => {
      if (alive) setScores(entries)
    })
    return () => {
      alive = false
    }
  }, [game])

  return (
    <div className="rounded-box border border-base-300 bg-base-200/50 p-3">
      <h3 className="mb-2 text-[0.65rem] tracking-[0.25em] text-primary uppercase">
        {t.games.leaderboard}
      </h3>
      {scores === null ? (
        <p className="text-xs text-base-content/40">···</p>
      ) : scores.length === 0 ? (
        <p className="text-xs text-base-content/50">{t.games.leaderboardEmpty}</p>
      ) : (
        <ol className="space-y-1 text-xs">
          {scores.map((entry, i) => (
            <li
              key={`${entry.at}-${entry.name}`}
              className={`flex items-baseline gap-2 ${entry.mine ? 'text-accent' : ''}`}
            >
              <span className="w-4 shrink-0 text-right text-base-content/40">{i + 1}</span>
              <span className={`w-8 shrink-0 font-bold ${entry.mine ? 'text-accent' : 'text-primary'}`}>
                {entry.name}
              </span>
              <span className="w-14 shrink-0 text-right tabular-nums">{entry.score}</span>
              <span className="truncate text-base-content/45">{entry.detail}</span>
              {entry.mine && (
                <span className="ml-auto shrink-0 text-[0.6rem] text-accent/70">
                  {t.games.leaderboardMine}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-[0.65rem] leading-snug text-base-content/40">
        {t.games.leaderboardLocal}
      </p>
    </div>
  )
}

/** Saisie des initiales, façon borne d'arcade, quand le score entre au classement. */
export function ScoreEntry({
  game,
  result,
  onSaved,
}: {
  game: GameId
  result: GameResult
  onSaved: () => void
}) {
  const { t } = useLang()
  const [name, setName] = useState(() => readPlayerName() || 'AAA')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  if (result.score <= 0) return null

  const save = () => {
    if (saved) return
    const clean = (name.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'AAA').slice(0, 3)
    writePlayerName(clean)
    addScore(game, { name: clean, score: result.score, at: Date.now(), detail: result.detail })
    setSaved(true)
    onSaved()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="flex items-center justify-center gap-2"
    >
      <label className="text-xs text-base-content/60" htmlFor="score-name">
        {t.games.enterName}
      </label>
      <input
        ref={inputRef}
        id="score-name"
        value={name}
        maxLength={3}
        disabled={saved}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        className="input input-sm input-bordered w-20 text-center font-mono tracking-[0.3em] uppercase"
      />
      <button type="submit" disabled={saved} className="btn btn-primary btn-sm">
        {saved ? '✓' : t.games.save}
      </button>
    </form>
  )
}

function SoundToggle() {
  const { t } = useLang()
  const [on, setOn] = useState(isSoundEnabled)

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on
        setSoundEnabled(next)
        setOn(next)
        if (next) unlockAudio()
      }}
      aria-pressed={on}
      title={t.games.sound}
      className="btn btn-ghost btn-xs font-mono"
    >
      <span aria-hidden="true">{on ? '♪' : '⊘'}</span>
      <span className="sr-only">{t.games.sound}</span>
    </button>
  )
}

/**
 * Cadre commun aux deux jeux : bandeau, règles à gauche, aire de jeu au
 * centre, classement à droite. `boxed` borne la surface de jeu à un format
 * 4/3 au lieu de la laisser occuper toute la hauteur.
 */
export function GameShell({
  title,
  hud,
  onClose,
  onRestart,
  canRestart = false,
  left,
  right,
  children,
  boxed = false,
}: {
  title: string
  hud: ReactNode
  onClose: () => void
  /** Relance une partie sans quitter le jeu. */
  onRestart: () => void
  /** Masqué tant qu'aucune partie n'a commencé : « Commencer » suffit alors. */
  canRestart?: boolean
  left: ReactNode
  right: ReactNode
  children: ReactNode
  boxed?: boolean
}) {
  const { t } = useLang()

  return (
    <div className="grid-bg fixed inset-0 z-50 flex flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-base-300 px-4 py-3">
        <h1 className="text-sm font-bold tracking-[0.25em] text-primary uppercase">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">{hud}</div>
        <div className="ml-auto flex items-center gap-1">
          {canRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="btn btn-ghost btn-xs font-mono"
            >
              <span aria-hidden="true">↻</span> {t.games.restart}
            </button>
          )}
          <SoundToggle />
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs font-mono"
          >
            ✕ {t.games.close}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 grow gap-3 p-3 sm:p-4 lg:grid-cols-[11rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)_12rem]">
        <div className="hidden min-h-0 flex-col gap-2 overflow-y-auto lg:flex">{left}</div>

        <div
          className={
            boxed
              ? 'flex min-h-0 items-center justify-center'
              : 'relative min-h-0 overflow-hidden rounded-box border border-base-300 bg-base-200/30'
          }
        >
          {boxed ? (
            <div className="relative aspect-4/3 max-h-full w-full max-w-4xl overflow-hidden rounded-box border border-base-300 bg-base-200/30">
              {children}
            </div>
          ) : (
            children
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto lg:col-span-2 xl:col-span-1">
          {right}
        </div>
      </div>
    </div>
  )
}
