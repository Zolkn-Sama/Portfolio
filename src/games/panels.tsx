import type { ReactNode } from 'react'

/** Encadré de console : un titre en petites capitales, un contenu. */
export function ConsolePanel({
  title,
  children,
  tone = 'primary',
}: {
  title: string
  children: ReactNode
  tone?: 'primary' | 'error'
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-200/50 px-2.5 py-2">
      <h3
        className={`mb-1.5 flex items-center gap-1.5 text-[0.6rem] tracking-[0.18em] uppercase ${
          tone === 'error' ? 'text-error' : 'text-primary'
        }`}
      >
        <span aria-hidden="true">▚</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

/** Ligne étiquette / valeur, alignée en colonnes. */
export function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: ReactNode
  tone?: 'good' | 'bad' | 'accent'
}) {
  const color =
    tone === 'good'
      ? 'text-success'
      : tone === 'bad'
        ? 'text-error'
        : tone === 'accent'
          ? 'text-accent'
          : 'text-base-content/85'
  return (
    <li className="flex items-baseline justify-between gap-2 text-[0.65rem]">
      <span className="shrink-0 text-base-content/45">{label}</span>
      <span className={`truncate tabular-nums ${color}`}>{value}</span>
    </li>
  )
}

/** Jauge en blocs ASCII — plus proche d'une console qu'une barre pleine. */
export function AsciiMeter({
  value,
  label,
  tone = 'primary',
  width = 10,
}: {
  value: number
  label: string
  tone?: 'primary' | 'error' | 'warning'
  width?: number
}) {
  const ratio = Math.max(0, Math.min(1, value / 100))
  const filled = Math.round(ratio * width)
  const color =
    tone === 'error' ? 'text-error' : tone === 'warning' ? 'text-warning' : 'text-primary'

  return (
    <div className="text-[0.65rem]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base-content/45">{label}</span>
        <span className={`tabular-nums ${color}`}>{Math.round(value)}%</span>
      </div>
      <p className={`font-mono leading-none tracking-tight ${color}`} aria-hidden="true">
        [<span>{'█'.repeat(filled)}</span>
        <span className="opacity-25">{'░'.repeat(width - filled)}</span>]
      </p>
    </div>
  )
}

/** Touche du clavier, présentée comme telle. */
export function KeyCap({ children }: { children: string }) {
  return <kbd className="kbd kbd-xs font-mono">{children}</kbd>
}
