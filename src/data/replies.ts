import type { SectionId } from './commands'
import type { Localized } from './profile'

/**
 * Une ligne écrite à la première personne, affichée sous le titre de chaque
 * section — comme si Enzo répondait lui-même à la commande saisie.
 */
export const replies: Record<SectionId, Localized> = {
  me: {
    fr: 'Ok, je me présente. Version courte, l’essentiel d’abord.',
    en: 'Alright, here’s me. Short version, the essentials first.',
  },
  internship: {
    fr: 'Concrètement : six mois, à partir du 22 mars 2027 au plus tôt. Voici le cadre.',
    en: 'Concretely: six months, starting 22 March 2027 at the earliest. Here’s the frame.',
  },
  experience: {
    fr: 'Deux stages, deux contextes très différents : une mutuelle en France, un groupe de restauration en Suisse.',
    en: 'Two internships, two very different settings: a French mutual insurer, then a Swiss catering group.',
  },
  projects: {
    fr: 'C’est là que passent mes soirées. Chaque projet m’a appris quelque chose de différent.',
    en: 'This is where my evenings go. Each project taught me something different.',
  },
  skills: {
    fr: 'Les langages, frameworks et outils que j’ai déjà utilisés sur un projet réel.',
    en: 'The languages, frameworks and tools I’ve actually used on a real project.',
  },
  education: {
    fr: 'Du bac scientifique au Master, en passant par trois ans à Annecy.',
    en: 'From a science baccalauréat to the Master’s, by way of three years in Annecy.',
  },
  passion: {
    fr: 'Ce qui m’occupe en dehors du travail, classé par domaine.',
    en: 'What keeps me busy outside work, sorted by area.',
  },
  github: {
    fr: 'Tout mon code public est là, récupéré en direct depuis l’API GitHub : ce que tu vois est à jour.',
    en: 'All my public code lives here, pulled live from the GitHub API: what you see is current.',
  },
  contact: {
    fr: 'Le plus rapide, c’est l’e-mail. Je réponds vite, et je suis ouvert à en discuter.',
    en: 'E-mail is fastest. I answer quickly, and I’m happy to talk.',
  },
  cv: {
    fr: 'Six versions : trois langages, deux villes. Prends celle qui correspond à ton poste.',
    en: 'Six versions: three languages, two cities. Take the one that matches your role.',
  },
  help: {
    fr: 'Voilà tout ce que tu peux me demander.',
    en: 'Here’s everything you can ask me.',
  },
}

export const unknownReply: Localized = {
  fr: 'Celle-là, je ne la connais pas. Essaie plutôt l’une de celles-ci :',
  en: 'That one I don’t know. Try one of these instead:',
}
