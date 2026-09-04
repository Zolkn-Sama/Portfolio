import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { AsciiOutcome } from './AsciiOutcome'
import { attacks, intro, type Attack } from './attacks'
import { playBlock, playDamage, unlockAudio, vibrate } from './audio'
import { GameShell, Leaderboard, ScoreEntry, type GameResult } from './GameShell'
import { AsciiMeter, ConsolePanel, KeyCap, Stat } from './panels'

const WAVES = 5
const PER_WAVE = 5
const ANNOUNCE_MS = 1500
const MAX_LINES = 40
/** Vitesse de frappe simulée de l'attaquant, en caractères par seconde. */
const ATTACKER_CPS = 42

function shakeElement(el: HTMLElement | null) {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.animate(
    [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(-7px, 2px, 0)' },
      { transform: 'translate3d(6px, -3px, 0)' },
      { transform: 'translate3d(-4px, -2px, 0)' },
      { transform: 'translate3d(3px, 2px, 0)' },
      { transform: 'translate3d(0, 0, 0)' },
    ],
    { duration: 320, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' },
  )
}

type LineKind = 'attacker' | 'system' | 'alert' | 'meta'
type Line = { id: number; kind: LineKind; text: string; revealed: number }

type Target = {
  id: number
  attack: Attack
  /** Temps restant avant que la commande n'aboutisse, de 1 à 0. */
  life: number
  decay: number
  typed: number
  startedAt: number | null
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'announce'; wave: number }
  | { kind: 'running'; wave: number }
  | { kind: 'over'; result: GameResult }

/**
 * Instantané destiné au rendu. Le monde vit dans une ref et n'est recopié
 * ici qu'à 20 images par seconde : aucun effet de bord ne passe par un
 * updater React, ce qui évite les doubles exécutions sous StrictMode.
 */
type View = {
  lines: Line[]
  targets: Target[]
  buffer: string
  attack: number
  integrity: number
  score: number
  multiplier: number
  cleared: number
  /** Nombre de commandes qui ont abouti faute d'avoir été bloquées. */
  landed: number
  /** Meilleur multiplicateur atteint dans la session. */
  topSpeed: number
  /** Frappe refusée récemment : le champ clignote en rouge. */
  bad: boolean
}

type World = Omit<View, 'bad'> & {
  nextLine: number
  nextTarget: number
  spawned: number
  typedChars: number
  startedAt: number
  badUntil: number
}

const blank = (): World => ({
  lines: [],
  targets: [],
  buffer: '',
  attack: 0,
  integrity: 100,
  score: 0,
  multiplier: 1,
  cleared: 0,
  landed: 0,
  topSpeed: 1,
  nextLine: 0,
  nextTarget: 0,
  spawned: 0,
  typedChars: 0,
  startedAt: Date.now(),
  badUntil: 0,
})

const snapshot = (w: World): View => ({
  lines: w.lines,
  targets: w.targets,
  buffer: w.buffer,
  attack: w.attack,
  integrity: w.integrity,
  score: w.score,
  multiplier: w.multiplier,
  cleared: w.cleared,
  landed: w.landed,
  topSpeed: w.topSpeed,
  bad: Date.now() < w.badUntil,
})

/** 1× en dessous de 2 caractères/s, 3× à partir de 8. */
function speedMultiplier(chars: number, seconds: number): number {
  if (seconds <= 0) return 3
  return Math.min(3, Math.max(1, 1 + (chars / seconds - 2) / 3))
}

export function Intrusion({ onClose }: { onClose: () => void }) {
  const { lang, L, t } = useLang()

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [view, setView] = useState<View>(() => snapshot(blank()))
  const [wpm, setWpm] = useState(0)
  const [refresh, setRefresh] = useState(0)

  const world = useRef<World>(blank())
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  const push = useCallback((kind: LineKind, text: string, instant = false) => {
    const w = world.current
    w.lines = [
      ...w.lines.slice(-(MAX_LINES - 1)),
      { id: w.nextLine++, kind, text, revealed: instant ? text.length : 0 },
    ]
  }, [])

  const start = useCallback(() => {
    unlockAudio()
    world.current = blank()
    setView(snapshot(world.current))
    setWpm(0)
    setPhase({ kind: 'announce', wave: 1 })
  }, [])

  // Annonce de vague, puis prologue joué dans le terminal.
  useEffect(() => {
    if (phase.kind !== 'announce') return
    const id = window.setTimeout(() => {
      world.current.spawned = 0
      for (const line of intro(phase.wave, lang)) push('meta', line, true)
      setPhase({ kind: 'running', wave: phase.wave })
    }, ANNOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [phase, lang, push])

  useEffect(() => {
    if (phase.kind === 'running') inputRef.current?.focus()
  }, [phase])

  // Le terminal suit toujours la dernière ligne.
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [view.lines])

  // Boucle : frappe de l'attaquant, expiration des commandes, fin de partie.
  useEffect(() => {
    if (phase.kind !== 'running') return
    const wave = phase.wave
    const maxLive = Math.min(3, 1 + Math.floor(wave / 2))
    const lifespan = Math.max(3.2, 8 - wave * 0.9)
    const spawnEvery = Math.max(900, 2200 - wave * 220)

    // `start()` remplace l'objet monde : la boucle en cours doit s'arrêter au
    // lieu d'écrire dans la partie qui vient de commencer.
    const owned = world.current
    let frame = 0
    let last = performance.now()
    let sinceSpawn = spawnEvery
    let sinceView = 0
    let finished = false

    const finish = (won: boolean) => {
      finished = true
      const w = world.current
      if (won) w.score += w.integrity * 10
      push('alert', won ? `>>> ${t.games.breachRepelled}` : `>>> ${t.games.systemDown}`, true)
      setView(snapshot(w))
      setPhase({
        kind: 'over',
        result: {
          score: w.score,
          detail: won ? `${t.games.integrity} ${w.integrity}%` : `${t.games.wave} ${wave}/${WAVES}`,
          won,
        },
      })
    }

    const tick = (now: number) => {
      if (world.current !== owned) return
      frame = requestAnimationFrame(tick)
      if (finished) return

      const dt = Math.min(0.064, (now - last) / 1000)
      last = now
      sinceSpawn += dt * 1000
      sinceView += dt * 1000
      const w = world.current

      // L'attaquant tape sa commande caractère par caractère.
      for (const line of w.lines) {
        if (line.revealed < line.text.length) {
          line.revealed = Math.min(line.text.length, line.revealed + ATTACKER_CPS * dt)
        }
      }

      // Les commandes non bloquées finissent par aboutir.
      const landed: Target[] = []
      w.targets = w.targets.filter((target) => {
        target.life -= target.decay * dt
        if (target.life > 0) return true
        landed.push(target)
        return false
      })

      for (const target of landed) {
        w.attack = Math.min(100, w.attack + target.attack.weight)
        w.integrity = Math.max(0, w.integrity - target.attack.weight)
        w.multiplier = 1
        w.landed += 1
        w.buffer = ''
        push('alert', `!! ${target.attack.landed[lang]}`, true)
      }
      if (landed.length > 0) {
        playDamage()
        vibrate([40, 50, 70])
        shakeElement(shellRef.current)
      }

      if (w.attack >= 100 || w.integrity <= 0) {
        finish(false)
        setView(snapshot(w))
        return
      }

      // Apparition d'une nouvelle commande.
      const waveDone = w.spawned >= PER_WAVE
      if (!waveDone && sinceSpawn >= spawnEvery && w.targets.length < maxLive) {
        sinceSpawn = 0
        w.spawned += 1
        const used = new Set(w.targets.map((target) => target.attack.word))
        const pool = attacks.filter((attack) => !used.has(attack.word))
        const attack = pool[Math.floor(Math.random() * pool.length)]
        w.targets = [
          ...w.targets,
          {
            id: w.nextTarget++,
            attack,
            life: 1,
            decay: 1 / lifespan,
            typed: 0,
            startedAt: null,
          },
        ]
        push('attacker', `$ ${attack.line}`)
      }

      if (waveDone && w.targets.length === 0) {
        if (wave >= WAVES) {
          finish(true)
          return
        }
        finished = true
        setView(snapshot(w))
        setPhase({ kind: 'announce', wave: wave + 1 })
        return
      }

      if (sinceView >= 50) {
        sinceView = 0
        const minutes = Math.max(1 / 60, (Date.now() - w.startedAt) / 60000)
        setWpm(Math.round(w.typedChars / 5 / minutes))
        setView(snapshot(w))
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, lang, push, t.games])

  /** Un caractère n'est retenu que s'il prolonge au moins une commande active. */
  const onType = (value: string) => {
    if (phase.kind !== 'running') return
    const w = world.current
    const candidate = value.toLowerCase().trimStart()

    if (candidate === '') {
      w.buffer = ''
      w.targets = w.targets.map((target) => ({ ...target, typed: 0 }))
      setView(snapshot(w))
      return
    }

    const matches = w.targets.filter((target) => target.attack.word.startsWith(candidate))
    if (matches.length === 0) {
      w.badUntil = Date.now() + 220
      setView(snapshot(w))
      return
    }

    w.typedChars += Math.max(0, candidate.length - w.buffer.length)
    w.buffer = candidate
    const now = Date.now()
    w.targets = w.targets.map((target) =>
      target.attack.word.startsWith(candidate)
        ? { ...target, typed: candidate.length, startedAt: target.startedAt ?? now }
        : { ...target, typed: 0 },
    )

    const done = matches.find((target) => target.attack.word === candidate)
    if (done) {
      const seconds = (now - (done.startedAt ?? now)) / 1000
      const mult = speedMultiplier(done.attack.word.length, seconds)
      w.multiplier = Number(mult.toFixed(1))
      w.topSpeed = Math.max(w.topSpeed, w.multiplier)
      w.score += Math.round(done.attack.word.length * 10 * mult)
      w.cleared += 1
      w.attack = Math.max(0, w.attack - 2)
      w.targets = w.targets.filter((target) => target.id !== done.id)
      w.buffer = ''
      push('system', `[ok] ${done.attack.blocked[lang]}`, true)
      playBlock()
    }

    setView(snapshot(w))
  }

  const progress = Math.round((view.cleared / (WAVES * PER_WAVE)) * 100)
  const threat =
    view.attack >= 60
      ? { label: t.games.threatCritical, tone: 'bad' as const }
      : view.attack >= 25
        ? { label: t.games.threatRaised, tone: 'accent' as const }
        : { label: t.games.threatCalm, tone: 'good' as const }

  const lineClass: Record<LineKind, string> = {
    attacker: 'text-error/90',
    system: 'text-success',
    alert: 'text-warning font-bold',
    meta: 'text-base-content/40',
  }

  return (
    <GameShell
      title={t.games.intrusionName}
      onClose={onClose}
      onRestart={start}
      canRestart={phase.kind !== 'idle'}
      hud={
        <>
          <span>
            {t.games.score} <b className="text-primary tabular-nums">{view.score}</b>
          </span>
          <span>
            ×<b className="text-accent tabular-nums">{view.multiplier}</b>
          </span>
          <span>
            {t.games.integrity}{' '}
            <b className={view.integrity > 40 ? 'text-success' : 'text-error'}>
              {view.integrity}%
            </b>
          </span>
          <span className="text-base-content/50">
            {wpm} {t.games.wpm}
          </span>
          {phase.kind === 'running' && (
            <span className="text-base-content/50">
              {t.games.wave} {phase.wave}/{WAVES}
            </span>
          )}
        </>
      }
      left={
        <>
          <ConsolePanel title={t.games.console} tone={view.attack >= 60 ? 'error' : 'primary'}>
            <ul className="mb-1.5 space-y-0.5">
              <Stat label={t.games.host} value="10.0.0.14" />
              <Stat
                label={t.games.session}
                value={
                  phase.kind === 'running'
                    ? `${t.games.wave} ${phase.wave}/${WAVES}`
                    : t.games.standby
                }
              />
              <Stat label={t.games.threat} value={threat.label} tone={threat.tone} />
            </ul>
            <div className="space-y-1.5">
              <AsciiMeter
                label={t.games.integrity}
                value={view.integrity}
                tone={view.integrity > 40 ? 'primary' : 'error'}
              />
              <AsciiMeter
                label={t.games.attackProgress}
                value={view.attack}
                tone="error"
              />
              <AsciiMeter label={t.games.progress} value={progress} tone="warning" />
            </div>
          </ConsolePanel>

          <ConsolePanel title={t.games.report}>
            <ul className="space-y-0.5">
              <Stat label={t.games.blocked} value={view.cleared} tone="good" />
              <Stat label={t.games.landed} value={view.landed} tone={view.landed > 0 ? 'bad' : undefined} />
              <Stat label={t.games.topSpeed} value={`×${view.topSpeed.toFixed(1)}`} tone="accent" />
              <Stat label={t.games.wpm} value={wpm} />
            </ul>
          </ConsolePanel>

          <ConsolePanel title={t.games.targets} tone={view.targets.length > 0 ? 'error' : 'primary'}>
            {view.targets.length === 0 ? (
              <p className="text-[0.7rem] text-base-content/40">—</p>
            ) : (
              <ul className="space-y-0.5">
                {view.targets.map((target) => (
                  <Stat
                    key={target.id}
                    label={target.attack.word}
                    value={`-${target.attack.weight}%`}
                    tone="bad"
                  />
                ))}
              </ul>
            )}
          </ConsolePanel>
        </>
      }
      right={
        <>
          <Leaderboard game="intrusion" key={refresh} />
          <ConsolePanel title={t.games.scoring}>
            <ul className="space-y-0.5">
              {t.games.intrusionScoring.map((rule) => (
                <Stat key={rule.label} label={rule.label} value={rule.value} />
              ))}
            </ul>
          </ConsolePanel>
          <ConsolePanel title={t.games.controls}>
            <ul className="space-y-1 text-[0.65rem] text-base-content/60">
              <li className="flex flex-wrap items-center gap-1">
                <KeyCap>a-z</KeyCap>
                <span>{L({ fr: 'nom de l’outil', en: 'tool name' })}</span>
              </li>
              <li className="flex flex-wrap items-center gap-1">
                <KeyCap>échap</KeyCap>
                <span>{L({ fr: 'quitter', en: 'quit' })}</span>
              </li>
            </ul>
          </ConsolePanel>
        </>
      }
    >
      <div ref={shellRef} className="flex h-full flex-col">
        {/* Terminal */}
        <div
          ref={logRef}
          className="min-h-0 grow space-y-0.5 overflow-y-auto p-4 text-xs leading-relaxed sm:text-sm"
        >
          {view.lines.map((line) => (
            <p key={line.id} className={lineClass[line.kind]}>
              {line.text.slice(0, Math.floor(line.revealed))}
              {line.revealed < line.text.length && (
                <span className="caret text-error" aria-hidden="true">
                  ▍
                </span>
              )}
            </p>
          ))}
        </div>

        {/* Commandes à bloquer */}
        <div className="shrink-0 border-t border-base-300 px-4 py-3">
          <ul className="flex min-h-12 flex-wrap gap-2">
            {view.targets.map((target) => (
              <li
                key={target.id}
                className="overflow-hidden rounded-field border border-error/50 bg-base-100/70"
              >
                <span className="block px-3 py-1 font-mono text-sm">
                  <span className="font-bold text-primary">
                    {target.attack.word.slice(0, target.typed)}
                  </span>
                  <span className="text-base-content/85">
                    {target.attack.word.slice(target.typed)}
                  </span>
                </span>
                <span
                  className="block h-1 bg-error transition-none"
                  style={{ width: `${Math.max(0, target.life) * 100}%` }}
                />
              </li>
            ))}
          </ul>

          <div
            className={`mt-3 flex items-center gap-2 rounded-field border px-3 py-2 ${
              view.bad ? 'border-error' : 'border-primary/50'
            }`}
          >
            <span aria-hidden="true" className="shrink-0 text-primary">
              &gt;
            </span>
            <input
              ref={inputRef}
              value={view.buffer}
              onChange={(e) => onType(e.target.value)}
              onBlur={() => {
                if (phase.kind === 'running') inputRef.current?.focus()
              }}
              autoComplete="off"
              spellCheck={false}
              aria-label={t.games.intrusionInput}
              className={`w-full bg-transparent font-mono text-sm outline-hidden ${
                view.bad ? 'text-error' : 'text-primary'
              }`}
            />
          </div>
        </div>

        {phase.kind !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-base-100/90 p-6 text-center">
            {phase.kind === 'idle' && (
              <>
                <p className="text-2xl font-black tracking-[0.2em] text-primary">
                  {t.games.intrusionName}
                </p>
                <p className="max-w-sm text-sm text-base-content/70">
                  {t.games.intrusionRules}
                </p>
                <button type="button" onClick={start} className="btn btn-primary btn-sm">
                  {t.games.start}
                </button>
              </>
            )}
            {phase.kind === 'announce' && (
              <p
                className="glitch text-4xl font-black tracking-[0.3em] text-primary"
                data-text={`${t.games.wave} ${phase.wave}`}
              >
                {t.games.wave} {phase.wave}
              </p>
            )}
            {phase.kind === 'over' && (
              <>
                <AsciiOutcome
                  won={phase.result.won}
                  label={phase.result.won ? t.games.breachRepelled : t.games.systemDown}
                />
                <p className="text-lg">
                  {t.games.score}{' '}
                  <b className="text-primary tabular-nums">{phase.result.score}</b>
                </p>
                <ScoreEntry
                  game="intrusion"
                  result={phase.result}
                  onSaved={() => setRefresh((n) => n + 1)}
                />
                <button type="button" onClick={start} className="btn btn-primary btn-sm">
                  {t.games.restart}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </GameShell>
  )
}
