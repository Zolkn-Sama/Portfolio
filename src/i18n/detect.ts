import type { Lang } from './dict'

export const SUPPORTED: Lang[] = ['fr', 'en']

/**
 * Première langue prise en charge dans l'ordre de préférence du navigateur.
 *
 * `navigator.languages` est parcouru en entier, et non seulement
 * `navigator.language` : un visiteur réglé sur `['de-DE', 'fr-FR', 'en']`
 * obtient le français, sa deuxième préférence, plutôt que le repli anglais.
 */
export function preferredLang(languages: readonly string[]): Lang {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0]
    const match = SUPPORTED.find((lang) => lang === base)
    if (match) return match
  }
  return 'en'
}

/** Langues déclarées par le navigateur, `navigator.language` en dernier recours. */
export function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  return navigator.languages?.length ? navigator.languages : [navigator.language]
}
