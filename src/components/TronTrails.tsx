import { useEffect, useRef } from 'react'
import { useIdle } from '../hooks/useIdle'
import { useTheme } from './ThemeContext'
import {
  BLAST_MS,
  CELL,
  DIRECTIONS,
  IDLE_MS,
  LINE_WIDTH,
  PALETTES,
  RESPAWN_MS,
  RIDERS,
  SPEED,
  TRAIL_MS,
  TURN,
  colourOf,
  nodeKey,
  rotate,
  segmentAlpha,
  type Palette,
} from './tron'
import { recordKill, recordSelf, setActive } from './tronStore'

type Point = { x: number; y: number; t: number; gap: boolean }

type Rider = {
  x: number
  y: number
  dx: number
  dy: number
  /** Distance parcourue depuis la dernière intersection, en cases. */
  since: number
  points: Point[]
  palette: Palette
  /** Horodatage de réapparition ; 0 tant que la moto roule. */
  deadUntil: number
}

type Blast = { x: number; y: number; t: number; rgb: string }

/** Case occupée par une traînée : jusqu'à quand, et par quelle moto. */
type Cell = { until: number; owner: number }

/**
 * Deux traînées façon Tron, en fond de page.
 *
 * Les motos suivent les lignes du quadrillage, tournent à angle droit aux
 * intersections et **se détruisent au contact d'une traînée**, la leur comprise.
 *
 * La traînée est conservée sous forme de points horodatés et redessinée à
 * chaque image avec une opacité fonction de l'âge. L'effacement par
 * composition `destination-out` a été abandonné : sur 8 bits d'alpha, la
 * décroissance multiplicative se bloque dès que le décrément passe sous un
 * demi-niveau, laissant un résidu permanent délavé vers le fond — d'où des
 * traînées qui ne disparaissaient jamais et perdaient leur couleur.
 *
 * L'animation ne démarre qu'après quelques secondes d'inactivité et s'efface à
 * la première interaction. Inerte si moins de mouvement est demandé.
 */
export function TronTrails({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isDark } = useTheme()
  const idle = useIdle(IDLE_MS)
  const active = idle && !paused
  const theme = isDark ? 'dark' : 'light'

  // Le rail affiche le tableau : il lui faut savoir quand l'animation tourne.
  useEffect(() => setActive(active), [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palettes = PALETTES[theme]
    /** Quatre motos réparties sur les deux couleurs du thème. */
    const riderPalette = (rider: number) => palettes[colourOf(rider)]
    /** Cases occupées par une traînée : échéance et propriétaire. */
    const occupied = new Map<string, Cell>()
    let cols = 0
    let rows = 0
    let riders: Rider[] = []
    let blasts: Blast[] = []

    const place = (palette: Palette, now: number): Rider => {
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      // On cherche une case libre : réapparaître dans une traînée serait fatal
      // à l'image suivante.
      let x = 0
      let y = 0
      for (let tries = 0; tries < 40; tries += 1) {
        x = Math.floor(Math.random() * (cols + 1))
        y = Math.floor(Math.random() * (rows + 1))
        const cell = occupied.get(nodeKey(x, y))
        if (!cell || cell.until <= now) break
      }
      return { x, y, dx, dy, since: 0, points: [], palette, deadUntil: 0 }
    }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      cols = Math.max(4, Math.floor(window.innerWidth / CELL))
      rows = Math.max(4, Math.floor(window.innerHeight / CELL))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineWidth = LINE_WIDTH
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      occupied.clear()
      blasts = []
      riders = Array.from({ length: RIDERS }, (_, rider) =>
        place(riderPalette(rider), performance.now()),
      )
    }

    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    let last = performance.now()

    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      for (const [key, cell] of occupied) if (cell.until <= now) occupied.delete(key)
      blasts = blasts.filter((blast) => now - blast.t < BLAST_MS)

      for (let i = 0; i < riders.length; i += 1) {
        const rider = riders[i]

        if (rider.deadUntil > 0) {
          if (now < rider.deadUntil) continue
          riders[i] = place(riderPalette(i), now)
          continue
        }

        const travel = SPEED * dt
        rider.x += rider.dx * travel
        rider.y += rider.dy * travel
        rider.since += travel

        if (rider.since >= 1) {
          rider.since = 0
          rider.x = Math.round(rider.x)
          rider.y = Math.round(rider.y)
          const key = nodeKey(rider.x, rider.y)

          // Collision : la case porte déjà une traînée encore visible.
          const cell = occupied.get(key)
          if (cell && cell.until > now) {
            blasts.push({
              x: rider.x * CELL,
              y: rider.y * CELL,
              t: now,
              rgb: rider.palette.rgb,
            })
            rider.deadUntil = now + RESPAWN_MS
            rider.points = []
            // La traînée heurtée désigne le responsable. Le score est tenu
            // par couleur : deux motos d'une même couleur jouent ensemble.
            if (cell.owner === i) recordSelf(theme, colourOf(i))
            else recordKill(theme, colourOf(cell.owner))
            continue
          }
          occupied.set(key, { until: now + TRAIL_MS, owner: i })

          if (Math.random() < TURN) {
            const [dx, dy] = rotate(rider.dx, rider.dy, Math.random() < 0.5 ? 1 : -1)
            rider.dx = dx
            rider.dy = dy
          }
        }

        // Sortie d'écran : on réapparaît de l'autre côté, sans tracer le saut.
        let gap = false
        if (rider.x < 0) {
          rider.x = cols
          gap = true
        } else if (rider.x > cols) {
          rider.x = 0
          gap = true
        }
        if (rider.y < 0) {
          rider.y = rows
          gap = true
        } else if (rider.y > rows) {
          rider.y = 0
          gap = true
        }

        rider.points.push({ x: rider.x * CELL, y: rider.y * CELL, t: now, gap })
        while (rider.points.length > 0 && now - rider.points[0].t > TRAIL_MS) {
          rider.points.shift()
        }
      }

      // ── Rendu : tout est redessiné, rien n'est laissé derrière ──
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const rider of riders) {
        for (let i = 1; i < rider.points.length; i += 1) {
          const to = rider.points[i]
          if (to.gap) continue
          const from = rider.points[i - 1]
          const alpha = segmentAlpha(now - to.t, rider.palette.trail)
          if (alpha <= 0.002) continue
          ctx.strokeStyle = `rgba(${rider.palette.rgb}, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
        }

        if (rider.deadUntil > 0) continue
        const hx = rider.x * CELL
        const hy = rider.y * CELL
        ctx.fillStyle = `rgba(${rider.palette.rgb}, ${rider.palette.head})`
        ctx.shadowBlur = 5
        ctx.shadowColor = `rgba(${rider.palette.rgb}, ${rider.palette.head})`
        ctx.beginPath()
        ctx.moveTo(hx + rider.dx * 4.5, hy + rider.dy * 4.5)
        ctx.lineTo(hx - rider.dx * 3 + rider.dy * 2.5, hy - rider.dy * 3 - rider.dx * 2.5)
        ctx.lineTo(hx - rider.dx * 3 - rider.dy * 2.5, hy - rider.dy * 3 + rider.dx * 2.5)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0
      }

      for (const blast of blasts) {
        const progress = (now - blast.t) / BLAST_MS
        ctx.strokeStyle = `rgba(${blast.rgb}, ${(1 - progress) * 0.7})`
        ctx.beginPath()
        ctx.arc(blast.x, blast.y, 4 + progress * 26, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    frame = requestAnimationFrame(step)

    // L'onglet en arrière-plan n'a rien à animer.
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame)
      else {
        last = performance.now()
        frame = requestAnimationFrame(step)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme, active])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-1000 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />

    </>
  )
}
