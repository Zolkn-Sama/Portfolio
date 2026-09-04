import { useState } from 'react'
import { commands, type SectionId } from '../data/commands'
import { languageColor, useGithub } from '../hooks/useGithub'
import { icons } from '../data/icons'
import { repoDescriptions, repoLanguage, repoStack } from '../data/repos'
import { stack, techFor, type Tech } from '../data/stack'
import {
  about,
  contact,
  cvFiles,
  education,
  experience,
  internship,
  identity,
  interests,
  projects,
  skills,
  type Entry,
} from '../data/profile'
import { useLang } from '../i18n/LangContext'
import { sectionHref } from '../routing'

/* ── Briques communes ──────────────────────────────────────────────────── */

function StackChips({ stack }: { stack?: string[] }) {
  if (!stack?.length) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {stack.map((label) => (
        <li
          key={label}
          className="flex items-center gap-1.5 rounded-field border border-base-300 bg-base-200/60 py-0.5 pr-2 pl-1.5 text-xs"
        >
          <TechLogo tech={techFor(label)} small />
          <span className="whitespace-nowrap">{label}</span>
        </li>
      ))}
    </ul>
  )
}

function EntryLinks({ entry }: { entry: Entry }) {
  const { L } = useLang()
  if (!entry.links?.length) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {entry.links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-xs gap-1 font-mono"
          >
            <span aria-hidden="true">↗</span>
            {L(link.label)}
          </a>
        </li>
      ))}
    </ul>
  )
}

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const { L } = useLang()
  return (
    <article
      className="rise-in rounded-box border border-base-300 bg-base-200/60 p-4 sm:p-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-base font-bold text-primary sm:text-lg">{entry.org}</h3>
        <p className="text-xs text-base-content/60">
          {L(entry.place)} · <span className="text-accent">{entry.period}</span>
        </p>
      </header>
      <p className="mt-1 text-sm font-semibold">{L(entry.title)}</p>
      <p className="mt-2 text-sm leading-relaxed text-base-content/80">
        {L(entry.summary)}
      </p>
      {entry.bullets && (
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-base-content/75">
          {L(entry.bullets).map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span aria-hidden="true" className="shrink-0 text-primary">
                •
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      <StackChips stack={entry.stack} />
      <EntryLinks entry={entry} />
    </article>
  )
}

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid gap-4">
      {entries.map((entry, i) => (
        <EntryCard key={`${entry.org}-${entry.period}`} entry={entry} index={i} />
      ))}
    </div>
  )
}

/* ── Sections ──────────────────────────────────────────────────────────── */

function AboutSection() {
  const { L } = useLang()
  return (
    <div className="grid gap-4">
      {L(about).map((paragraph, i) => (
        <p
          key={paragraph}
          className="rise-in max-w-3xl text-sm leading-relaxed text-base-content/85 sm:text-base"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {paragraph}
        </p>
      ))}
      <ul className="rise-in flex flex-wrap gap-2 pt-1" style={{ animationDelay: '180ms' }}>
        {[L(identity.location), L(identity.status), 'MIAGE 2025–2027'].map((chip) => (
          <li key={chip} className="badge badge-outline border-primary/40 text-primary">
            {chip}
          </li>
        ))}
      </ul>
      <p
        className="rise-in text-sm text-base-content/70"
        style={{ animationDelay: '240ms' }}
      >
        <span aria-hidden="true" className="mr-1 text-primary">
          ⌖
        </span>
        {L(identity.availability)}
      </p>
    </div>
  )
}

function TechLogo({ tech, small = false }: { tech: Tech; small?: boolean }) {
  const icon = tech.icon ? icons[tech.icon] : undefined
  const color = icon?.hex ?? tech.color ?? 'currentColor'

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center ${small ? 'size-4' : 'size-7'}`}
      style={{ color }}
    >
      {icon ? (
        <svg viewBox="0 0 24 24" className={`fill-current ${small ? 'size-4' : 'size-6'}`}>
          <path d={icon.path} />
        </svg>
      ) : (
        <span className={`font-bold tracking-tight ${small ? 'text-[0.5rem]' : 'text-[0.7rem]'}`}>
          {tech.mono}
        </span>
      )}
    </span>
  )
}

function SkillsSection() {
  const { L } = useLang()
  let index = 0

  return (
    <div className="grid gap-6">
      {stack.map((group) => (
        <section key={group.title.en}>
          <h3 className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
            {L(group.title)}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {group.items.map((tech) => (
              <li key={tech.label} className="rise-in" style={{ animationDelay: `${(index++ % 12) * 35}ms` }}>
                <a
                  href={tech.href}
                  target="_blank"
                  rel="noreferrer"
                  title={tech.label}
                  className="flex items-center gap-2 rounded-field border border-base-300 bg-base-200/60 py-1.5 pr-3 pl-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <TechLogo tech={tech} />
                  <span className="whitespace-nowrap">{tech.label}</span>
                  {tech.soon && (
                    <span className="badge badge-xs badge-outline border-accent/50 text-accent">
                      {L({ fr: 'bientôt', en: 'soon' })}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div>
        <h3 className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
          {L({ fr: 'Au-delà du code', en: 'Beyond the code' })}
        </h3>
        <ul className="grid gap-2 text-sm text-base-content/85 sm:grid-cols-2">
          {L(skills.professional).map((item, i) => (
            <li
              key={item}
              className="rise-in flex gap-2 rounded-field border border-base-300 bg-base-200/50 px-3 py-2"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span aria-hidden="true" className="text-primary">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-primary/40 pl-3 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-40 shrink-0 text-xs tracking-[0.15em] text-primary uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-base-content/85">{children}</dd>
    </div>
  )
}

function InternshipSection() {
  const { L } = useLang()

  return (
    <div className="grid gap-6">
      <dl className="grid gap-4">
        <div className="rise-in">
          <SpecRow label={L({ fr: 'Début', en: 'Start' })}>
            <time dateTime={internship.startDate} className="font-semibold text-base-content">
              {L(internship.start)}
            </time>
          </SpecRow>
        </div>
        <div className="rise-in" style={{ animationDelay: '60ms' }}>
          <SpecRow label={L({ fr: 'Durée', en: 'Duration' })}>
            <span className="font-semibold text-base-content">{L(internship.duration)}</span>{' '}
            <span className="text-base-content/60">— {L(internship.end)}</span>
          </SpecRow>
        </div>
        <div className="rise-in" style={{ animationDelay: '120ms' }}>
          <SpecRow label={L({ fr: 'École', en: 'University' })}>
            <a
              href={internship.school.url}
              target="_blank"
              rel="noreferrer"
              className="link link-hover font-semibold text-base-content"
            >
              {internship.school.name}
            </a>
            <br />
            {L(internship.school.program)}
            <br />
            <span className="text-base-content/60">{L(internship.school.note)}</span>
          </SpecRow>
        </div>
        <div className="rise-in" style={{ animationDelay: '180ms' }}>
          <SpecRow label={L({ fr: 'Zone', en: 'Area' })}>
            {L(identity.availability)}
            <br />
            <span className="text-base-content/60">{L(internship.mode)}</span>
          </SpecRow>
        </div>
      </dl>

      <div>
        <h3 className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
          {L({ fr: 'Domaine ciblé', en: 'Target field' })}
        </h3>
        <ul className="grid gap-2 text-sm leading-relaxed text-base-content/85">
          {L(internship.target).map((item, i) => (
            <li
              key={item}
              className="rise-in flex gap-2"
              style={{ animationDelay: `${240 + i * 50}ms` }}
            >
              <span aria-hidden="true" className="shrink-0 text-primary">
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rise-in flex flex-wrap gap-2" style={{ animationDelay: '520ms' }}>
        <a href={`mailto:${contact.email}`} className="btn btn-primary btn-sm">
          {L({ fr: 'M’écrire', en: 'E-mail me' })}
        </a>
        <a
          href={contact.linkedin}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
        >
          LinkedIn
        </a>
      </div>
    </div>
  )
}

function InterestsSection() {
  const { L } = useLang()
  let index = 0

  return (
    <div className="grid gap-5">
      {interests.map((group) => (
        <section key={group.title.en}>
          <h3 className="mb-2 text-xs tracking-[0.2em] text-primary uppercase">
            {L(group.title)}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {L(group.items).map((item) => (
              <li
                key={item}
                className="rise-in rounded-field border border-base-300 bg-base-200/60 px-3 py-2 text-sm"
                style={{ animationDelay: `${(index++ % 12) * 40}ms` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs shrink-0 font-mono"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setDone(true)
          window.setTimeout(() => setDone(false), 1600)
        })
      }}
    >
      {done ? `✓ ${t.copied}` : t.copy}
    </button>
  )
}

function ContactSection() {
  const { L } = useLang()
  const rows = [
    { key: 'e-mail', value: contact.email, href: `mailto:${contact.email}`, copy: contact.email },
    { key: 'tel', value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, copy: contact.phone },
    { key: 'github', value: contact.githubLabel, href: contact.github },
    { key: 'linkedin', value: contact.linkedinLabel, href: contact.linkedin },
  ]
  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {rows.map((row, i) => (
          <li
            key={row.key}
            className="rise-in flex items-center gap-3 rounded-field border border-base-300 bg-base-200/60 px-3 py-2"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="w-20 shrink-0 text-xs tracking-widest text-primary uppercase">
              {row.key}
            </span>
            <a
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="link link-hover grow truncate text-sm"
            >
              {row.value}
            </a>
            {row.copy && <CopyButton value={row.copy} />}
          </li>
        ))}
      </ul>
      <div className="text-sm text-base-content/70">
        <h3 className="mb-2 text-xs tracking-widest text-primary uppercase">
          {L({ fr: 'Adresses', en: 'Addresses' })}
        </h3>
        <ul className="grid gap-1">
          {contact.addresses.map((address) => (
            <li key={L(address)}>{L(address)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CvSection() {
  const { L, t } = useLang()
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cvFiles.map((cv, i) => (
        <article
          key={cv.file}
          className="rise-in flex flex-col gap-2 rounded-box border border-base-300 bg-base-200/60 p-4"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <h3 className="text-sm font-bold text-primary">{L(cv.track)}</h3>
          <p className="text-xs text-base-content/60">{L(cv.city)}</p>
          <div className="mt-auto flex gap-2 pt-2">
            <a
              href={`/cv/${cv.file}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-xs grow"
            >
              {t.viewCv}
            </a>
            <a
              href={`/cv/${cv.file}`}
              download
              className="btn btn-primary btn-xs grow"
            >
              {t.downloadCv}
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}

function HelpSection({ onRun }: { onRun: (query: string) => void }) {
  const { lang, t } = useLang()
  return (
    <div className="grid gap-3">
      <p className="text-sm text-base-content/70">{t.helpIntro}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {commands.map((cmd, i) => (
          <li key={cmd.id} className="rise-in" style={{ animationDelay: `${i * 45}ms` }}>
            <a
              href={sectionHref(cmd.id)}
              onClick={(e) => {
                e.preventDefault()
                onRun(cmd.id)
              }}
              className="flex w-full items-baseline gap-3 rounded-field border border-base-300 bg-base-200/60 px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/10"
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-center text-primary">
                {cmd.glyph}
              </span>
              <span className="shrink-0 text-sm font-semibold">{cmd.label[lang]}</span>
              <span className="truncate text-xs text-base-content/60">
                {cmd.description[lang]}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GithubSection() {
  const { lang, L, t } = useLang()
  const state = useGithub()

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div className="grid gap-3" aria-live="polite">
        <p className="text-sm text-base-content/60">
          {t.ghLoading}
          <span className="caret ml-1 text-primary">▍</span>
        </p>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton h-20 rounded-box opacity-40"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="alert alert-warning alert-soft">
        <span>{state.message === 'rate-limit' ? t.ghRateLimit : t.ghError}</span>
        <a href={contact.github} target="_blank" rel="noreferrer" className="btn btn-xs">
          {t.ghOpenProfile}
        </a>
      </div>
    )
  }

  const { profile, repos } = state.data
  const since = new Date(profile.createdAt).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="grid gap-4">
      <header className="rise-in flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-200/60 p-4">
        <img
          src={profile.avatarUrl}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          className="size-14 rounded-box border border-primary/40"
        />
        <div className="min-w-0 grow">
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="link link-hover font-bold text-primary"
          >
            @{profile.login}
          </a>
          {profile.bio && (
            <p className="truncate text-xs text-base-content/70">{profile.bio}</p>
          )}
        </div>
        <ul className="flex gap-4 text-center text-xs">
          <li>
            <span className="block text-lg leading-none font-bold text-primary">
              {profile.publicRepos}
            </span>
            <span className="text-base-content/60">{t.ghRepos}</span>
          </li>
          <li>
            <span className="block text-lg leading-none font-bold text-primary">
              {profile.followers}
            </span>
            <span className="text-base-content/60">{t.ghFollowers}</span>
          </li>
          <li>
            <span className="block text-lg leading-none font-bold text-primary">
              {since}
            </span>
            <span className="text-base-content/60">{t.ghSince}</span>
          </li>
        </ul>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {repos.map((repo, i) => {
          const local = repoDescriptions[repo.name]
          // L'API ne renseigne pas le langage des forks : on complète.
          const language = repo.language ?? repoLanguage[repo.name] ?? null
          return (
          <li key={repo.id} className="rise-in" style={{ animationDelay: `${i * 45}ms` }}>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col gap-1 rounded-box border border-base-300 bg-base-200/60 p-3 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex items-baseline gap-2">
                <span className="truncate font-semibold text-primary">{repo.name}</span>
                {repo.isFork && (
                  <span className="badge badge-ghost badge-xs shrink-0">{t.ghFork}</span>
                )}
              </span>
              <span className="grow text-xs leading-relaxed text-base-content/70">
                {repo.description ?? (local && L(local)) ?? t.ghNoDescription}
              </span>
              {repoStack[repo.name] && (
                <span className="flex flex-wrap items-center gap-1.5 pt-1">
                  {repoStack[repo.name].map((label) => (
                    <span
                      key={label}
                      title={label}
                      className="flex size-6 items-center justify-center rounded-field border border-base-300 bg-base-100/60"
                    >
                      <TechLogo tech={techFor(label)} small />
                    </span>
                  ))}
                </span>
              )}

              <span className="flex flex-wrap items-center gap-3 pt-1 text-[0.7rem] text-base-content/55">
                {language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: languageColor[language] ?? 'currentColor' }}
                    />
                    {language}
                  </span>
                )}
                {repo.stars > 0 && <span>★ {repo.stars}</span>}
              </span>
            </a>
          </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ── Point d’entrée ────────────────────────────────────────────────────── */

export function SectionBody({
  id,
  onRun,
}: {
  id: SectionId
  onRun: (query: string) => void
}) {
  switch (id) {
    case 'me':
      return <AboutSection />
    case 'experience':
      return <EntryList entries={experience} />
    case 'projects':
      return <EntryList entries={projects} />
    case 'education':
      return <EntryList entries={education} />
    case 'skills':
      return <SkillsSection />
    case 'passion':
      return <InterestsSection />
    case 'github':
      return <GithubSection />
    case 'internship':
      return <InternshipSection />
    case 'contact':
      return <ContactSection />
    case 'cv':
      return <CvSection />
    case 'help':
      return <HelpSection onRun={onRun} />
  }
}

/** Panneau affiché quand la commande saisie n’est pas reconnue. */
export function UnknownSection({ onRun }: { onRun: (query: string) => void }) {
  return <HelpSection onRun={onRun} />
}
