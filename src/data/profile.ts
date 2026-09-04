/**
 * Contenu du portfolio, issu des CV du dossier `base/`.
 * Chaque champ traduisible est un couple { fr, en }.
 */

export type Localized = { fr: string; en: string }
export type LocalizedList = { fr: string[]; en: string[] }

export const identity = {
  firstName: 'Enzo',
  lastName: 'Landrecy',
  role: {
    fr: 'Développeur backend · Étudiant en Master MIAGE',
    en: 'Backend developer · MIAGE Master’s student',
  } satisfies Localized,
  pitch: {
    fr: 'Je conçois des API et des applications full-stack en C# / .NET, Java / Spring Boot et Rust.',
    en: 'I build APIs and full-stack applications in C# / .NET, Java / Spring Boot and Rust.',
  } satisfies Localized,
  intro: {
    fr: [
      'Étudiant en Master MIAGE à l’Université Toulouse 1 Capitole, orienté backend et architecture logicielle. Je travaille surtout sur des API, des bases de données et l’industrialisation qui va avec : tests, intégration continue, qualité de code.',
      'En ce moment je construis Lodestone, un assistant de connaissances auto-hébergeable écrit en Rust : les employés interrogent la documentation de leur organisation en langage naturel, et chaque réponse cite ses sources. C’est mon projet de fond : conception produit, architecture backend, et une exigence forte sur la qualité.',
      'À côté, je suis à l’aise sur l’écosystème .NET, Java et SQL, ainsi que sur le web moderne. Je cherche un stage backend où la rigueur technique compte autant que la fonctionnalité livrée.',
    ],
    en: [
      'MIAGE Master’s student at Toulouse 1 Capitole University, focused on backend work and software architecture. I mostly build APIs, databases and the engineering around them: tests, continuous integration, code quality.',
      'Right now I’m building Lodestone, a self-hostable knowledge assistant written in Rust: employees query their organisation’s documentation in natural language, and every answer cites its sources. It’s my long-haul project: product design, backend architecture, and a high bar on quality.',
      'Alongside that I’m comfortable across the .NET, Java and SQL ecosystems, and on the modern web. I’m looking for a backend internship where technical rigour counts as much as shipped features.',
    ],
  } satisfies LocalizedList,
  headline: {
    fr: 'Développeur backend · Rust · C# / .NET · Java / Spring Boot',
    en: 'Backend developer · Rust · C# / .NET · Java / Spring Boot',
  } satisfies Localized,
  location: { fr: 'Toulouse, France', en: 'Toulouse, France' } satisfies Localized,
  status: {
    fr: 'Disponible pour un stage',
    en: 'Available for an internship',
  } satisfies Localized,
  availability: {
    fr: 'Toulouse, Genève et le bassin lémanique jusqu’à Lausanne, en remote comme sur site.',
    en: 'Toulouse, Geneva and the Lake Geneva region up to Lausanne, remote or on site.',
  } satisfies Localized,
}

export const contact = {
  email: 'enzo.landrecy@gmail.com',
  phone: '+33 7 68 19 16 17',
  github: 'https://github.com/Zolkn-Sama',
  githubLabel: 'github.com/Zolkn-Sama',
  githubUser: 'Zolkn-Sama',
  linkedin: 'https://www.linkedin.com/in/enzo-landrecy',
  linkedinLabel: 'linkedin.com/in/enzo-landrecy',
  addresses: [
    { fr: 'Toulouse, France', en: 'Toulouse, France' },
    {
      fr: 'St-Genis-Pouilly, France (à 10 min de Genève, Suisse)',
      en: 'St-Genis-Pouilly, France (10 min from Geneva, Switzerland)',
    },
  ] satisfies Localized[],
}

export const about: LocalizedList = {
  fr: [
    'Curieux, rigoureux et motivé, j’aime apprendre en continu, découvrir de nouveaux environnements de travail et développer de nouvelles compétences, qu’elles soient techniques, fonctionnelles ou liées à un nouveau domaine métier.',
    'Investi dans ce que j’entreprends, je souhaite m’impliquer pleinement au sein d’une équipe, relever de nouveaux défis et apporter une contribution concrète aux projets qui me seront confiés.',
  ],
  en: [
    'Curious, rigorous and driven, I enjoy continuous learning, discovering new working environments and building new skills, whether technical, functional, or tied to an unfamiliar business domain.',
    'Fully invested in what I take on, I want to contribute within a team, take on new challenges and make a concrete impact on the projects entrusted to me.',
  ],
}

export type EntryLink = { label: Localized; href: string }

export type Entry = {
  org: string
  place: Localized
  period: string
  title: Localized
  summary: Localized
  bullets?: LocalizedList
  stack?: string[]
  links?: EntryLink[]
}

const CODE: Localized = { fr: 'Code source', en: 'Source code' }
const DEMO: Localized = { fr: 'Démo en ligne', en: 'Live demo' }
const DOCS: Localized = { fr: 'Documentation', en: 'Documentation' }

export const experience: Entry[] = [
  {
    org: 'Groupe-Entis',
    place: { fr: 'Cran-Gevrier, France', en: 'Cran-Gevrier, France' },
    period: '2024',
    title: { fr: 'Stage : application comptable', en: 'Internship: accounting application' },
    summary: {
      fr: 'Développement d’une solution de reporting financier pour la consolidation des comptes d’une mutuelle, en environnement C#, avec mise en place d’une base de données, d’une API REST et d’un frontend en Blazor.',
      en: 'Built a financial reporting solution to consolidate the accounts of a mutual insurance company in a C# environment, including the database, a REST API and a Blazor frontend.',
    },
    stack: ['C#', '.NET', 'Blazor', 'REST API', 'SQL'],
  },
  {
    org: 'ELDORA',
    place: { fr: 'Rolle, Suisse', en: 'Rolle, Switzerland' },
    period: '2023',
    title: { fr: 'Stage : marketplace interne', en: 'Internship: internal marketplace' },
    summary: {
      fr: 'Développement d’une marketplace pour les restaurants et partenaires de l’entreprise, en React et SPFx, avec connexion à l’API Graph Explorer de Microsoft Azure.',
      en: 'Built a marketplace for the company’s restaurants and partners in React and SPFx, connected to the Microsoft Azure Graph Explorer API.',
    },
    stack: ['React', 'SPFx', 'Microsoft Graph', 'Azure'],
  },
]

export const projects: Entry[] = [
  {
    org: 'Lodestone',
    place: { fr: 'Projet personnel', en: 'Personal project' },
    period: '2026',
    title: {
      fr: 'Assistant de connaissances souverain, interrogeable en langage naturel',
      en: 'Self-hostable knowledge assistant, queryable in natural language',
    },
    summary: {
      fr: 'Conception et développement en solo d’une application Rust qui transforme la documentation interne éparse d’une organisation (procédures, comptes-rendus, documentation technique, contrats) en une mémoire d’entreprise interrogeable. Chaque réponse cite les fragments qui l’ont produite, avec leur score de similarité : le résultat reste vérifiable.',
      en: 'Solo design and development of a Rust application turning an organisation’s scattered internal documentation (procedures, meeting notes, technical docs, contracts) into a queryable company memory. Every answer cites the fragments that produced it, with their similarity score: the result stays verifiable.',
    },
    bullets: {
      fr: [
        'Backend Rust + Axum + Tokio, organisé en workspace Cargo multi-crates : toute la logique pure (crypto, découpage, client LLM) sort en library crates testables hors-ligne, le binaire ne garde que la glu web.',
        'Persistance PostgreSQL + pgvector via SeaORM : une seule base pour le relationnel et les vecteurs, donc zéro infrastructure supplémentaire.',
        'IA branchée sur Ollama derrière une API OpenAI-compatible : un unique client Rust derrière un trait `LlmClient`, basculer local ↔ cloud tient dans une variable d’environnement.',
        'Multi-tenant en schéma partagé, l’isolation étant garantie par un filtrage systématique sur `org_id` jusque dans la recherche vectorielle.',
        'RBAC porté par les extracteurs Axum (`AuthUser`, `OrgMember { role }`) : l’autorisation vit à la frontière HTTP plutôt qu’éparpillée dans les handlers.',
        'Qualité non négociable : `clippy -D warnings`, aucun `.unwrap()` en handler, tests d’intégration sur un Postgres + pgvector jetable (testcontainers) avec le LLM mocké derrière son trait.',
        'Frontend Next.js + Shadcn/ui + Tailwind : SSR pour les pages publiques, WebSocket pour le chat en temps réel, streaming token par token.',
      ],
      en: [
        'Rust + Axum + Tokio backend organised as a multi-crate Cargo workspace: all pure logic (crypto, chunking, LLM client) lives in library crates testable offline, the binary keeps only the web glue.',
        'PostgreSQL + pgvector persistence through SeaORM: a single database for both relational data and vectors, so no extra infrastructure.',
        'AI wired to Ollama behind an OpenAI-compatible API: one Rust client behind an `LlmClient` trait, so switching local ↔ cloud is one environment variable.',
        'Shared-schema multi-tenancy, isolation guaranteed by systematic `org_id` filtering all the way into vector search.',
        'RBAC carried by Axum extractors (`AuthUser`, `OrgMember { role }`): authorisation lives at the HTTP boundary rather than scattered across handlers.',
        'Non-negotiable quality: `clippy -D warnings`, no `.unwrap()` in handlers, integration tests against a throwaway Postgres + pgvector (testcontainers) with the LLM mocked behind its trait.',
        'Next.js + Shadcn/ui + Tailwind frontend: SSR for public pages, WebSocket for real-time chat, token-by-token streaming.',
      ],
    },
    stack: ['Rust', 'Axum', 'Tokio', 'SeaORM', 'PostgreSQL + pgvector', 'Ollama', 'Next.js', 'Docker', 'testcontainers'],
    links: [{ label: CODE, href: 'https://github.com/Zolkn-Sama/Lodestone' }],
  },
  {
    org: 'Sport Flow',
    place: { fr: 'Master MIAGE (équipe de 4)', en: 'MIAGE Master’s (team of 4)' },
    period: '2026',
    title: {
      fr: 'Réseau social de suivi sportif, déployé en production',
      en: 'Fitness tracking social network, deployed to production',
    },
    summary: {
      fr: 'Application web full-stack de suivi des performances sportives : chaque utilisateur enregistre ses activités, suit ses progrès dans le temps et se mesure à une communauté à travers des défis. C’est le projet où la chaîne de livraison est allée le plus loin, du commit jusqu’au déploiement.',
      en: 'Full-stack web application for tracking athletic performance: users log activities, follow their progress over time and measure up against a community through challenges. The project where the delivery pipeline went furthest, from commit to deployment.',
    },
    bullets: {
      fr: [
        'Backend Java / Spring Boot (Spring Web, Spring Data JPA, Spring Security) exposant une API REST documentée avec Swagger / OpenAPI, sur PostgreSQL.',
        'CI/CD complète sous GitHub Actions : analyse SonarQube, couverture JaCoCo, publication de l’image sur GHCR, Javadoc et Swagger UI déployés automatiquement sur GitHub Pages.',
        'Frontend rendu côté serveur en Thymeleaf + Tailwind CSS & DaisyUI : profils, gestion des activités, dashboard personnel de progression.',
        'Fonctionnalités sociales : système d’amis, fil d’activités, commentaires et réactions.',
        'Gamification : défis communautaires à durée de validité, classement des participants, badges de progression.',
        'Automatisations métier : calcul des calories dépensées par activité, conditions météo récupérées via l’API Open-Meteo.',
      ],
      en: [
        'Java / Spring Boot backend (Spring Web, Spring Data JPA, Spring Security) exposing a REST API documented with Swagger / OpenAPI, on PostgreSQL.',
        'Full CI/CD on GitHub Actions: SonarQube analysis, JaCoCo coverage, image published to GHCR, Javadoc and Swagger UI automatically deployed to GitHub Pages.',
        'Server-rendered Thymeleaf + Tailwind CSS & DaisyUI frontend: profiles, activity management, personal progress dashboard.',
        'Social features: friend system, activity feed, comments and reactions.',
        'Gamification: time-boxed community challenges, participant leaderboards, progression badges.',
        'Business automation: calories burned computed per activity, weather conditions fetched from the Open-Meteo API.',
      ],
    },
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'Thymeleaf', 'Tailwind / DaisyUI', 'Docker', 'GitHub Actions', 'SonarQube', 'JaCoCo'],
    links: [
      { label: CODE, href: 'https://github.com/Zolkn-Sama/m1-s2-web-projet' },
      { label: DEMO, href: 'https://sportflow.linv.dev' },
    ],
  },
  {
    org: 'm1-s2-indu',
    place: { fr: 'Master MIAGE (équipe de 6)', en: 'MIAGE Master’s (team of 6)' },
    period: '2026',
    title: {
      fr: 'Industrialisation du développement logiciel',
      en: 'Industrialising the software development process',
    },
    summary: {
      fr: 'Projet Java / Maven centré non pas sur la fonctionnalité mais sur la chaîne de production logicielle elle-même. C’est celui qui m’a formé aux réflexes que j’applique partout depuis : la CI décide, pas les habitudes.',
      en: 'A Java / Maven project centred not on the feature but on the software production chain itself. The one that taught me the reflexes I apply everywhere since: CI decides, not habit.',
    },
    bullets: {
      fr: [
        'Quality gate SonarQube et mesure de couverture imposées à chaque contribution.',
        'Javadoc générée et publiée automatiquement.',
        'Workflow Git strict : branche dédiée → pull request → revue → aucun merge sans consentement.',
      ],
      en: [
        'SonarQube quality gate and coverage measurement enforced on every contribution.',
        'Javadoc generated and published automatically.',
        'Strict Git workflow: dedicated branch → pull request → review → no merge without consent.',
      ],
    },
    stack: ['Java', 'Maven', 'SonarQube', 'GitHub Actions'],
    links: [
      { label: CODE, href: 'https://github.com/Zolkn-Sama/m1-s2-indu' },
      { label: DOCS, href: 'https://linventif.github.io/m1-s2-indu' },
    ],
  },
  {
    org: 'MediPlan',
    place: { fr: 'IUT Annecy (projet universitaire)', en: 'IUT Annecy (university project)' },
    period: '2023',
    title: {
      fr: 'Gestion de rendez-vous pour cabinet médical',
      en: 'Appointment management for a medical practice',
    },
    summary: {
      fr: 'Application de prise et de suivi de rendez-vous médicaux, construite en trois blocs séparés : une API .NET 6, sa suite de tests et une SPA cliente. Le dépôt embarque aussi une base `legacy/`, ce qui en fait autant un exercice de reprise d’existant que de développement neuf.',
      en: 'An application for booking and tracking medical appointments, built as three separate blocks: a .NET 6 API, its test suite and a client SPA. The repository also carries a `legacy/` database, making it as much a brownfield exercise as a greenfield one.',
    },
    bullets: {
      fr: [
        'API REST en C# / .NET 6, persistance PostgreSQL conteneurisée via Docker Compose, migrations Entity Framework Core versionnées.',
        'Authentification JWT, avec les secrets sortis du code par `dotnet user-secrets`.',
        'Modèle conceptuel de données modélisé en PlantUML, versionné avec le code.',
        'SPA cliente consommant l’API, développée séparément du backend.',
        'Suite de tests dédiée sur l’API.',
      ],
      en: [
        'C# / .NET 6 REST API, PostgreSQL persistence containerised with Docker Compose, versioned Entity Framework Core migrations.',
        'JWT authentication, with secrets kept out of the code via `dotnet user-secrets`.',
        'Conceptual data model written in PlantUML and versioned alongside the code.',
        'Client SPA consuming the API, developed separately from the backend.',
        'Dedicated test suite covering the API.',
      ],
    },
    stack: ['C#', '.NET 6', 'Entity Framework Core', 'PostgreSQL', 'JWT', 'PlantUML', 'Docker Compose'],
    links: [{ label: CODE, href: 'https://github.com/Zolkn-Sama/R6.06-GestionRDV-main' }],
  },
  {
    org: 'SAÉ 4.01 · Configurateur Tesla',
    place: { fr: 'IUT Annecy (API + client)', en: 'IUT Annecy (API + client)' },
    period: '2023',
    title: {
      fr: 'Configurateur de véhicules et tunnel de commande',
      en: 'Vehicle configurator and checkout funnel',
    },
    summary: {
      fr: 'Projet full-stack en deux dépôts : un configurateur type Tesla couvrant le catalogue (modèles, motorisations, variantes, options, accessoires) jusqu’au tunnel de commande, comptes clients et moyens de paiement inclus.',
      en: 'A two-repository full-stack project: a Tesla-style configurator covering the catalogue (models, powertrains, variants, options, accessories) through to the checkout funnel, customer accounts and payment methods included.',
    },
    bullets: {
      fr: [
        'API REST ASP.NET Core 6 sur EF Core + PostgreSQL, en architecture en couches avec inversion de dépendance : les 22 contrôleurs ne connaissent jamais le `DbContext`, seulement des interfaces `IDataRepository<T>` injectées au démarrage.',
        'Authentification JWT (HMAC-SHA256, validation stricte émetteur / audience / signature, `ClockSkew` à zéro) avec politiques Admin et User.',
        'Documentation Swagger / OpenAPI générée depuis les annotations `[ProducesResponseType]`.',
        'Chaque contrôleur testé en double, sur base réelle et sur repository mocké (Moq) : c’est précisément ce que l’abstraction repository achète.',
        'Déploiement continu sur Azure App Service via GitHub Actions.',
        'Client web en SPA Vue.js consommant l’API, développé à plusieurs sur une centaine de commits.',
      ],
      en: [
        'ASP.NET Core 6 REST API on EF Core + PostgreSQL, layered architecture with dependency inversion: the 22 controllers never see the `DbContext`, only `IDataRepository<T>` interfaces injected at startup.',
        'JWT authentication (HMAC-SHA256, strict issuer / audience / signature validation, zero `ClockSkew`) with Admin and User policies.',
        'Swagger / OpenAPI documentation generated from `[ProducesResponseType]` annotations.',
        'Every controller tested twice, against a real database and against a mocked repository (Moq): exactly what the repository abstraction buys.',
        'Continuous deployment to Azure App Service via GitHub Actions.',
        'Vue.js SPA client consuming the API, built by several contributors over about a hundred commits.',
      ],
    },
    stack: ['C#', 'ASP.NET Core 6', 'EF Core', 'PostgreSQL', 'JWT', 'Swagger', 'Vue.js', 'Moq', 'Azure'],
    links: [
      { label: { fr: 'API (C#)', en: 'API (C#)' }, href: 'https://github.com/Zolkn-Sama/API-Tesla-main' },
      { label: { fr: 'Client (Vue)', en: 'Client (Vue)' }, href: 'https://github.com/Zolkn-Sama/SAE4.01-Client_Tesla' },
    ],
  },
]

export const education: Entry[] = [
  {
    org: 'Université Toulouse 1 Capitole',
    place: { fr: 'Toulouse, France', en: 'Toulouse, France' },
    period: '2025 – 2027',
    title: { fr: 'Master MIAGE', en: 'MIAGE Master’s degree' },
    summary: {
      fr: 'Méthodes Informatiques Appliquées à la Gestion des Entreprises : une formation à double compétence, qui associe l’ingénierie logicielle à la compréhension des organisations et de leurs processus métier.',
      en: 'Computer Methods Applied to Business Management: a dual-competency programme pairing software engineering with an understanding of organisations and their business processes.',
    },
    bullets: {
      fr: [
        'Ingénierie logicielle : conception orientée objet, architectures applicatives, qualité et industrialisation du développement.',
        'Systèmes d’information : modélisation des données, bases relationnelles, urbanisation du SI.',
        'Conduite de projet : gestion d’équipe, méthodes agiles, relation client et cadrage du besoin.',
        'Travail en équipe sur des projets menés de bout en bout : Sport Flow, déployé en production, et un projet d’industrialisation à six.',
      ],
      en: [
        'Software engineering: object-oriented design, application architecture, quality and development industrialisation.',
        'Information systems: data modelling, relational databases, IS architecture.',
        'Project management: team leadership, agile methods, client relations and requirements framing.',
        'Team projects carried end to end: Sport Flow, deployed to production, and a six-person industrialisation project.',
      ],
    },
  },
  {
    org: 'IUT d’Annecy',
    place: { fr: 'Annecy, France', en: 'Annecy, France' },
    period: '2021 – 2024',
    title: { fr: 'BUT Informatique', en: 'BUT in Computer Science' },
    summary: {
      fr: 'Formation en trois ans, très orientée pratique : le programme est rythmé par des SAÉ, des projets longs menés en équipe qui simulent des commandes réelles, avec livrables et soutenance.',
      en: 'A hands-on three-year programme built around SAÉs, long team projects simulating real client work, with deliverables and an oral defence.',
    },
    bullets: {
      fr: [
        'Développement d’applications : algorithmique, programmation orientée objet, développement web et mobile.',
        'Bases de données : modélisation conceptuelle, SQL, administration et optimisation.',
        'Réseaux, systèmes et virtualisation ; bases de la gestion de projet et de la communication professionnelle.',
        'Projets marquants : MediPlan (gestion de rendez-vous médicaux) et la SAÉ 4.01, un configurateur de véhicules avec API .NET et client Vue.',
      ],
      en: [
        'Application development: algorithms, object-oriented programming, web and mobile development.',
        'Databases: conceptual modelling, SQL, administration and optimisation.',
        'Networks, systems and virtualisation; fundamentals of project management and professional communication.',
        'Notable projects: MediPlan (medical appointment management) and SAÉ 4.01, a vehicle configurator with a .NET API and a Vue client.',
      ],
    },
  },
  {
    org: 'Baccalauréat général',
    place: { fr: 'France', en: 'France' },
    period: '2021',
    title: {
      fr: 'Spécialités Mathématiques, NSI et Physique-Chimie, mention Bien',
      en: 'Mathematics, Computer Science (NSI) and Physics-Chemistry, with honours',
    },
    summary: {
      fr: 'Trois spécialités scientifiques, dont Numérique et Sciences Informatiques : c’est là que j’ai écrit mes premières lignes de code et décidé de continuer dans cette voie.',
      en: 'Three science specialisms, including Digital and Computer Science: where I wrote my first lines of code and decided to keep going.',
    },
  },
]

export const skills = {
  professional: {
    fr: [
      'Résolution de problèmes complexes',
      'Bon esprit d’équipe',
      'Communication claire et efficace',
      'Bonne capacité d’adaptation',
      'Organisation et gestion des priorités',
      'Veille technologique',
    ],
    en: [
      'Complex problem solving',
      'Team player',
      'Clear and effective communication',
      'Strong adaptability',
      'Organisation and priority management',
      'Technology watch',
    ],
  } satisfies LocalizedList,
}

export type InterestGroup = { title: Localized; items: LocalizedList }

/** Centres d'intérêt regroupés par domaine, plutôt qu'en liste indistincte. */
export const interests: InterestGroup[] = [
  {
    title: { fr: 'Sport', en: 'Sport' },
    items: {
      fr: ['Musculation', 'Calisthénie', 'Natation', 'Escalade', 'Basket'],
      en: ['Weight training', 'Calisthenics', 'Swimming', 'Climbing', 'Basketball'],
    },
  },
  {
    title: { fr: 'Mécanique', en: 'Machines' },
    items: { fr: ['Moto'], en: ['Motorcycling'] },
  },
  {
    title: { fr: 'Jeux', en: 'Games' },
    items: {
      fr: ['Jeux de société', 'Jeux de stratégie', 'Jeux vidéo'],
      en: ['Board games', 'Strategy games', 'Video games'],
    },
  },
  {
    title: { fr: 'Technique & sécurité', en: 'Tech & security' },
    items: {
      fr: ['Développement', 'Cybersécurité'],
      en: ['Software development', 'Cybersecurity'],
    },
  },
  {
    title: { fr: 'Lecture & entreprise', en: 'Reading & business' },
    items: {
      fr: ['Économie', 'Entreprenariat', 'Livres'],
      en: ['Economics', 'Entrepreneurship', 'Books'],
    },
  },
]

/** Conditions du stage recherché — affichées par la section `stage`. */
export const internship = {
  start: {
    fr: 'Au plus tôt le 22 mars 2027',
    en: 'From 22 March 2027 at the earliest',
  } satisfies Localized,
  startDate: '2027-03-22',
  duration: { fr: '6 mois', en: '6 months' } satisfies Localized,
  end: { fr: 'jusqu’à fin septembre 2027', en: 'through to late September 2027' } satisfies Localized,
  school: {
    name: 'Université Toulouse 1 Capitole',
    program: {
      fr: 'Master 2 MIAGE : méthodes informatiques appliquées à la gestion des entreprises',
      en: 'MIAGE Master’s, second year: computer methods applied to business management',
    } satisfies Localized,
    note: {
      fr: 'Convention de stage fournie par l’établissement ; stage de fin d’études validant le diplôme.',
      en: 'Internship agreement provided by the university; final-year placement counting towards the degree.',
    } satisfies Localized,
    url: 'https://www.ut-capitole.fr',
  },
  target: {
    fr: [
      'Développement backend : conception et implémentation d’API REST, du modèle de données jusqu’à la mise en production.',
      'Architecture logicielle : découpage en couches, inversion de dépendance, code testable et maintenable dans la durée.',
      'Écosystèmes C# / .NET et Java / Spring Boot, complétés par Rust, que j’apprends en autodidacte.',
      'Données : modélisation, PostgreSQL, qualité et performance des requêtes.',
      'Industrialisation : tests automatisés, intégration continue, qualité de code, conteneurisation.',
    ],
    en: [
      'Backend development: designing and implementing REST APIs, from the data model through to production.',
      'Software architecture: layered design, dependency inversion, code that stays testable and maintainable.',
      'The C# / .NET and Java / Spring Boot ecosystems, rounded out by Rust, which I’m teaching myself.',
      'Data: modelling, PostgreSQL, query quality and performance.',
      'Engineering practice: automated testing, continuous integration, code quality, containerisation.',
    ],
  } satisfies LocalizedList,
  mode: {
    fr: 'Sur site ou en remote.',
    en: 'On site or remote.',
  } satisfies Localized,
}

export type CvFile = {
  file: string
  track: Localized
  city: Localized
}

export const cvFiles: CvFile[] = [
  {
    file: 'CV_LANDRECY_ENZO_TOULOUSE_CSHARP.png',
    track: { fr: 'Backend C#', en: 'C# backend' },
    city: { fr: 'Toulouse', en: 'Toulouse' },
  },
  {
    file: 'CV_LANDRECY_ENZO_TOULOUSE_JAVA.png',
    track: { fr: 'Backend Java', en: 'Java backend' },
    city: { fr: 'Toulouse', en: 'Toulouse' },
  },
  {
    file: 'CV_LANDRECY_ENZO_TOULOUSE_RUST.png',
    track: { fr: 'Backend Rust', en: 'Rust backend' },
    city: { fr: 'Toulouse', en: 'Toulouse' },
  },
  {
    file: 'CV_LANDRECY_ENZO_ANNECY_CSHARP.png',
    track: { fr: 'Backend C#', en: 'C# backend' },
    city: { fr: 'Annecy', en: 'Annecy' },
  },
  {
    file: 'CV_LANDRECY_ENZO_ANNECY_JAVA.png',
    track: { fr: 'Backend Java', en: 'Java backend' },
    city: { fr: 'Annecy', en: 'Annecy' },
  },
  {
    file: 'CV_LANDRECY_ENZO_ANNECY_RUST.png',
    track: { fr: 'Backend Rust', en: 'Rust backend' },
    city: { fr: 'Annecy', en: 'Annecy' },
  },
]
