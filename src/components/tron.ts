/** Pas de la grille — le même que le quadrillage de fond du site. */
export const CELL = 44
/** Cases par seconde. */
export const SPEED = 5.5
/**
 * Probabilité de tourner à chaque intersection. Abaissée avec la vitesse :
 * à 5,5 cases par seconde, une valeur plus haute donnait un tracé nerveux.
 */
export const TURN = 0.15
/** Inactivité requise avant que l'animation ne démarre. */
export const IDLE_MS = 15_000
/**
 * Durée de vie d'une traînée. Elle sert deux fois : à l'affichage, où chaque
 * segment s'efface selon son âge, et à la collision, où une case reste
 * occupée exactement aussi longtemps qu'elle est visible.
 */
export const TRAIL_MS = 1400
/** Temps mort après une collision, avant réapparition ailleurs. */
export const RESPAWN_MS = 800
/** Durée de l'onde de choc dessinée au point d'impact. */
export const BLAST_MS = 450
/** Épaisseur de la traînée, en pixels CSS. */
export const LINE_WIDTH = 1.2

/**
 * Couleur d'une moto. Le canal alpha est gardé à part : chaque segment de
 * traînée est tracé avec sa propre opacité, calculée depuis son âge.
 */
export type Palette = { rgb: string; trail: number; head: number }

/**
 * Deux couleurs par thème — rouge et cyan en sombre, rose et orange en clair —
 * et deux motos de chaque. Les scores sont tenus par couleur, pas par moto.
 */
export const PALETTES: Record<'dark' | 'light', Palette[]> = {
  dark: [
    { rgb: '255, 46, 77', trail: 0.42, head: 0.9 },
    { rgb: '34, 211, 238', trail: 0.42, head: 0.9 },
  ],
  light: [
    { rgb: '219, 39, 119', trail: 0.4, head: 0.85 },
    { rgb: '217, 119, 6', trail: 0.4, head: 0.85 },
  ],
}

/** Motos par couleur. */
export const PER_COLOUR = 2
/** Couleurs en piste. */
export const COLOURS = PALETTES.dark.length
/** Motos en piste. */
export const RIDERS = COLOURS * PER_COLOUR

/** Couleur d'une moto : deux motos consécutives partagent la même. */
export const colourOf = (rider: number) => rider % COLOURS

export const DIRECTIONS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/**
 * Quart de tour à gauche ou à droite. Jamais de demi-tour : une moto Tron ne
 * revient pas sur sa propre traînée.
 */
export function rotate(dx: number, dy: number, turn: 1 | -1): [number, number] {
  return [dy * turn, -dx * turn]
}

/** Clé d'occupation d'une case, pour la détection de collision. */
export const nodeKey = (x: number, y: number) => `${x},${y}`

/** Opacité d'un segment selon son âge : linéaire, jusqu'à zéro exact. */
export function segmentAlpha(ageMs: number, base: number): number {
  return Math.max(0, 1 - ageMs / TRAIL_MS) * base
}
