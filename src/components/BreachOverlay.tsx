import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'

/**
 * Superposition « intrusion » : lignes de terminal tapées à la volée,
 * balayage lumineux, lignes de scan et flash d’accès autorisé.
 * Purement décoratif — masqué aux lecteurs d’écran.
 *
 * Monté avec une `key` propre à la commande : chaque intrusion repart de zéro.
 */
export function BreachOverlay({
  target,
  mode = 'open',
}: {
  target: string
  /** `open` force l'accès ; `close` efface les traces et referme la session. */
  mode?: 'open' | 'close'
}) {
  const { t } = useLang()
  const lines = mode === 'open' ? t.breach : t.wipe
  const label = mode === 'open' ? t.decrypting : t.closing
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const step = mode === 'open' ? 150 : 95
    const timers = lines.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 60 + i * step),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [lines, target, mode])

  return (
    <div
      aria-hidden="true"
      className={`scanlines pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-box bg-base-100/92 ${
        mode === 'open' ? 'border border-primary/40' : 'border border-warning/40'
      }`}
    >
      <div
        className={`breach-flash absolute inset-0 ${
          mode === 'open' ? 'bg-primary/25' : 'bg-warning/20'
        }`}
      />
      <div
        className={`sweep-bar absolute inset-x-0 top-0 h-16 bg-linear-to-b from-transparent to-transparent ${
          mode === 'open' ? 'via-primary/30' : 'via-warning/30'
        }`}
      />

      <div className="relative flex h-full flex-col justify-center gap-1 p-6 sm:p-10">
        <p
          className={`glitch mb-3 text-xl font-bold tracking-[0.25em] sm:text-3xl ${
            mode === 'open' ? 'text-primary' : 'text-warning'
          }`}
          data-text={label}
        >
          {label}
        </p>
        <ul
          className={`space-y-1 text-[0.7rem] leading-relaxed sm:text-sm ${
            mode === 'open' ? 'text-primary/85' : 'text-warning/85'
          }`}
        >
          {lines.slice(0, visible).map((line) => (
            <li key={line} className="truncate">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3 truncate text-[0.7rem] text-base-content/60 sm:text-sm">
          &gt; target: <span className="text-secondary">{target}</span>
          <span className="caret ml-1">█</span>
        </p>
      </div>
    </div>
  )
}
