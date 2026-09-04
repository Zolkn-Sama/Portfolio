import type { Localized } from './profile'

/**
 * Descriptions rédigées à la main pour les dépôts GitHub.
 *
 * L'API ne renvoie pas de description pour ces dépôts ; plutôt que d'afficher
 * des cartes vides, on complète ici. Si une description est un jour ajoutée
 * sur GitHub, elle a la priorité — cette table n'est qu'un repli.
 */
export const repoDescriptions: Record<string, Localized> = {
  Lodestone: {
    fr: 'Assistant de connaissances auto-hébergeable en Rust : la documentation interne d’une organisation devient interrogeable en langage naturel, chaque réponse citant ses sources.',
    en: 'Self-hostable knowledge assistant in Rust: an organisation’s internal documentation becomes queryable in natural language, every answer citing its sources.',
  },
  'm1-s2-web-projet': {
    fr: 'Sport Flow, réseau social de suivi sportif en Spring Boot, déployé en production, avec une chaîne CI/CD complète (SonarQube, JaCoCo, GHCR, GitHub Pages).',
    en: 'Sport Flow, a fitness tracking social network in Spring Boot, deployed to production, with a full CI/CD pipeline (SonarQube, JaCoCo, GHCR, GitHub Pages).',
  },
  'm1-s2-indu': {
    fr: 'Industrialisation du développement logiciel : projet Java / Maven à six, centré sur la quality gate SonarQube, la couverture et un workflow Git strict.',
    en: 'Industrialising software development: a six-person Java / Maven project centred on the SonarQube quality gate, coverage and a strict Git workflow.',
  },
  'API-Tesla-main': {
    fr: 'API REST ASP.NET Core 6 d’un configurateur de véhicules : 22 contrôleurs en architecture en couches, JWT, Swagger et double suite de tests (base réelle et Moq).',
    en: 'ASP.NET Core 6 REST API for a vehicle configurator: 22 controllers in a layered architecture, JWT, Swagger and a dual test suite (real database and Moq).',
  },
  'SAE4.01-Client_Tesla': {
    fr: 'Client web du configurateur : SPA Vue.js consommant l’API Tesla, du choix du modèle jusqu’au tunnel de commande.',
    en: 'Web client for the configurator: a Vue.js SPA consuming the Tesla API, from model selection through to the checkout funnel.',
  },
  'R6.06-GestionRDV-main': {
    fr: 'MediPlan : gestion de rendez-vous médicaux en trois blocs : API .NET 6, suite de tests et SPA cliente, sur PostgreSQL conteneurisé avec migrations EF Core.',
    en: 'MediPlan: medical appointment management in three blocks: a .NET 6 API, its test suite and a client SPA, on containerised PostgreSQL with EF Core migrations.',
  },
  'm1-Projet_POO': {
    fr: 'Plateforme de location de véhicules entre particuliers : recherche filtrée, contrat, assurance, messagerie et parrainage. Menée à cinq en deux semaines, avec Spring Boot appris en cours de route.',
    en: 'Peer-to-peer vehicle rental platform: filtered search, rental contract, insurance, messaging and referrals. Built by five people in two weeks, learning Spring Boot along the way.',
  },
  'm1-nuit-de-l-info': {
    fr: 'Nuit de l’Info : 24 h de développement à treize sur un monorepo Turbo / Bun, avec un frontend SolidJS, une API Express et MariaDB.',
    en: 'Nuit de l’Info: 24 hours of development with thirteen people on a Turbo / Bun monorepo, with a SolidJS frontend, an Express API and MariaDB.',
  },
  SAE_DEV_GrammaCast: {
    fr: 'Projet de développement en C# mené en équipe pendant le BUT Informatique.',
    en: 'A C# team development project built during the BUT in Computer Science.',
  },
  'Zolkn-Sama': {
    fr: 'Dépôt de profil GitHub : le README affiché sur ma page d’accueil.',
    en: 'GitHub profile repository: the README shown on my landing page.',
  },
}

/**
 * Stack de chaque dépôt, exprimée avec les libellés de `stack.ts` : les logos
 * et les couleurs viennent donc de la même source que la section compétences.
 * Un libellé inconnu retombe sur un monogramme.
 */
export const repoStack: Record<string, string[]> = {
  Lodestone: ['Rust', 'Axum', 'Tokio', 'PostgreSQL', 'pgvector', 'Docker'],
  'm1-s2-web-projet': ['Java', 'Spring Boot', 'PostgreSQL', 'Thymeleaf', 'Docker', 'GitHub Actions', 'SonarQube'],
  'm1-s2-indu': ['Java', 'Maven', 'SonarQube', 'GitHub Actions'],
  'API-Tesla-main': ['C#', '.NET', 'Entity Framework', 'PostgreSQL', 'Swagger / OpenAPI'],
  'SAE4.01-Client_Tesla': ['Vue.js', 'JavaScript'],
  'R6.06-GestionRDV-main': ['C#', '.NET', 'Entity Framework', 'PostgreSQL', 'Docker'],
  'm1-Projet_POO': ['Java', 'Spring Boot', 'Thymeleaf', 'MySQL', 'Swagger / OpenAPI', 'Maven'],
  'm1-nuit-de-l-info': ['JavaScript', 'Node.js', 'Docker'],
  SAE_DEV_GrammaCast: ['C#', '.NET'],
  'Zolkn-Sama': ['Git', 'GitHub'],
}

/**
 * Langage principal des dépôts que l'API GitHub laisse à `null` : elle ne
 * renseigne pas ce champ sur les forks. Les valeurs viennent de l'endpoint
 * `languages` du dépôt d'origine, pas d'une supposition.
 */
export const repoLanguage: Record<string, string> = {
  'm1-s2-web-projet': 'Java',
  'm1-s2-indu': 'Java',
  'm1-nuit-de-l-info': 'JavaScript',
  SAE_DEV_GrammaCast: 'C#',
  'Zolkn-Sama': 'Markdown',
}

/**
 * Ordre d'affichage des dépôts, choisi à la main.
 *
 * Les dépôts cités apparaissent en tête, dans cet ordre. Ceux qui n'y figurent
 * pas suivent, du plus récemment poussé au plus ancien : ajouter un dépôt sur
 * GitHub ne demande donc aucune modification ici. Un nom inconnu est ignoré
 * sans casser l'affichage.
 *
 * Pour changer l'ordre, il suffit de réorganiser ce tableau.
 */
export const repoOrder: string[] = [
  'Lodestone',
  'm1-s2-web-projet',
  'm1-Projet_POO',
  'API-Tesla-main',
  'R6.06-GestionRDV-main',
  'SAE4.01-Client_Tesla',
  'm1-s2-indu',
  'm1-nuit-de-l-info',
  'SAE_DEV_GrammaCast',
  'Zolkn-Sama',
]

const rank = (name: string) => {
  const index = repoOrder.indexOf(name)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

/** Comparateur : ordre choisi d'abord, date de dernier push ensuite. */
export function compareRepos(
  a: { name: string; pushedAt: string },
  b: { name: string; pushedAt: string },
): number {
  const difference = rank(a.name) - rank(b.name)
  return difference !== 0 ? difference : b.pushedAt.localeCompare(a.pushedAt)
}
