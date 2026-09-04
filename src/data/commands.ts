import type { Localized } from './profile'

export type SectionId =
  | 'me'
  | 'internship'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'passion'
  | 'github'
  | 'contact'
  | 'cv'
  | 'help'

export type Command = {
  id: SectionId
  glyph: string
  label: Localized
  description: Localized
  /** Mots-clés (fr + en) reconnus par la barre de commande. */
  keywords: string[]
}

export const commands: Command[] = [
  {
    id: 'me',
    glyph: '◐',
    label: { fr: 'me', en: 'me' },
    description: { fr: 'Qui je suis, en deux paragraphes', en: 'Who I am, in two paragraphs' },
    keywords: ['me', 'about', 'a-propos', 'apropos', 'à-propos', 'profil', 'profile', 'bio', 'moi', 'whoami'],
  },
  {
    id: 'internship',
    glyph: '◈',
    label: { fr: 'stage', en: 'internship' },
    description: {
      fr: 'Dates, durée, école et domaine ciblé',
      en: 'Dates, duration, university and target field',
    },
    keywords: [
      'stage', 'stages', 'internship', 'internships', 'recrutement', 'recruit', 'recruiting',
      'disponibilite', 'disponibilité', 'availability', 'convention', 'dates', 'duree', 'durée',
      'mission', 'offre', 'poste', 'hire', 'embaucher', 'embauche',
    ],
  },
  {
    id: 'experience',
    glyph: '▤',
    label: { fr: 'expérience', en: 'experience' },
    description: { fr: 'Stages et expériences en entreprise', en: 'Internships and company experience' },
    keywords: ['experience', 'expérience', 'exp', 'work', 'travail', 'jobs', 'career', 'parcours', 'entreprise', 'professionnel'],
  },
  {
    id: 'projects',
    glyph: '⌘',
    label: { fr: 'projets', en: 'projects' },
    description: { fr: 'Projets personnels et universitaires', en: 'Personal and university projects' },
    keywords: ['projects', 'projets', 'projet', 'project', 'realisations', 'réalisations', 'portfolio', 'work', 'lodestone', 'sportflow', 'mediplan', 'tesla'],
  },
  {
    id: 'skills',
    glyph: '⚙',
    label: { fr: 'compétences', en: 'skills' },
    description: { fr: 'Stack technique et savoir-être', en: 'Technical stack and soft skills' },
    keywords: ['skills', 'competences', 'compétences', 'stack', 'tech', 'techno', 'technologies', 'outils', 'tools', 'langages', 'languages'],
  },
  {
    id: 'education',
    glyph: '◇',
    label: { fr: 'formation', en: 'education' },
    description: { fr: 'Diplômes et cursus', en: 'Degrees and coursework' },
    keywords: ['education', 'formation', 'etudes', 'études', 'diplome', 'diplôme', 'school', 'ecole', 'école', 'university', 'universite', 'université', 'miage', 'but'],
  },
  {
    id: 'passion',
    glyph: '✦',
    label: { fr: 'passion', en: 'passion' },
    description: { fr: 'Ce que je fais en dehors du code', en: 'What I do away from the keyboard' },
    keywords: ['passion', 'passions', 'interests', 'interest', 'interets', 'intérêts', 'hobbies', 'loisirs', 'fun'],
  },
  {
    id: 'contact',
    glyph: '✉',
    label: { fr: 'contact', en: 'contact' },
    description: { fr: 'E-mail, téléphone, GitHub, LinkedIn', en: 'E-mail, phone, GitHub, LinkedIn' },
    keywords: ['contact', 'mail', 'email', 'e-mail', 'phone', 'telephone', 'téléphone', 'linkedin', 'reach', 'joindre'],
  },
  {
    id: 'github',
    glyph: '⑂',
    label: { fr: 'github', en: 'github' },
    description: { fr: 'Mes dépôts publics, en direct', en: 'My public repositories, live' },
    keywords: ['github', 'git', 'repos', 'repo', 'depots', 'dépôts', 'code', 'source', 'open-source'],
  },
  {
    id: 'cv',
    glyph: '⇩',
    label: { fr: 'cv', en: 'resume' },
    description: { fr: 'Télécharger un CV (C#, Java, Rust)', en: 'Download a résumé (C#, Java, Rust)' },
    keywords: ['cv', 'resume', 'résumé', 'curriculum', 'pdf', 'download', 'telecharger', 'télécharger'],
  },
  {
    id: 'help',
    glyph: '?',
    label: { fr: 'aide', en: 'help' },
    description: { fr: 'Lister toutes les commandes', en: 'List every command' },
    keywords: ['help', 'aide', 'commands', 'commandes', 'man', '?', 'ls'],
  },
]

/** Normalise une saisie : minuscules, sans accents ni ponctuation superflue. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9?]+/g, ' ')
    .trim()
}

/** Trouve la commande correspondant à une saisie libre, ou `null`. */
export function resolveCommand(input: string): Command | null {
  const q = normalize(input)
  if (!q) return null

  const score = (cmd: Command) => {
    const own = [cmd.id, cmd.label.fr, cmd.label.en].map(normalize)
    if (own.includes(q)) return 120
    const keys = cmd.keywords.map(normalize)
    if (keys.includes(q)) return 100
    if (keys.some((k) => k.startsWith(q) && q.length >= 2)) return 60
    if (q.length >= 3 && keys.some((k) => k.includes(q))) return 40
    if (q.length >= 4 && q.split(' ').some((w) => w.length >= 4 && keys.some((k) => k.includes(w))))
      return 20
    return 0
  }

  let best: Command | null = null
  let bestScore = 0
  for (const cmd of commands) {
    const s = score(cmd)
    if (s > bestScore) {
      best = cmd
      bestScore = s
    }
  }
  return bestScore > 0 ? best : null
}

/** Commandes proposées en autocomplétion pour une saisie partielle. */
export function suggest(input: string, lang: 'fr' | 'en'): Command[] {
  const q = normalize(input)
  if (!q) return commands
  const matches = commands.filter((cmd) =>
    cmd.keywords.some((k) => normalize(k).includes(q)) ||
    normalize(cmd.label[lang]).includes(q) ||
    normalize(cmd.description[lang]).includes(q),
  )
  return matches.length > 0 ? matches : []
}
