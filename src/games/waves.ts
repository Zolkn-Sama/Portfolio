import type { Localized } from '../data/profile'

/** Repère virtuel du jeu — partagé avec le rendu du canvas. */
export const VW = 800
export const VH = 600
export const WAVES = 3
const CX = VW / 2

export type Alien = { x: number; y: number; alive: boolean; row: number }

/**
 * Chaque vague arrive en formation, pas en rectangle.
 *  1. chevron — une pointe qui descend, ailes en retrait ;
 *  2. tenaille — deux losanges qui encadrent une colonne centrale ;
 *  3. croissant — un arc large refermé sur un noyau dense.
 */
export function formation(wave: number): Alien[] {
  const aliens: Alien[] = []
  const add = (x: number, y: number, rank: number) =>
    aliens.push({ x, y, alive: true, row: rank })

  if (wave === 1) {
    for (let rank = 0; rank < 2; rank += 1) {
      for (let i = -5; i <= 5; i += 1) {
        add(CX + i * 58, 80 + rank * 46 + Math.abs(i) * 15, rank)
      }
    }
    return aliens
  }

  if (wave === 2) {
    // Deux losanges (distance de Manhattan ≤ 2) de part et d'autre du centre.
    for (const side of [-1, 1]) {
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          if (Math.abs(dx) + Math.abs(dy) > 2) continue
          add(CX + side * 215 + dx * 54, 150 + dy * 46, Math.abs(dx) + Math.abs(dy))
        }
      }
    }
    for (let i = 0; i < 4; i += 1) add(CX, 78 + i * 46, i % 3)
    return aliens
  }

  // Vague 3 : arc de 15 colonnes, ailes plongeantes, noyau compact au centre.
  for (let i = -7; i <= 7; i += 1) {
    add(CX + i * 46, 74 + (i / 7) ** 2 * 96, 0)
  }
  for (let dy = 0; dy < 3; dy += 1) {
    for (let dx = -1; dx <= 2; dx += 1) {
      add(CX + (dx - 0.5) * 52, 210 + dy * 44, dy + 1)
    }
  }
  return aliens
}

/** Projectiles ennemis simultanés : 2 en vague 1, 4 en vague 2, 8 en vague 3. */
export const enemyShotCap = (wave: number) => 2 ** Math.max(1, Math.min(WAVES, wave))

export const BOSS_HP = 45
export const BOSS_SHOT_CAP = 12

export type WaveIntel = {
  wave: number
  name: Localized
  /** Silhouette de la formation, en trois lignes. */
  sketch: string[]
  count: number
  salvo: number
}

/** Effectifs réels, calculés depuis `formation` — jamais recopiés à la main. */
export const waveIntel: WaveIntel[] = [
  {
    wave: 1,
    name: { fr: 'chevron', en: 'chevron' },
    sketch: ['  ▄▄▄  ', ' ▄   ▄ ', '▄     ▄'],
    count: formation(1).length,
    salvo: enemyShotCap(1),
  },
  {
    wave: 2,
    name: { fr: 'tenaille', en: 'pincer' },
    sketch: [' ▄  ▄  ▄ ', '▄▄▄ ▄ ▄▄▄', ' ▄  ▄  ▄ '],
    count: formation(2).length,
    salvo: enemyShotCap(2),
  },
  {
    wave: 3,
    name: { fr: 'croissant', en: 'crescent' },
    sketch: ['▄▄▄▄▄▄▄', '  ▄▄▄  ', ' ▄   ▄ '],
    count: formation(3).length,
    salvo: enemyShotCap(3),
  },
]
