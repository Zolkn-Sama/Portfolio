import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { gameHref } from '../routing'
import { attacks } from './attacks'
import { readLocal } from './leaderboard'
import type { GameId } from './types'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Vignette d'un mini-jeu dans un rail. La zone animée a une hauteur fixe :
 * laissée libre de grandir, elle s'étirait jusqu'en bas de l'écran.
 */
function TeaserCard({
  game,
  label,
  children,
}: {
  game: GameId
  label: string
  children: React.ReactNode
}) {
  const { t } = useLang()
  const [best] = useState(() => readLocal(game)[0]?.score ?? 0)

  return (
    <a
      href={gameHref(game)}
      className="group shrink-0 overflow-hidden rounded-box border border-base-300 bg-base-200/20 px-2.5 py-2 transition-colors hover:border-primary hover:bg-primary/5"
    >
      <span className="flex items-baseline justify-between gap-2 text-[0.6rem] tracking-[0.18em] text-primary uppercase">
        <span className="truncate">{label}</span>
        <span
          aria-hidden="true"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {t.games.play} ↗
        </span>
      </span>
      {best > 0 && (
        <span className="block text-[0.6rem] text-base-content/45">
          {t.games.best} <b className="text-accent tabular-nums">{best}</b>
        </span>
      )}
      <span className="relative mt-1.5 block h-20 overflow-hidden">{children}</span>
    </a>
  )
}

/** La nuée reprend le chevron de la vague 1, tel qu'il apparaît dans le jeu. */
const CHEVRON = ['  ▄▄▄  ', ' ▄   ▄ ', '▄     ▄']

export function InvadersTeaser() {
  const { t } = useLang()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduced()) return
    const id = window.setInterval(() => setTick((n) => n + 1), 620)
    return () => window.clearInterval(id)
  }, [])

  const drift = Math.sin(tick / 3) * 14
  const shipX = 50 + Math.sin(tick / 2.4) * 24
  const firing = tick % 3 === 0

  return (
    <TeaserCard game="invaders" label={t.games.invadersName}>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1 block text-center transition-transform duration-500"
        style={{ transform: `translateX(${drift}%)` }}
      >
        <pre className="text-[0.55rem] leading-[1.15] text-primary/55">
          {CHEVRON.join('\n')}
        </pre>
      </span>

      {firing && (
        <span
          aria-hidden="true"
          className="absolute bottom-5 block h-3 w-px bg-accent/70"
          style={{ left: `${shipX}%` }}
        />
      )}

      <span
        aria-hidden="true"
        className="absolute bottom-0 block text-[0.7rem] text-primary transition-[left] duration-500"
        style={{ left: `${shipX}%`, transform: 'translateX(-50%)' }}
      >
        ▲
      </span>
    </TeaserCard>
  )
}

/**
 * Le même terminal que dans le jeu : la commande de l'attaquant, puis la
 * réponse du système quand elle est bloquée.
 */
export function IntrusionTeaser() {
  const { lang, t } = useLang()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced()) return
    const id = window.setInterval(() => setStep((n) => n + 1), 950)
    return () => window.clearInterval(id)
  }, [])

  // Deux étapes par attaque : la commande, puis sa neutralisation.
  const lines = Array.from({ length: 4 }, (_, offset) => {
    const index = step - 3 + offset
    if (index < 0) return null
    const attack = attacks[Math.floor(index / 2) % attacks.length]
    return index % 2 === 0
      ? { kind: 'attacker' as const, text: `$ ${attack.line}` }
      : { kind: 'system' as const, text: `[ok] ${attack.blocked[lang]}` }
  })

  return (
    <TeaserCard game="intrusion" label={t.games.intrusionName}>
      <span aria-hidden="true" className="block space-y-0.5 text-[0.55rem] leading-tight">
        {lines.map((line, i) =>
          line ? (
            <span
              key={i}
              className={`block truncate ${
                line.kind === 'attacker' ? 'text-error/80' : 'text-success/80'
              }`}
            >
              {line.text}
            </span>
          ) : (
            <span key={i} className="block">
              &nbsp;
            </span>
          ),
        )}
      </span>
    </TeaserCard>
  )
}
