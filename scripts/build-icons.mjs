/**
 * Extrait les tracés SVG des logos utilisés par la section « compétences »
 * vers `src/data/icons.ts`.
 *
 *   node scripts/build-icons.mjs
 *
 * Le fichier produit est versionné : simple-icons reste une devDependency et
 * rien de la bibliothèque (plus de 3 000 icônes) n'atterrit dans le bundle.
 */
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as icons from 'simple-icons'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Clés simple-icons à embarquer, dans l'ordre d'affichage. */
const SLUGS = [
  'siRust', 'siDotnet', 'siOpenjdk', 'siTypescript', 'siJavascript', 'siPython',
  'siSpringboot', 'siSpringsecurity', 'siTokio', 'siReact', 'siVuedotjs', 'siNextdotjs',
  'siNodedotjs', 'siThymeleaf', 'siTailwindcss',
  'siPostgresql', 'siMysql',
  'siDocker', 'siGit', 'siGithub', 'siGithubactions', 'siGitlab', 'siApachemaven',
  'siSonarqubeserver', 'siSwagger', 'siOllama',
]

const entries = SLUGS.map((key) => {
  const icon = icons[key]
  if (!icon) throw new Error(`icône introuvable : ${key}`)
  return [key, { title: icon.title, hex: `#${icon.hex}`, path: icon.path }]
})

const body = `/**
 * Généré par \`scripts/build-icons.mjs\` — ne pas modifier à la main.
 * Source : simple-icons ${JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(resolve(root, 'node_modules/simple-icons/package.json'), 'utf8'))).version}
 */

export type Icon = { title: string; hex: string; path: string }

export const icons: Record<string, Icon> = ${JSON.stringify(Object.fromEntries(entries), null, 2)}
`

await writeFile(resolve(root, 'src/data/icons.ts'), body)
console.log(`src/data/icons.ts — ${entries.length} logos`)
