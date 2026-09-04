import { useEffect, useRef } from 'react'

/**
 * Halo discret qui suit le pointeur, derrière tout le contenu.
 *
 * Le suivi se fait en écrivant deux variables CSS depuis une frame
 * d’animation : aucun rendu React n’est déclenché par les déplacements de
 * souris. Inactif au clavier, sur écran tactile et si le visiteur a demandé
 * moins de mouvement.
 */
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return
    }

    let frame = 0
    let x = 0
    let y = 0

    const apply = () => {
      frame = 0
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      el.style.setProperty('--halo', '1')
    }

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      frame ||= requestAnimationFrame(apply)
    }

    const onLeave = () => el.style.setProperty('--halo', '0')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="halo" />
}
