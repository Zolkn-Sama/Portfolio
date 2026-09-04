import { useEffect, useRef, useState } from 'react'

const EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
  'scroll',
] as const

/**
 * Vrai après `delay` millisecondes sans aucune interaction.
 *
 * L'état n'est écrit que lorsqu'il change réellement : sans cette garde, chaque
 * mouvement de souris déclencherait un rendu.
 */
export function useIdle(delay: number): boolean {
  const [idle, setIdle] = useState(false)
  const idleRef = useRef(false)

  useEffect(() => {
    let timer = 0

    const goIdle = () => {
      idleRef.current = true
      setIdle(true)
    }

    const reset = () => {
      if (idleRef.current) {
        idleRef.current = false
        setIdle(false)
      }
      window.clearTimeout(timer)
      timer = window.setTimeout(goIdle, delay)
    }

    for (const event of EVENTS) {
      window.addEventListener(event, reset, { passive: true })
    }
    timer = window.setTimeout(goIdle, delay)

    return () => {
      window.clearTimeout(timer)
      for (const event of EVENTS) window.removeEventListener(event, reset)
    }
  }, [delay])

  return idle
}
