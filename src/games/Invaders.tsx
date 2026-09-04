import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playDamage, playShoot, unlockAudio, vibrate } from './audio'
import { GameShell, Leaderboard, ScoreEntry, type GameResult } from './GameShell'
import { AsciiMeter, ConsolePanel, KeyCap, Stat } from './panels'
import {
  BOSS_HP,
  BOSS_SHOT_CAP,
  VH,
  VW,
  WAVES,
  enemyShotCap,
  formation,
  waveIntel,
  type Alien,
} from './waves'

const ANNOUNCE_MS = 1400
/** Cadence du joueur : un tir toutes les 400 ms, trois en vol au plus. */
const FIRE_DELAY = 0.4
const MAX_SHOTS = 3

type Vec = { x: number; y: number }
type Shot = Vec & { vy: number }
type Boss = { x: number; y: number; hp: number; max: number; dir: number }

type Stats = { fired: number; hits: number; kills: number; bestCombo: number }

type Phase =
  | { kind: 'idle' }
  | { kind: 'announce'; label: string; wave: number }
  | { kind: 'running'; wave: number }
  | { kind: 'over'; result: GameResult }

type World = {
  ship: number
  aliens: Alien[]
  boss: Boss | null
  shots: Shot[]
  enemyShots: Shot[]
  dir: number
  drop: number
  cooldown: number
  enemyCooldown: number
  invulnerable: number
  waveStart: number
  combo: number
  comboAt: number
  /** Amplitude résiduelle de la secousse, en unités virtuelles. */
  shake: number
  fired: number
  hits: number
  kills: number
  bestCombo: number
}

const blank = (): World => ({
  ship: VW / 2,
  aliens: [],
  boss: null,
  shots: [],
  enemyShots: [],
  dir: 1,
  drop: 0,
  cooldown: 0,
  enemyCooldown: 0,
  invulnerable: 0,
  waveStart: 0,
  combo: 1,
  comboAt: 0,
  shake: 0,
  fired: 0,
  hits: 0,
  kills: 0,
  bestCombo: 1,
})

/** Résout les couleurs du thème courant en valeurs utilisables par le canvas. */
function themeColors(host: HTMLElement) {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  host.appendChild(probe)
  const read = (token: string) => {
    probe.style.color = `var(${token})`
    const value = getComputedStyle(probe).color
    return value || '#22e37a'
  }
  const colors = {
    primary: read('--color-primary'),
    accent: read('--color-accent'),
    error: read('--color-error'),
    base: read('--color-base-content'),
  }
  probe.remove()
  return colors
}

export function Invaders({ onClose }: { onClose: () => void }) {
  const { L, t } = useLang()

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(1)
  const [stats, setStats] = useState<Stats>({ fired: 0, hits: 0, kills: 0, bestCombo: 1 })
  const [refresh, setRefresh] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const world = useRef<World>(blank())
  const keys = useRef({ left: false, right: false, fire: false })
  const scoreRef = useRef(0)
  const livesRef = useRef(3)

  const start = useCallback(() => {
    unlockAudio()
    world.current = blank()
    scoreRef.current = 0
    livesRef.current = 3
    setScore(0)
    setLives(3)
    setCombo(1)
    setStats({ fired: 0, hits: 0, kills: 0, bestCombo: 1 })
    setPhase({ kind: 'announce', label: `${t.games.wave} 1/${WAVES}`, wave: 1 })
  }, [t.games.wave])

  // Annonce de vague, puis mise en place des ennemis.
  useEffect(() => {
    if (phase.kind !== 'announce') return
    const id = window.setTimeout(() => {
      const w = world.current
      w.shots = []
      w.enemyShots = []
      w.dir = 1
      w.drop = 0
      w.waveStart = performance.now()
      if (phase.wave > WAVES) {
        w.aliens = []
        w.boss = { x: VW / 2, y: 120, hp: BOSS_HP, max: BOSS_HP, dir: 1 }
      } else {
        w.aliens = formation(phase.wave)
        w.boss = null
      }
      setPhase({ kind: 'running', wave: phase.wave })
    }, ANNOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  // Clavier.
  useEffect(() => {
    const set = (event: KeyboardEvent, down: boolean) => {
      if (event.key === 'ArrowLeft') keys.current.left = down
      else if (event.key === 'ArrowRight') keys.current.right = down
      else if (event.key === ' ') {
        keys.current.fire = down
        event.preventDefault()
      } else return
      event.preventDefault()
    }
    const onDown = (e: KeyboardEvent) => set(e, true)
    const onUp = (e: KeyboardEvent) => set(e, false)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // Boucle de jeu et rendu.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = themeColors(canvas.parentElement ?? document.body)
    // `start()` remplace l'objet monde : la boucle en cours doit s'arrêter au
    // lieu d'écrire dans la partie qui vient de commencer.
    const owned = world.current
    const running = phase.kind === 'running'
    const wave = running ? phase.wave : 0
    let frame = 0
    let last = performance.now()
    let finished = false

    const report = () => {
      const w = world.current
      setStats({ fired: w.fired, hits: w.hits, kills: w.kills, bestCombo: w.bestCombo })
    }

    const award = (points: number) => {
      scoreRef.current = Math.max(0, scoreRef.current + points)
      setScore(scoreRef.current)
    }

    const step = (dt: number, now: number) => {
      const w = world.current
      if (!running || finished) return

      // Vaisseau
      const speed = 420
      if (keys.current.left) w.ship -= speed * dt
      if (keys.current.right) w.ship += speed * dt
      w.ship = Math.max(30, Math.min(VW - 30, w.ship))

      w.cooldown -= dt
      if (keys.current.fire && w.cooldown <= 0 && w.shots.length < MAX_SHOTS) {
        w.cooldown = FIRE_DELAY
        w.shots.push({ x: w.ship, y: VH - 60, vy: -620 })
        w.fired += 1
        report()
        playShoot()
      }
      w.invulnerable = Math.max(0, w.invulnerable - dt)
      w.shake = Math.max(0, w.shake - dt * 46)
      if (now - w.comboAt > 1600 && w.combo > 1) {
        w.combo = 1
        setCombo(1)
      }

      w.shots = w.shots.filter((shot) => {
        shot.y += shot.vy * dt
        return shot.y > -20
      })
      w.enemyShots = w.enemyShots.filter((shot) => {
        shot.y += shot.vy * dt
        return shot.y < VH + 20
      })

      // Nuée d'aliens
      if (w.aliens.length > 0) {
        const living = w.aliens.filter((a) => a.alive)
        const pace = (26 + wave * 16) * (1 + (1 - living.length / w.aliens.length) * 1.4)
        let bounce = false
        for (const alien of living) {
          alien.x += w.dir * pace * dt
          if (alien.x < 40 || alien.x > VW - 40) bounce = true
        }
        if (bounce) {
          w.dir *= -1
          for (const alien of living) alien.y += 22
        }

        w.enemyCooldown -= dt
        const salvo = enemyShotCap(wave)
        if (w.enemyCooldown <= 0 && living.length > 0 && w.enemyShots.length < salvo) {
          w.enemyCooldown = Math.max(0.3, 1.4 - wave * 0.25)
          const shooter = living[Math.floor(Math.random() * living.length)]
          w.enemyShots.push({ x: shooter.x, y: shooter.y + 16, vy: 240 + wave * 40 })
        }

        for (const shot of w.shots) {
          for (const alien of living) {
            if (Math.abs(alien.x - shot.x) < 22 && Math.abs(alien.y - shot.y) < 20) {
              alien.alive = false
              shot.y = -100
              w.combo = Math.min(3, Number((w.combo + 0.15).toFixed(2)))
              w.comboAt = now
              w.bestCombo = Math.max(w.bestCombo, w.combo)
              w.hits += 1
              w.kills += 1
              setCombo(Number(w.combo.toFixed(1)))
              report()
              award(Math.round(100 * w.combo))
              break
            }
          }
        }

        if (living.some((alien) => alien.y > VH - 110)) {
          livesRef.current = 0
          setLives(0)
        }

        if (w.aliens.every((alien) => !alien.alive)) {
          const seconds = (now - w.waveStart) / 1000
          award(Math.max(0, Math.round((40 - seconds) * 40)))
          w.aliens = []
          const next = wave + 1
          finished = true
          setPhase({
            kind: 'announce',
            label: next > WAVES ? t.games.boss : `${t.games.wave} ${next}/${WAVES}`,
            wave: next,
          })
          return
        }
      }

      // Boss
      if (w.boss) {
        const boss = w.boss
        boss.x += boss.dir * 150 * dt
        if (boss.x < 110 || boss.x > VW - 110) boss.dir *= -1
        boss.y = 120 + Math.sin(now / 900) * 26

        w.enemyCooldown -= dt
        if (w.enemyCooldown <= 0 && w.enemyShots.length < BOSS_SHOT_CAP) {
          w.enemyCooldown = 0.55
          for (const offset of [-70, 0, 70]) {
            w.enemyShots.push({ x: boss.x + offset, y: boss.y + 50, vy: 300 })
          }
        }

        for (const shot of w.shots) {
          if (Math.abs(boss.x - shot.x) < 90 && Math.abs(boss.y - shot.y) < 46) {
            shot.y = -100
            boss.hp -= 1
            w.hits += 1
            report()
            award(Math.round(40 * w.combo))
          }
        }

        if (boss.hp <= 0) {
          w.boss = null
          w.kills += 1
          report()
          award(2500)
          finished = true
          setPhase({
            kind: 'over',
            result: {
              score: scoreRef.current + 2500,
              detail: t.games.victory,
              won: true,
            },
          })
          return
        }
      }

      // Dégâts subis
      if (w.invulnerable <= 0) {
        const hit = w.enemyShots.find(
          (shot) => Math.abs(shot.x - w.ship) < 24 && shot.y > VH - 76 && shot.y < VH - 30,
        )
        if (hit) {
          w.enemyShots = w.enemyShots.filter((shot) => shot !== hit)
          w.invulnerable = 1.4
          w.shake = 14
          playDamage()
          vibrate([35, 40, 60])
          w.combo = 1
          setCombo(1)
          award(-150)
          livesRef.current -= 1
          setLives(livesRef.current)
        }
      }

      if (livesRef.current <= 0) {
        finished = true
        setPhase({
          kind: 'over',
          result: {
            score: scoreRef.current,
            detail: w.boss ? t.games.boss : `${t.games.wave} ${wave}/${WAVES}`,
            won: false,
          },
        })
      }
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.round(rect.width * dpr)) {
        canvas.width = Math.round(rect.width * dpr)
        canvas.height = Math.round(rect.height * dpr)
      }
      const scale = Math.min(rect.width / VW, rect.height / VH)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const w = world.current
      // La secousse décale l'ensemble du repère : rien à changer au dessin.
      const jitterX = w.shake > 0 ? (Math.random() * 2 - 1) * w.shake : 0
      const jitterY = w.shake > 0 ? (Math.random() * 2 - 1) * w.shake : 0
      ctx.setTransform(
        scale * dpr,
        0,
        0,
        scale * dpr,
        ((rect.width - VW * scale) / 2 + jitterX * scale) * dpr,
        ((rect.height - VH * scale) / 2 + jitterY * scale) * dpr,
      )

      ctx.fillStyle = colors.primary
      for (const alien of w.aliens) {
        if (!alien.alive) continue
        ctx.globalAlpha = 1 - alien.row * 0.12
        ctx.fillRect(alien.x - 16, alien.y - 10, 32, 12)
        ctx.fillRect(alien.x - 10, alien.y + 2, 20, 8)
        ctx.fillRect(alien.x - 22, alien.y - 2, 6, 6)
        ctx.fillRect(alien.x + 16, alien.y - 2, 6, 6)
      }
      ctx.globalAlpha = 1

      if (w.boss) {
        ctx.fillStyle = colors.error
        ctx.fillRect(w.boss.x - 90, w.boss.y - 34, 180, 54)
        ctx.fillRect(w.boss.x - 60, w.boss.y + 20, 120, 18)
        ctx.fillStyle = colors.base
        ctx.globalAlpha = 0.25
        ctx.fillRect(w.boss.x - 90, w.boss.y - 58, 180, 10)
        ctx.globalAlpha = 1
        ctx.fillStyle = colors.accent
        ctx.fillRect(w.boss.x - 90, w.boss.y - 58, 180 * (w.boss.hp / w.boss.max), 10)
      }

      ctx.fillStyle = colors.accent
      for (const shot of w.shots) ctx.fillRect(shot.x - 2, shot.y - 12, 4, 14)
      ctx.fillStyle = colors.error
      for (const shot of w.enemyShots) ctx.fillRect(shot.x - 2, shot.y, 4, 12)

      ctx.globalAlpha = w.invulnerable > 0 && Math.floor(w.invulnerable * 12) % 2 === 0 ? 0.3 : 1
      ctx.fillStyle = colors.primary
      ctx.fillRect(w.ship - 24, VH - 48, 48, 12)
      ctx.fillRect(w.ship - 8, VH - 60, 16, 12)
      ctx.globalAlpha = 1

      ctx.strokeStyle = colors.base
      ctx.globalAlpha = 0.15
      ctx.beginPath()
      ctx.moveTo(0, VH - 20)
      ctx.lineTo(VW, VH - 20)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      if (world.current !== owned) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      step(dt, now)
      draw()
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [phase, t.games.wave, t.games.boss, t.games.victory])

  const currentWave =
    phase.kind === 'running' || phase.kind === 'announce' ? phase.wave : 0
  const accuracy = stats.fired > 0 ? (stats.hits / stats.fired) * 100 : 0

  const onPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const scale = Math.min(rect.width / VW, rect.height / VH)
    const offset = (rect.width - VW * scale) / 2
    world.current.ship = Math.max(
      30,
      Math.min(VW - 30, (event.clientX - rect.left - offset) / scale),
    )
  }

  return (
    <GameShell
      title={t.games.invadersName}
      onClose={onClose}
      onRestart={start}
      canRestart={phase.kind !== 'idle'}
      boxed
      hud={
        <>
          <span>
            {t.games.score} <b className="text-primary tabular-nums">{score}</b>
          </span>
          <span>
            ×<b className="text-accent tabular-nums">{combo}</b>
          </span>
          <span>
            {t.games.lives}{' '}
            <b className={lives > 1 ? 'text-success' : 'text-error'}>
              {'▮'.repeat(Math.max(0, lives))}
            </b>
          </span>
          {phase.kind === 'running' && (
            <span className="text-base-content/50">
              {phase.wave > WAVES ? t.games.boss : `${t.games.wave} ${phase.wave}/${WAVES}`}
            </span>
          )}
        </>
      }
      left={
        <>
          <ConsolePanel title={t.games.mission}>
            <ol className="space-y-1">
              {waveIntel.map((intel) => {
                const active = phase.kind !== 'idle' && currentWave === intel.wave
                const done = currentWave > intel.wave
                return (
                  <li
                    key={intel.wave}
                    className={`flex items-center gap-1.5 rounded-field border px-1.5 py-1 transition-colors ${
                      active
                        ? 'border-primary bg-primary/10'
                        : done
                          ? 'border-base-300 opacity-45'
                          : 'border-base-300'
                    }`}
                  >
                    <pre
                      aria-hidden="true"
                      className={`shrink-0 text-[0.3rem] leading-[1.1] ${
                        active ? 'text-primary' : 'text-base-content/40'
                      }`}
                    >
                      {intel.sketch.join('\n')}
                    </pre>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.65rem] font-semibold">
                        {intel.wave} · {L(intel.name)}
                      </span>
                      <span className="block truncate text-[0.6rem] text-base-content/50">
                        {intel.count} ● · {intel.salvo} ↯
                      </span>
                    </span>
                    {done && (
                      <span aria-hidden="true" className="ml-auto text-success">
                        ✓
                      </span>
                    )}
                  </li>
                )
              })}
              <li
                className={`flex items-center gap-1.5 rounded-field border px-1.5 py-1 ${
                  currentWave > WAVES ? 'border-error bg-error/10' : 'border-base-300'
                }`}
              >
                <pre
                  aria-hidden="true"
                  className={`shrink-0 text-[0.3rem] leading-[1.1] ${
                    currentWave > WAVES ? 'text-error' : 'text-base-content/40'
                  }`}
                >
                  {'███████\n ▀▄▄▄▀ \n  ▀▀▀  '}
                </pre>
                <span>
                  <span className="block text-[0.65rem] font-semibold">{t.games.boss}</span>
                  <span className="block text-[0.6rem] text-base-content/50">
                    {BOSS_HP} ♥ · {BOSS_SHOT_CAP} ↯
                  </span>
                </span>
              </li>
            </ol>
          </ConsolePanel>

          <ConsolePanel title={t.games.report}>
            <ul className="space-y-1">
              <Stat label={t.games.fired} value={stats.fired} />
              <Stat label={t.games.hits} value={stats.hits} />
              <Stat label={t.games.kills} value={stats.kills} tone="good" />
              <Stat label={t.games.bestCombo} value={`×${stats.bestCombo.toFixed(1)}`} tone="accent" />
            </ul>
            <div className="mt-1.5">
              <AsciiMeter label={t.games.accuracy} value={accuracy} />
            </div>
          </ConsolePanel>
        </>
      }
      right={
        <>
          <Leaderboard game="invaders" key={refresh} />
          <ConsolePanel title={t.games.scoring}>
            <ul className="space-y-0.5">
              {t.games.invadersScoring.map((rule) => (
                <Stat key={rule.label} label={rule.label} value={rule.value} />
              ))}
            </ul>
          </ConsolePanel>
          <ConsolePanel title={t.games.controls}>
            <ul className="space-y-1 text-[0.65rem] text-base-content/60">
              <li className="flex flex-wrap items-center gap-1">
                <KeyCap>←</KeyCap>
                <KeyCap>→</KeyCap>
                <span>{L({ fr: 'souris', en: 'mouse' })}</span>
              </li>
              <li className="flex flex-wrap items-center gap-1">
                <KeyCap>espace</KeyCap>
                <span>{L({ fr: 'tirer', en: 'fire' })}</span>
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
      <canvas
        ref={canvasRef}
        onPointerMove={onPointer}
        onPointerDown={(e) => {
          unlockAudio()
          onPointer(e)
          keys.current.fire = true
        }}
        onPointerUp={() => {
          keys.current.fire = false
        }}
        className="h-full w-full touch-none"
      />

      {phase.kind !== 'running' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-base-100/85 text-center">
          {phase.kind === 'idle' && (
            <>
              <p className="text-2xl font-black tracking-[0.2em] text-primary">
                {t.games.invadersName}
              </p>
              <p className="max-w-sm text-sm text-base-content/70">{t.games.invadersRules}</p>
              <button type="button" onClick={start} className="btn btn-primary btn-sm">
                {t.games.start}
              </button>
            </>
          )}
          {phase.kind === 'announce' && (
            <p
              className={`glitch text-4xl font-black tracking-[0.3em] ${
                phase.wave > WAVES ? 'text-error' : 'text-primary'
              }`}
              data-text={phase.label}
            >
              {phase.label}
            </p>
          )}
          {phase.kind === 'over' && (
            <>
              <p
                className={`text-3xl font-black tracking-[0.2em] ${
                  phase.result.won ? 'text-success' : 'text-error'
                }`}
              >
                {phase.result.won ? t.games.victory : t.games.gameOver}
              </p>
              <p className="text-lg">
                {t.games.score} <b className="text-primary tabular-nums">{phase.result.score}</b>
              </p>
              <ScoreEntry
                game="invaders"
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
    </GameShell>
  )
}
