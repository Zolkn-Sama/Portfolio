/**
 * Bruitage des mini-jeux, synthétisé à la volée en Web Audio.
 *
 * Aucun fichier audio n'est téléchargé : tout est généré par oscillateurs, ce
 * qui pèse zéro octet dans le bundle et garde le grain rétro. Le contexte
 * n'est créé qu'au premier geste du visiteur, comme l'exigent les navigateurs.
 */

const STORAGE_KEY = 'portfolio.sound'

let context: AudioContext | null = null
let enabled = true

try {
  enabled = localStorage.getItem(STORAGE_KEY) !== 'off'
} catch {
  enabled = true
}

function audio(): AudioContext | null {
  if (!enabled) return null
  if (context) return context
  try {
    context = new AudioContext()
  } catch {
    context = null
  }
  return context
}

/** À appeler depuis un geste utilisateur : débloque la lecture audio. */
export function unlockAudio(): void {
  const ctx = audio()
  if (ctx?.state === 'suspended') void ctx.resume()
}

export function isSoundEnabled(): boolean {
  return enabled
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // Le réglage ne survivra pas à la session : sans conséquence.
  }
  if (value) unlockAudio()
}

/** Bip : une hauteur qui glisse de `from` à `to`, avec une extinction douce. */
function blip(
  from: number,
  to: number,
  duration: number,
  type: OscillatorType = 'square',
  gain = 0.06,
) {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(from, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), now + duration)

  amp.gain.setValueAtTime(gain, now)
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(amp).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

/** Souffle de bruit blanc filtré — pour les impacts. */
function noise(duration: number, cutoff: number, gain = 0.12) {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  const frames = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, now)

  const amp = ctx.createGain()
  amp.gain.setValueAtTime(gain, now)
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(filter).connect(amp).connect(ctx.destination)
  source.start(now)
}

/** Tir du vaisseau : un bip descendant, court et sec. */
export function playShoot(): void {
  blip(880, 220, 0.09, 'square', 0.05)
}

/** Commande neutralisée : deux notes montantes, franches. */
export function playBlock(): void {
  blip(520, 780, 0.07, 'triangle', 0.07)
  window.setTimeout(() => blip(780, 1180, 0.09, 'triangle', 0.05), 60)
}

/** Dégât subi : impact grave et souffle. */
export function playDamage(): void {
  blip(180, 55, 0.28, 'sawtooth', 0.09)
  noise(0.22, 900, 0.1)
}

/** Vibration matérielle, là où l'appareil la propose. */
export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Certains navigateurs refusent hors geste utilisateur : sans conséquence.
  }
}
