import type { GameId } from './types'

/**
 * Classement en deux couches.
 *
 * 1. `public/leaderboard.json`, livré avec le site : ce tableau est le même
 *    pour tous les visiteurs. Il fait référence.
 * 2. Le `localStorage` du visiteur : ses propres parties, visibles de lui seul.
 *
 * Les deux sont fusionnés à l'affichage. Sans serveur, un score joué par un
 * visiteur ne peut pas rejoindre le fichier partagé — voir `writeToProject`,
 * qui n'existe qu'en développement.
 */
export type Score = {
  name: string
  score: number
  at: number
  /** Détail affiché à côté du score (vague atteinte, intégrité restante…). */
  detail: string
}

/** Un score prêt à l'affichage : `mine` distingue les parties du visiteur. */
export type Entry = Score & { mine: boolean }

const KEY = (game: GameId) => `portfolio.scores.${game}`
const NAME_KEY = 'portfolio.player'
const MAX = 10

function parseScores(value: unknown): Score[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is Score =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as Score).name === 'string' &&
      typeof (entry as Score).score === 'number' &&
      typeof (entry as Score).detail === 'string',
  )
}

/* ── Couche 1 : le fichier du projet ─────────────────────────────────────── */

let shared: Promise<Record<string, Score[]>> | null = null

export function loadShared(): Promise<Record<string, Score[]>> {
  shared ??= fetch(`${import.meta.env.BASE_URL}leaderboard.json`, { cache: 'no-cache' })
    .then((response) => (response.ok ? response.json() : {}))
    .then((data: unknown) => {
      if (typeof data !== 'object' || data === null) return {}
      return Object.fromEntries(
        Object.entries(data as Record<string, unknown>).map(([game, value]) => [
          game,
          parseScores(value),
        ]),
      )
    })
    .catch(() => ({}))
  return shared
}

/* ── Couche 2 : le navigateur du visiteur ────────────────────────────────── */

export function readLocal(game: GameId): Score[] {
  try {
    return parseScores(JSON.parse(localStorage.getItem(KEY(game)) ?? 'null'))
  } catch {
    return []
  }
}

export function addScore(game: GameId, entry: Score): void {
  const next = [...readLocal(game), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX)
  localStorage.setItem(KEY(game), JSON.stringify(next))
  void writeToProject(game, entry)
}

/**
 * En développement seulement : renvoie le score au serveur Vite, qui l'écrit
 * dans `public/leaderboard.json`. C'est ainsi qu'on remplit le tableau de
 * référence — on joue, puis on versionne le fichier. En production, la route
 * n'existe pas et l'appel est simplement ignoré.
 */
async function writeToProject(game: GameId, entry: Score): Promise<void> {
  if (!import.meta.env.DEV) return
  try {
    await fetch('/__leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, entry }),
    })
    shared = null // le fichier a changé : forcer une relecture
  } catch {
    // Le tableau local suffit : rien à signaler au joueur.
  }
}

/* ── Fusion ──────────────────────────────────────────────────────────────── */

export async function readLeaderboard(game: GameId): Promise<Entry[]> {
  const file = (await loadShared())[game] ?? []
  const mine = readLocal(game)
  const isMine = (entry: Score) =>
    mine.some((own) => own.at === entry.at && own.score === entry.score)

  return [
    ...file.map((entry) => ({ ...entry, mine: isMine(entry) })),
    ...mine.filter((own) => !file.some((entry) => entry.at === own.at)).map((own) => ({
      ...own,
      mine: true,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX)
}

export function readPlayerName(): string {
  return (localStorage.getItem(NAME_KEY) ?? '').slice(0, 3).toUpperCase()
}

export function writePlayerName(name: string): void {
  localStorage.setItem(NAME_KEY, name.slice(0, 3).toUpperCase())
}
