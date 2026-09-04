import type { Localized } from './profile'

/**
 * Technologies déjà utilisées sur un projet réel — la liste est descriptive,
 * pas une auto-évaluation. `icon` renvoie à `src/data/icons.ts` ; sans icône
 * disponible, `mono` fournit un monogramme et sa couleur.
 */
export type Tech = {
  label: string
  icon?: string
  mono?: string
  color?: string
  /** Marqué « bientôt » : en cours d’apprentissage, pas encore en projet. */
  soon?: boolean
  /** Site officiel de la technologie. */
  href: string
}

export type TechGroup = { title: Localized; items: Tech[] }

export const stack: TechGroup[] = [
  {
    title: { fr: 'Langages', en: 'Languages' },
    items: [
      { label: 'Rust', icon: 'siRust', href: 'https://www.rust-lang.org' },
      { label: 'C#', mono: 'C#', color: '#512BD4', href: 'https://learn.microsoft.com/dotnet/csharp/' },
      { label: 'Java', icon: 'siOpenjdk', href: 'https://dev.java' },
      { label: 'TypeScript', icon: 'siTypescript', href: 'https://www.typescriptlang.org' },
      { label: 'JavaScript', icon: 'siJavascript', href: 'https://developer.mozilla.org/docs/Web/JavaScript' },
      { label: 'Python', icon: 'siPython', href: 'https://www.python.org' },
      { label: 'SQL', mono: 'SQL', color: '#4479A1', href: 'https://www.postgresql.org/docs/current/sql.html' },
      ],
  },
  {
    title: { fr: 'Frameworks & bibliothèques', en: 'Frameworks & libraries' },
    items: [
      { label: '.NET', icon: 'siDotnet', href: 'https://dotnet.microsoft.com' },
      { label: 'Blazor', mono: 'BZ', color: '#512BD4', href: 'https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor' },
      { label: 'Spring Boot', icon: 'siSpringboot', href: 'https://spring.io/projects/spring-boot' },
      { label: 'Spring Security', icon: 'siSpringsecurity', href: 'https://spring.io/projects/spring-security' },
      { label: 'Axum', mono: 'AX', color: '#DEA584', href: 'https://github.com/tokio-rs/axum' },
      { label: 'Tokio', icon: 'siTokio', href: 'https://tokio.rs' },
      { label: 'Entity Framework', mono: 'EF', color: '#512BD4', href: 'https://learn.microsoft.com/ef/' },
      { label: 'React', icon: 'siReact', href: 'https://react.dev' },
      { label: 'Vue.js', icon: 'siVuedotjs', href: 'https://vuejs.org' },
      { label: 'Next.js', icon: 'siNextdotjs', href: 'https://nextjs.org' },
      { label: 'Node.js', icon: 'siNodedotjs', href: 'https://nodejs.org' },
      { label: 'Thymeleaf', icon: 'siThymeleaf', href: 'https://www.thymeleaf.org' },
      { label: 'Tailwind CSS', icon: 'siTailwindcss', href: 'https://tailwindcss.com' },
    ],
  },
  {
    title: { fr: 'Données', en: 'Data' },
    items: [
      { label: 'PostgreSQL', icon: 'siPostgresql', href: 'https://www.postgresql.org' },
      { label: 'pgvector', mono: 'PV', color: '#4169E1', href: 'https://github.com/pgvector/pgvector' },
      { label: 'MySQL', icon: 'siMysql', href: 'https://www.mysql.com' },
    ],
  },
  {
    title: { fr: 'Outils & DevOps', en: 'Tools & DevOps' },
    items: [
      { label: 'Docker', icon: 'siDocker', href: 'https://www.docker.com' },
      { label: 'Git', icon: 'siGit', href: 'https://git-scm.com' },
      { label: 'GitHub', icon: 'siGithub', href: 'https://github.com' },
      { label: 'GitHub Actions', icon: 'siGithubactions', href: 'https://github.com/features/actions' },
      { label: 'GitLab', icon: 'siGitlab', href: 'https://about.gitlab.com' },
      { label: 'Maven', icon: 'siApachemaven', href: 'https://maven.apache.org' },
      { label: 'SonarQube', icon: 'siSonarqubeserver', href: 'https://www.sonarsource.com/products/sonarqube/' },
      { label: 'Swagger / OpenAPI', icon: 'siSwagger', href: 'https://swagger.io' },
      { label: 'Ollama', icon: 'siOllama', href: 'https://ollama.com' },
    ],
  },
]

/** Index par libellé, pour retrouver le logo d'une techno citée ailleurs. */
export const techByLabel: Record<string, Tech> = Object.fromEntries(
  stack.flatMap((group) => group.items.map((tech) => [tech.label, tech])),
)

/** Techno affichable pour un libellé, avec repli sur un monogramme. */
export function techFor(label: string): Tech {
  return (
    techByLabel[label] ?? {
      label,
      mono: label.slice(0, 2).toUpperCase(),
      href: `https://duckduckgo.com/?q=${encodeURIComponent(label)}`,
    }
  )
}
