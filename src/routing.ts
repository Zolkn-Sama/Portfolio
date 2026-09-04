import { normalize, resolveCommand, type Command, type SectionId } from './data/commands'
import { GAME_IDS, type GameId } from './games/types'
import type { Lang } from './i18n/dict'

/**
 * Routage par fragment d’URL : `#/projects`, `#/contact`…
 * Le fragment est choisi plutôt qu’un chemin réel pour que les liens
 * profonds fonctionnent sur n’importe quel hébergement statique.
 * La langue voyage à part, dans `?lang=`, pour rester valable sur toutes
 * les sections.
 */

/** Slug présent dans l’URL, ou `null` si le fragment est vide. */
export function readSlug(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '').trim()
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** Commande désignée par l’URL courante, ou `null`. */
export function readCommand(): Command | null {
  const slug = readSlug()
  if (!slug || slug.startsWith('play/')) return null
  return resolveCommand(slug)
}

/**
 * Slug canonique d’une requête : l’identifiant de section quand elle est
 * reconnue (`projets` → `projects`), sinon la requête normalisée — ce qui
 * garde partageable même un lien vers une commande inconnue.
 */
export function slugFor(query: string): string {
  const command = resolveCommand(query)
  return command ? command.id : normalize(query).replace(/\s+/g, '-')
}

/** Jeu désigné par l'URL (`#/play/invaders`), ou `null`. */
export function readGame(): GameId | null {
  const slug = readSlug()
  const id = slug?.startsWith('play/') ? slug.slice(5) : null
  return GAME_IDS.find((game) => game === id) ?? null
}

/** Lien profond vers un mini-jeu, utilisable dans un `href`. */
export function gameHref(id: GameId): string {
  return `#/play/${id}`
}

/** Lien profond vers une section, utilisable dans un `href`. */
export function sectionHref(id: SectionId): string {
  return `#/${id}`
}

/** Empile une entrée d’historique — le bouton « précédent » revient en arrière. */
export function pushRoute(slug: string | null): void {
  const url = new URL(window.location.href)
  url.hash = slug ? `/${slug}` : ''
  if (url.href !== window.location.href) {
    window.history.pushState(null, '', url)
  }
}

/** Langue demandée par l’URL (`?lang=fr`), ou `null`. */
export function readLangParam(): Lang | null {
  const value = new URLSearchParams(window.location.search).get('lang')
  return value === 'fr' || value === 'en' ? value : null
}

/** Inscrit la langue dans l’URL sans toucher au fragment ni à l’historique. */
export function writeLangParam(lang: Lang): void {
  const url = new URL(window.location.href)
  url.searchParams.set('lang', lang)
  if (url.href !== window.location.href) {
    window.history.replaceState(null, '', url)
  }
}
