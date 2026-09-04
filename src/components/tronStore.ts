import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'
/** Éliminations infligées et sorties de piste, par couleur. */
export type Duel = { kills: number; self: number }

/**
 * Score des duels, partagé entre l'animation qui le produit et le rail qui
 * l'affiche.
 *
 * Les compteurs sont séparés par thème : les couleurs ne sont pas les mêmes
 * en clair et en sombre, additionner leurs scores n'aurait aucun sens.
 */
export type TronState = {
  active: boolean
  duels: Record<Theme, Duel[]>
}

const blank = (colours: number): Record<Theme, Duel[]> => ({
  dark: Array.from({ length: colours }, () => ({ kills: 0, self: 0 })),
  light: Array.from({ length: colours }, () => ({ kills: 0, self: 0 })),
})

let state: TronState = { active: false, duels: blank(2) }
const listeners = new Set<() => void>()

function emit(next: TronState) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setActive(active: boolean): void {
  if (state.active !== active) emit({ ...state, active })
}

/** Crédite une élimination à une couleur du thème donné. */
export function recordKill(theme: Theme, colour: number): void {
  emit({
    ...state,
    duels: {
      ...state.duels,
      [theme]: state.duels[theme].map((duel, i) =>
        i === colour ? { ...duel, kills: duel.kills + 1 } : duel,
      ),
    },
  })
}

/** Compte une sortie de piste : la moto s'est coupée elle-même. */
export function recordSelf(theme: Theme, colour: number): void {
  emit({
    ...state,
    duels: {
      ...state.duels,
      [theme]: state.duels[theme].map((duel, i) =>
        i === colour ? { ...duel, self: duel.self + 1 } : duel,
      ),
    },
  })
}

/** Instantané courant du store. */
export function getTronState(): TronState {
  return state
}

export function useTronState(): TronState {
  return useSyncExternalStore(subscribe, getTronState)
}
