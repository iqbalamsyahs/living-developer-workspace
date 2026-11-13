"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/Button";
import { TechPill } from "@/components/ui/TechPill";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { RichText, toPlainText } from "@/components/ui/RichText";
import { SanityImage } from "@/components/ui/SanityImage";
import { RoomIcon } from "@/components/view/RoomIcons";
import { categoryLabel, hasImageAsset, hireMeHref, type PortfolioData } from "@/lib/portfolio";
import { ROOM_LABELS, type RoomId } from "@/lib/room";
import type { PortableTextBlock } from "@portabletext/react";

interface StandardViewProps {
  portfolio: PortfolioData;
  /** Present on desktop when the 3D HUD is the alternative view. */
  onToggleHUD?: () => void;
  /** Uploaded resume file; the button is hidden without it. */
  resumeHref?: string;
  onOpen: (id: string) => void;
}

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

// Solid amber for core stack, solid violet for languages, outline for tools.
const CATEGORY_VARIANT: Record<string, "default" | "language" | "tool"> = {
  framework: "default",
  language: "language",
  tool: "tool",
  cloud: "default",
};

const SOCIAL_NAMES: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
  instagram: "Instagram",
  facebook: "Facebook",
};

/** First paragraph without Japanese text (the English teaser), else the first. */
function journalPreview(body: PortableTextBlock[]): string {
  const paras = toPlainText(body)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return paras.find((p) => !JP_CHARS.test(p)) ?? paras[0] ?? "";
}

const BAR_LINK =
  "inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * The bedroom flattened into one page: the default view on small screens and
 * the opt-in view on desktop. Room objects index the sections, and the desk
 * lamp's pool of light follows the section being read.
 */
export function StandardView({ portfolio, onToggleHUD, onOpen, resumeHref }: StandardViewProps) {
  const { siteConfig, projects, journalEntries } = portfolio;
  const about = portfolio.items.about;
  const stackContent = portfolio.items.stack;
  const contact = portfolio.items.contact;
  const hireMe = hireMeHref(portfolio.profile.contact);

  const rail: { id: string; room: RoomId; on: boolean }[] = [
    { id: "about", room: "about", on: !!about },
    { id: "projects", room: "showcase", on: projects.length > 0 },
    { id: "stack", room: "stack", on: !!stackContent?.stack?.length },
    { id: "journal", room: "journal", on: journalEntries.length > 0 },
    { id: "contact", room: "contact", on: true },
  ];
  const chips = rail.filter((r) => r.on);

  // The section crossing the upper third of the viewport is the lit one.
  const [lit, setLit] = useState(chips[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setLit(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    document.querySelectorAll("main [data-lamp]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <main className="min-h-dvh w-full overflow-x-clip">
      <div className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2 md:px-6">
          <span className="flex-1 truncate font-display text-text-primary">{siteConfig.brand}</span>
          {onToggleHUD && (
            <Button variant="ghost" size="sm" onClick={onToggleHUD} className="h-11">
              3D Room
            </Button>
          )}
          {resumeHref && (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BAR_LINK} border border-primary/60 text-primary hover:bg-primary hover:text-primary-ink`}
            >
              {siteConfig.ctas.resume}
            </a>
          )}
          {hireMe && (
            <a
              href={hireMe}
              {...(hireMe.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${BAR_LINK} bg-primary text-primary-ink hover:bg-primary/90`}
            >
              Hire me
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
        <header className="pt-12 md:pt-20">
          <h1
            tabIndex={-1}
            className="font-display text-4xl leading-none tracking-tight text-balance text-text-primary outline-none md:text-6xl"
          >
            {portfolio.profile.name}
          </h1>
          <p className="mt-4 max-w-[45ch] text-pretty text-base leading-relaxed text-text-secondary">
            {siteConfig.heroTagline}
          </p>
        </header>

        <nav aria-label="Sections" className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          <ul className="flex gap-2">
            {chips.map((c) => (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#${c.id}`}
                  aria-current={lit === c.id ? "location" : undefined}
                  className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface pl-1.5 pr-3 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current]:border-primary aria-[current]:text-primary"
                >
                  <RoomIcon id={c.room} className="h-8 w-8" />
                  {ROOM_LABELS[c.room]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {about && (
          <Section id="about" room="about" lit={lit} title={siteConfig.headings.about}>
            <div className="flex flex-col gap-4">
              {hasImageAsset(about.photo) && about.photo && (
                <SanityImage
                  image={about.photo}
                  width={320}
                  alt={about.photo.alt}
                  aspect="1/1"
                  className="h-32 w-32 rounded-md border border-line"
                />
              )}
              {about.body.length > 0 && <RichText value={about.body} />}
              {about.philosophy && (
                <blockquote className="mt-2 max-w-[50ch] text-pretty font-display text-lg leading-snug text-text-secondary">
                  {about.philosophy}
                </blockquote>
              )}
            </div>
            {about.experiences && about.experiences.length > 0 && (
              <div className="mt-12">
                <div className="mb-6 flex items-center gap-3">
                  <RoomIcon id="experience" className="h-10 w-10" />
                  <h3 className="font-display text-lg text-text-primary">{siteConfig.headings.experience}</h3>
                </div>
                <ExperienceTimeline experiences={about.experiences} />
              </div>
            )}
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" room="showcase" lit={lit} title={ROOM_LABELS.showcase}>
            <div className="flex flex-col gap-6">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-md border border-line bg-surface p-4 transition-colors hover:border-primary/40 md:p-6"
                >
                  {project.coverImage && (
                    <div className="mb-4 overflow-hidden rounded-sm border border-line">
                      <SanityImage image={project.coverImage} width={800} alt={project.title} className="block w-full" aspect="16/9" />
                    </div>
                  )}
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <TechPill key={tech} label={tech} />
                      ))}
                    </div>
                  )}
                  <h3 className="mt-4 font-display text-xl text-text-primary">{project.title}</h3>
                  <p className="mt-2 max-w-[60ch] text-pretty text-sm leading-relaxed text-text-secondary">
                    {project.summary ?? `${toPlainText(project.body).slice(0, 140)}…`}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => onOpen(project.id)} className="-ml-3 mt-2 h-11">
                    {siteConfig.ctas.readCaseStudy}
                    <ArrowRightIcon width={14} height={14} aria-hidden="true" />
                  </Button>
                </article>
              ))}
            </div>
          </Section>
        )}

        {stackContent?.stack && stackContent.stack.length > 0 && (
          <Section id="stack" room="stack" lit={lit} title={siteConfig.headings.stack}>
            <div className="flex flex-col gap-8">
              {[...new Set(stackContent.stack.map((item) => item.category))].map((category) => (
                <div key={category}>
                  <h3 className="mb-3 font-display text-sm text-text-secondary">
                    {categoryLabel(siteConfig.categoryLabels, category)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stackContent
                      .stack!.filter((item) => item.category === category)
                      .map((item) => (
                        <TechPill key={item.name} label={item.name} variant={CATEGORY_VARIANT[item.category] ?? "default"} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {stackContent.services && stackContent.services.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-lg text-text-primary">Services</h3>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {stackContent.services.map((service) => (
                    <div key={service.name} className="grid gap-1 py-4 md:grid-cols-[12rem_1fr] md:gap-6">
                      <dt className="font-display text-text-primary">{service.name}</dt>
                      <dd className="text-pretty text-sm leading-relaxed text-text-secondary">{service.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Section>
        )}

        {journalEntries.length > 0 && (
          <Section id="journal" room="journal" lit={lit} title={ROOM_LABELS.journal}>
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
              {journalEntries.map((entry) => {
                const preview = journalPreview(entry.body);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpen(entry.id)}
                    aria-label={`Open journal entry: ${entry.title}`}
                    className="group rounded-md border border-secondary/20 bg-surface p-5 text-left transition-colors hover:border-secondary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <h3 className="font-display text-lg text-text-primary group-hover:text-secondary">{entry.title}</h3>
                    {entry.date && <p className="mt-1 text-xs text-text-secondary">{entry.date}</p>}
                    {preview && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{preview.slice(0, 110)}…</p>}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <Section id="contact" room="contact" lit={lit} title={siteConfig.headings.contact}>
          {contact.body.length > 0 && <RichText value={contact.body} />}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {contact.contact?.email && (
              <a
                href={`mailto:${contact.contact.email}`}
                className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary/90"
              >
                {siteConfig.ctas.email}
              </a>
            )}
            {contact.contact?.socials?.map((s) => (
              <a
                key={s._key ?? s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-sm px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {SOCIAL_NAMES[s.platform] ?? s.platform}
              </a>
            ))}
          </div>

          {portfolio.profile.faq && portfolio.profile.faq.length > 0 && (
            <div className="mt-16">
              <h3 className="font-display text-lg text-text-primary">Questions clients ask</h3>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {portfolio.profile.faq
                  .filter((item) => item.question && item.answer)
                  .map((item) => (
                    <details key={item.question}>
                      <summary className="flex min-h-11 cursor-pointer items-center py-2 font-display text-sm text-text-primary marker:text-primary">
                        {item.question}
                      </summary>
                      <p className="max-w-[60ch] pb-4 text-pretty text-sm leading-relaxed text-text-secondary">{item.answer}</p>
                    </details>
                  ))}
              </div>
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

interface SectionProps {
  id: string;
  room: RoomId;
  lit: string;
  title: string;
  children: ReactNode;
}

/** One room object's section; the lamp's warm pool sits behind it while it is being read. */
function Section({ id, room, lit, title, children }: SectionProps) {
  const on = lit === id;
  return (
    <section id={id} data-lamp aria-labelledby={`${id}-heading`} className="relative scroll-mt-20 pt-20">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-x-16 -top-4 h-96 bg-[radial-gradient(closest-side,var(--color-primary),transparent)] blur-2xl transition-opacity duration-700 ease-out motion-reduce:transition-none ${on ? "opacity-[0.14]" : "opacity-0"}`}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <RoomIcon id={room} className="h-12 w-12" />
          <h2
            id={`${id}-heading`}
            className={`font-display text-3xl text-balance transition-colors duration-500 ${on ? "text-text-primary" : "text-text-secondary"}`}
          >
            {title}
          </h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
