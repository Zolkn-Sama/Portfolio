import { useEffect, useState } from 'react'
import { commands, type SectionId } from '../data/commands'
import { contact, identity } from '../data/profile'
import { useGithubSnapshot } from '../hooks/useGithub'
import { useLang } from '../i18n/LangContext'
import { InvadersTeaser, IntrusionTeaser } from '../games/teasers'
import { sectionHref } from '../routing'
import { useTheme } from './ThemeContext'
import { PALETTES } from './tron'
import { useTronState } from './tronStore'

/** Horloge partagée par les rails — un seul intervalle pour tout le monde. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

function RailTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-primary uppercase">
      <span aria-hidden="true">▚</span>
      {children}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2">
      <span className="shrink-0 text-base-content/45">{label}</span>
      <span className="truncate text-base-content/80">{value}</span>
    </li>
  )
}

/**
 * Tableau des duels des motos Tron, sous la vignette du jeu de cyberdéfense.
 * Il n'apparaît qu'avec l'animation, et n'affiche que les couleurs du thème
 * courant — les scores des deux thèmes sont tenus séparément.
 */
function DuelBoard() {
  const { t } = useLang()
  const { isDark } = useTheme()
  const { active, duels } = useTronState()
  const theme = isDark ? 'dark' : 'light'
  const palettes = PALETTES[theme]

  return (
    <div
      aria-hidden="true"
      className={`shrink-0 rounded-box border border-base-300 bg-base-200/40 px-2.5 py-2 text-[0.65rem] transition-opacity duration-1000 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <RailTitle>{t.tronBoard}</RailTitle>
      <ul className="space-y-1">
        {duels[theme].map((duel, i) => (
          <li key={i} className="flex items-center gap-2 tabular-nums">
            <span
              className="size-2 shrink-0 rounded-[1px]"
              style={{ backgroundColor: `rgb(${palettes[i].rgb})` }}
            />
            <span className="w-6 shrink-0 text-right font-bold">{duel.kills}</span>
            <span className="shrink-0 text-base-content/40">{t.tronKills}</span>
            <span className="ml-auto shrink-0 text-base-content/35">
              {duel.self} {t.tronSelf}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Rail gauche : état de la session et compteurs GitHub en direct. */
export function SystemRail({
  route,
  onRun,
}: {
  route: SectionId | 'none'
  onRun: (query: string) => void
}) {
  const { lang, t } = useLang()
  const { isDark } = useTheme()
  const now = useNow()
  // Lecture seule : le rail n'appelle jamais l'API de lui-même.
  const github = useGithubSnapshot()
  const [start] = useState(() => Date.now())

  const uptime = Math.floor((now - start) / 1000)
  const clock = new Date(now).toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <aside className="sticky top-10 hidden max-h-[calc(100dvh-5rem)] flex-col gap-2 overflow-y-auto xl:flex">
      <div className="shrink-0 rounded-box border border-base-300 bg-base-200/40 p-3 text-[0.7rem]">
        <RailTitle>{t.railSystem}</RailTitle>
        <ul className="space-y-1">
          <Row label="host" value="landrecy.dev" />
          <Row label={t.railRoute} value={route === 'none' ? t.railNone : `#/${route}`} />
          <Row
            label={t.railUptime}
            value={`${String(Math.floor(uptime / 60)).padStart(2, '0')}:${String(uptime % 60).padStart(2, '0')}`}
          />
          <Row label={t.railLocalTime} value={clock} />
          <Row label={t.theme.toLowerCase()} value={isDark ? 'dark' : 'light'} />
          <Row label="lang" value={lang} />
        </ul>
      </div>

      <div className="shrink-0 rounded-box border border-base-300 bg-base-200/40 p-3 text-[0.7rem]">
        <RailTitle>github</RailTitle>
        {github.status === 'ready' ? (
          <ul className="space-y-1">
            <Row label={t.ghRepos} value={String(github.data.profile.publicRepos)} />
            <Row label={t.ghFollowers} value={String(github.data.profile.followers)} />
          </ul>
        ) : github.status === 'loading' ? (
          <p className="text-base-content/40">
            ···<span className="caret ml-1 text-primary">▍</span>
          </p>
        ) : (
          <a
            href={sectionHref('github')}
            onClick={(e) => {
              e.preventDefault()
              onRun('github')
            }}
            className="link link-hover text-primary"
          >
            {github.status === 'error' ? t.ghError : t.railGhIdle}
          </a>
        )}
        <a
          href={contact.github}
          target="_blank"
          rel="noreferrer"
          className="link link-hover mt-2 block truncate text-base-content/60"
        >
          @{contact.githubUser} ↗
        </a>
      </div>

      <InvadersTeaser />
    </aside>
  )
}

export type LogEntry = { id: number; section: SectionId | null; query: string; at: number }

/** Rail droit : journal des requêtes de la session, rejouables d’un clic. */
export function LogRail({
  log,
  onRun,
}: {
  log: LogEntry[]
  onRun: (query: string) => void
}) {
  const { lang, L, t } = useLang()

  return (
    <aside className="sticky top-10 hidden max-h-[calc(100dvh-5rem)] flex-col gap-2 overflow-y-auto xl:flex">
      <div className="flex max-h-56 shrink-0 flex-col overflow-hidden rounded-box border border-base-300 bg-base-200/40 p-3 text-[0.7rem]">
        <RailTitle>{t.railLog}</RailTitle>
        {log.length === 0 ? (
          <p className="text-base-content/40">{t.railLogEmpty}</p>
        ) : (
          <ol className="min-h-0 grow space-y-1 overflow-y-auto">
            {log.map((entry) => {
              const command = commands.find((c) => c.id === entry.section)
              return (
                <li key={entry.id} className="flex items-baseline gap-2">
                  <span className="shrink-0 text-base-content/35">
                    {new Date(entry.at).toLocaleTimeString(lang, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {command ? (
                    <a
                      href={sectionHref(command.id)}
                      onClick={(e) => {
                        e.preventDefault()
                        onRun(command.id)
                      }}
                      className="link link-hover truncate text-primary"
                    >
                      {command.label[lang]}
                    </a>
                  ) : (
                    <span className="truncate text-error/70">{entry.query}</span>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="shrink-0 rounded-box border border-base-300 bg-base-200/40 p-3 text-[0.7rem]">
        <RailTitle>{t.railAvailability}</RailTitle>
        <p className="leading-relaxed text-base-content/70">{L(identity.availability)}</p>
      </div>

      <IntrusionTeaser />

      <DuelBoard />
    </aside>
  )
}
