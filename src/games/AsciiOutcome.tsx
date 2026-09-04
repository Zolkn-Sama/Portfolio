import { useEffect, useState } from 'react'

/**
 * Fonte bloc 4×5 : uniquement les lettres de SECURE et BREACH.
 * Chaque glyphe fait exactement 4 colonnes, ce qui garde l'alignement.
 */
const GLYPHS: Record<string, string[]> = {
  S: ['████', '█   ', '████', '   █', '████'],
  E: ['████', '█   ', '███ ', '█   ', '████'],
  C: ['████', '█   ', '█   ', '█   ', '████'],
  U: ['█  █', '█  █', '█  █', '█  █', '████'],
  R: ['████', '█  █', '████', '█ █ ', '█  █'],
  B: ['███ ', '█  █', '███ ', '█  █', '███ '],
  A: ['████', '█  █', '████', '█  █', '█  █'],
  H: ['█  █', '█  █', '████', '█  █', '█  █'],
}

const NOISE = '#%&$*+=-:.'

/** Assemble un mot en lignes de blocs, les glyphes séparés d'une colonne. */
function banner(word: string): string[] {
  return Array.from({ length: 5 }, (_, row) =>
    word
      .split('')
      .map((letter) => GLYPHS[letter][row])
      .join(' '),
  )
}

const WON = banner('SECURE')
const LOST = banner('BREACH')

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Bannière ASCII de fin de partie : le bloc se matérialise colonne par
 * colonne depuis un fond de bruit, en bleu si le pare-feu a tenu, en rouge
 * s'il est tombé.
 */
export function AsciiOutcome({ won, label }: { won: boolean; label: string }) {
  const art = won ? WON : LOST
  const width = art[0].length
  const [revealed, setRevealed] = useState(() => (reduced() ? width : 0))
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    if (reduced()) return
    const id = window.setInterval(() => {
      setSeed((n) => n + 1)
      setRevealed((columns) => {
        if (columns >= width) {
          window.clearInterval(id)
          return width
        }
        return columns + 1
      })
    }, 45)
    return () => window.clearInterval(id)
  }, [width])

  const noise = (row: number, column: number) =>
    NOISE[(row * 31 + column * 17 + seed * 7) % NOISE.length]

  return (
    <div className={won ? 'text-info' : 'text-error'}>
      <pre
        aria-hidden="true"
        className="text-[0.5rem] leading-[1.05] font-bold select-none sm:text-xs"
      >
        {art
          .map((line, row) =>
            line
              .split('')
              .map((char, column) =>
                column < revealed ? char : revealed === width ? char : noise(row, column),
              )
              .join(''),
          )
          .join('\n')}
      </pre>
      <p className="mt-3 text-lg font-black tracking-[0.2em] sm:text-2xl">{label}</p>
    </div>
  )
}
