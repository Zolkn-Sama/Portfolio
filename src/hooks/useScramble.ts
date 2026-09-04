import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#%$&01'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Révèle un texte caractère par caractère, les caractères non encore révélés
 * étant remplacés par des glyphes aléatoires — effet « déchiffrement ».
 *
 * @param text   texte final
 * @param active le déchiffrement tourne tant que `active` est vrai
 * @param delay  décalage avant le début du déchiffrement (ms)
 */
export function useScramble(text: string, active: boolean, delay = 0) {
  const [output, setOutput] = useState<string | null>(null)
  const [renderedText, setRenderedText] = useState(text)
  const frame = useRef(0)
  const reduced = prefersReducedMotion()

  // Nouveau texte : on repart d'un déchiffrement vierge (ajustement en rendu).
  if (renderedText !== text) {
    setRenderedText(text)
    setOutput(null)
  }

  useEffect(() => {
    if (!active || reduced) return

    let raf = 0
    let start: number | null = null
    const revealFrames = Math.max(12, Math.min(48, text.length * 0.8))

    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start - delay

      if (elapsed < 0) {
        setOutput('')
        raf = requestAnimationFrame(tick)
        return
      }

      frame.current += 1
      const progress = Math.min(1, elapsed / (revealFrames * 16.6))
      const revealed = Math.floor(progress * text.length)

      let out = ''
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i]
        if (i < revealed || char === ' ' || char === '\n') out += char
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOutput(out)

      if (progress < 1) raf = requestAnimationFrame(tick)
      else setOutput(text)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, active, delay, reduced])

  return !active || reduced ? text : (output ?? '')
}
