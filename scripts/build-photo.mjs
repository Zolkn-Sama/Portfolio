/**
 * Recadre la photo d'identité depuis un CV du dossier `base/` et l'encode en
 * WebP, en deux largeurs pour le `srcset` de la page d'accueil.
 *
 *   node scripts/build-photo.mjs
 *
 * À relancer si le CV source change. Les fichiers produits sont versionnés :
 * le build de production n'a pas besoin de sharp.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const SOURCE = resolve(root, 'base/CV_LANDRECY_ENZO_TOULOUSE_RUST.png')
const OUT_DIR = resolve(root, 'src/assets')

/** Fenêtre de la photo dans le CV (pixels natifs, image 2245 × 3179). */
const CROP = { left: 133, top: 137, width: 524, height: 495 }

/** La photo est rendue à 160 px CSS au plus : 320 px couvre le 2x, 480 px le 3x. */
const WIDTHS = [160, 320, 480]
const QUALITY = 82

await mkdir(OUT_DIR, { recursive: true })

const cropped = sharp(SOURCE).extract(CROP)

for (const width of WIDTHS) {
  const out = resolve(OUT_DIR, `photo-${width}.webp`)
  const { size } = await cropped
    .clone()
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out)

  console.log(`${out.replace(`${root}/`, '')} — ${width}px, ${(size / 1024).toFixed(1)} Ko`)
}
