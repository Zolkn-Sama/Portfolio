import { useEffect, useSyncExternalStore } from 'react'
import { compareRepos } from '../data/repos'
import { contact } from '../data/profile'

export type GithubProfile = {
  login: string
  name: string | null
  bio: string | null
  publicRepos: number
  followers: number
  createdAt: string
  avatarUrl: string
}

export type GithubRepo = {
  id: number
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  url: string
  homepage: string | null
  isFork: boolean
  pushedAt: string
}

export type GithubData = { profile: GithubProfile; repos: GithubRepo[] }

export type GithubState =
  /** Rien n'a encore été demandé : aucune requête n'est partie. */
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: GithubData }
  | { status: 'error'; message: string }

const API = 'https://api.github.com'

/**
 * Petit store partagé par la section `github` et le rail latéral.
 *
 * L'appel réseau n'est déclenché que par `useGithub()`, c'est-à-dire quand le
 * visiteur ouvre réellement la section : l'API publique est plafonnée à 60
 * requêtes par heure et par IP, autant ne pas la consommer sur une simple
 * visite de la page d'accueil. Le rail se contente de lire le résultat s'il
 * existe déjà.
 */
let state: GithubState = { status: 'idle' }
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setState(next: GithubState) {
  state = next
  listeners.forEach((listener) => listener())
}

async function fetchGithub(): Promise<GithubData> {
  const headers = { Accept: 'application/vnd.github+json' }
  const [userRes, reposRes] = await Promise.all([
    fetch(`${API}/users/${contact.githubUser}`, { headers }),
    fetch(`${API}/users/${contact.githubUser}/repos?per_page=100&sort=pushed`, { headers }),
  ])

  if (!userRes.ok || !reposRes.ok) {
    const status = userRes.ok ? reposRes.status : userRes.status
    throw new Error(status === 403 ? 'rate-limit' : `http-${status}`)
  }

  const user = await userRes.json()
  const repos = await reposRes.json()

  return {
    profile: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
      createdAt: user.created_at,
      avatarUrl: user.avatar_url,
    },
    repos: (repos as Record<string, never>[])
      .map((repo) => ({
        id: Number(repo.id),
        name: String(repo.name),
        description: (repo.description as string | null) ?? null,
        language: (repo.language as string | null) ?? null,
        stars: Number(repo.stargazers_count),
        forks: Number(repo.forks_count),
        url: String(repo.html_url),
        homepage: (repo.homepage as string | null) || null,
        isFork: Boolean(repo.fork),
        pushedAt: String(repo.pushed_at),
      }))
      .sort(compareRepos),
  }
}

/** Lance la requête au plus une fois ; une erreur passée peut être retentée. */
function load() {
  if (state.status === 'loading' || state.status === 'ready') return
  setState({ status: 'loading' })
  fetchGithub().then(
    (data) => setState({ status: 'ready', data }),
    (error: Error) => setState({ status: 'error', message: error.message }),
  )
}

/** Lit les données GitHub **sans jamais déclencher d'appel réseau**. */
export function useGithubSnapshot(): GithubState {
  return useSyncExternalStore(subscribe, () => state)
}

/** Lit les données GitHub **et déclenche le chargement** au montage. */
export function useGithub(): GithubState {
  const snapshot = useGithubSnapshot()
  useEffect(load, [])
  return snapshot
}

/** Couleur officielle GitHub d’un langage, pour la pastille des dépôts. */
export const languageColor: Record<string, string> = {
  Rust: '#dea584',
  'C#': '#178600',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  Python: '#3572a5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dockerfile: '#384d54',
  Markdown: '#083fa1',
}
