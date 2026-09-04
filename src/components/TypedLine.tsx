import { useEffect, useState } from 'react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Ligne écrite caractère par caractère, comme une réponse tapée en direct.
 * `key` doit changer avec le texte pour relancer la frappe.
 */
export function TypedLine({ text, speed = 18 }: { text: string; speed?: number }) {
  const [count, setCount] = useState(() => (reduced() ? text.length : 0))

  useEffect(() => {
    if (reduced()) return
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(id)
          return c
        }
        return c + 1
      })
    }, speed)
    return () => window.clearInterval(id)
  }, [text, speed])

  const done = count >= text.length

  return (
    <span>
      {text.slice(0, count)}
      {!done && (
        <span className="caret text-primary" aria-hidden="true">
          ▍
        </span>
      )}
    </span>
  )
}
