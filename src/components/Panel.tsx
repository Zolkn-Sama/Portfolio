import { useState } from 'react'
import { type Command } from '../data/commands'
import { replies, unknownReply } from '../data/replies'
import { identity } from '../data/profile'
import { useLang } from '../i18n/LangContext'
import { TypedLine } from './TypedLine'
import { BreachOverlay } from './BreachOverlay'
import { Scrambled } from './Scrambled'
import { SectionBody, UnknownSection } from './sections'

/** Copie l’URL courante — fragment de section et langue compris. */
function ShareButton() {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs shrink-0 font-mono"
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href).then(() => {
          setDone(true)
          window.setTimeout(() => setDone(false), 1600)
        })
      }}
    >
      {done ? `✓ ${t.linkCopied}` : `🔗 ${t.share}`}
    </button>
  )
}

export type PanelTarget = { command: Command | null; query: string }

export const PANEL_ID = 'result-panel'

/**
 * Zone de résultat sous la présentation. `pending` est la commande en cours
 * d’« intrusion » (animation par-dessus le panneau) ; `shown` est le contenu
 * actuellement révélé, remplacé dès que l’intrusion aboutit.
 */
export function Panel({
  pending,
  shown,
  decrypting,
  closing,
  onRun,
  onClose,
}: {
  pending: PanelTarget | null
  shown: PanelTarget | null
  decrypting: boolean
  /** La session se referme : effacement des traces puis disparition. */
  closing: boolean
  onRun: (query: string) => void
  onClose: () => void
}) {
  const { L, t } = useLang()

  if (!pending && !shown) return null

  const heading = shown?.command
    ? L(shown.command.label).toUpperCase()
    : t.unknownTitle.toUpperCase()
  const path = shown?.command ? `/var/data/${shown.command.id}` : '/dev/null'

  return (
    <section
      id={PANEL_ID}
      aria-live="polite"
      aria-busy={pending !== null || closing}
      className={`relative min-h-[22rem] scroll-mt-4 overflow-hidden rounded-box border border-base-300 bg-base-100/70 backdrop-blur ${
        closing ? 'panel-out' : ''
      }`}
    >
      {pending && (
        <BreachOverlay
          key={pending.query}
          target={pending.command?.id ?? pending.query}
        />
      )}

      {closing && shown && (
        <BreachOverlay
          key={`close-${shown.query}`}
          mode="close"
          target={shown.command?.id ?? shown.query}
        />
      )}

      {shown && (
        <div className="p-4 sm:p-6">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-3">
            <div className="min-w-0">
              <Scrambled
                as="h2"
                text={heading}
                active={decrypting}
                className="truncate text-lg font-bold tracking-[0.2em] text-primary sm:text-2xl"
              />
              <p className="mt-1 truncate text-xs text-base-content/50">cat {path}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <ShareButton />
              <button
                type="button"
                onClick={onClose}
                disabled={closing}
                className="btn btn-ghost btn-xs font-mono"
                aria-label={t.close}
              >
                ✕ esc
              </button>
            </div>
          </header>

          <p className="mb-5 flex gap-2 text-sm leading-relaxed text-base-content/80">
            <span aria-hidden="true" className="shrink-0 text-primary">
              {identity.firstName.toLowerCase()} &gt;
            </span>
            <TypedLine
              key={shown.command?.id ?? shown.query}
              text={L(shown.command ? replies[shown.command.id] : unknownReply)}
            />
          </p>

          {shown.command ? (
            <SectionBody id={shown.command.id} onRun={onRun} />
          ) : (
            <UnknownSection onRun={onRun} />
          )}
        </div>
      )}
    </section>
  )
}
