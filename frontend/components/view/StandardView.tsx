"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/Button";
import { TechPill } from "@/components/ui/TechPill";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { RichText, toPlainText } from "@/components/ui/RichText";
import { SanityImage } from "@/components/ui/SanityImage";
import { RoomIcon } from "@/components/view/RoomIcons";
import { categoryLabel, hasImageAsset, type PortfolioData } from "@/lib/portfolio";
import type { PortableTextBlock } from "@portabletext/react";

interface StandardViewProps {
  portfolio: PortfolioData;
  /** Present on desktop when the 3D HUD is the alternative view. */
  onToggleHUD?: () => void;
  /** Resume file or first link; the button is hidden without it. */
  resumeHref?: string;
  onOpen: (id: string) => void;
}

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

// DESIGN.md: solid green for core stack, solid violet for languages and
// design tools, outline for everything else.
const CATEGORY_VARIANT: Record<string, "default" | "language" | "tool"> = {
  framework: "default",
  language: "language",
  tool: "tool",
  cloud: "default",
};

/** First paragraph without Japanese text (the English teaser), else the first. */
function journalPreview(body: PortableTextBlock[]): string {
  const paras = toPlainText(body)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return paras.find((p) => !JP_CHARS.test(p)) ?? paras[0] ?? "";
}

/**
 * Mobile-first 2D layout: the default view on small screens and the opt-in
 * "Standard View" on desktop, with small room-object icons beside each
 * section heading echoing the 3D bedroom scene.
 */
export function StandardView({ portfolio, onToggleHUD, onOpen, resumeHref }: StandardViewProps) {
  const { siteConfig, projects, journalEntries } = portfolio;
  const about = portfolio.items.about;
  const stackContent = portfolio.items.stack;
  const contact = portfolio.items.contact;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 py-16">
      {onToggleHUD && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onToggleHUD}>
            Toggle 3D View
          </Button>
        </div>
      )}

      {/* Hero */}
      <header className="py-16">
        <h1 tabIndex={-1} className="font-display text-4xl leading-none tracking-tight text-text-primary outline-none md:text-5xl">
          {portfolio.profile.name}
        </h1>
        <p className="mt-4 max-w-[45ch] text-base leading-relaxed text-text-secondary">
          {siteConfig.heroTagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {projects[0] && (
            <Button
              onClick={() => onOpen(projects[0].id)}
              className="group"
            >
              {siteConfig.ctas.caseStudy}
              <ArrowRightIcon
                width={16}
                height={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Button>
          )}
          {resumeHref && (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm border border-primary/60 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-ink"
            >
              {siteConfig.ctas.resume}
            </a>
          )}
        </div>
      </header>

      {/* About & Experience */}
      {about && (
        <section aria-labelledby="about-heading" className="py-16">
          <div className="flex items-center gap-3">
            <RoomIcon id="about" className="h-10 w-10" />
            <h2
              id="about-heading"
              className="font-display text-2xl text-text-primary"
            >
              {siteConfig.headings.about}
            </h2>
          </div>
          <div className="mt-8 flex flex-col gap-4">
            {hasImageAsset(about.photo) && about.photo && (
              <SanityImage
                image={about.photo}
                width={320}
                alt={about.photo.alt}
                aspect="1/1"
                className="h-32 w-32 rounded-md border border-line"
              />
            )}
            {about.body.length > 0 && (
              <RichText value={about.body} />
            )}
            {about.philosophy && (
              <blockquote className="mt-2 max-w-[60ch] border-l-2 border-primary/40 pl-4 text-text-secondary">
                {about.philosophy}
              </blockquote>
            )}
          </div>
          {about.experiences && about.experiences.length > 0 && (
            <div className="mt-10 rounded-md border border-line bg-surface p-8">
              <div className="mb-8 flex items-center gap-3">
                <RoomIcon id="experience" className="h-10 w-10" />
                <h3 className="font-display text-lg text-text-primary">
                  {siteConfig.headings.experience}
                </h3>
              </div>
              <ExperienceTimeline experiences={about.experiences} />
            </div>
          )}
        </section>
      )}

      {/* Stack & Services */}
      {stackContent && stackContent.stack && stackContent.stack.length > 0 && (
        <section aria-labelledby="stack-heading" className="py-16">
          <div className="flex items-center gap-3">
            <RoomIcon id="stack" className="h-10 w-10" />
            <h2
              id="stack-heading"
              className="font-display text-2xl text-text-primary"
            >
              {siteConfig.headings.stack}
            </h2>
          </div>
          <div className="mt-8 flex flex-col gap-8">
            {[...new Set(stackContent.stack.map((item) => item.category))].map(
              (category) => (
                <div key={category}>
                  <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-text-secondary">
                    {categoryLabel(siteConfig.categoryLabels, category)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stackContent
                      .stack!.filter((item) => item.category === category)
                      .map((item) => (
                        <TechPill
                          key={item.name}
                          label={item.name}
                          variant={CATEGORY_VARIANT[item.category] ?? "default"}
                        />
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {/* Services */}
      {stackContent?.services && stackContent.services.length > 0 && (
        <section aria-labelledby="services-heading" className="py-16">
          <div className="flex items-center gap-3">
            <RoomIcon id="stack" className="h-10 w-10" />
            <h2 id="services-heading" className="font-display text-2xl text-text-primary">
              Services
            </h2>
          </div>
          {stackContent.services && stackContent.services.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {stackContent.services.map((service) => (
                <article
                  key={service.name}
                  className="rounded-md border border-line bg-surface p-6"
                >
                  <h3 className="font-display text-sm text-text-primary">
                    {service.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Projects */}
      <section aria-labelledby="projects-heading" className="py-16">
        <div className="flex items-center gap-3">
          <RoomIcon id="showcase" className="h-10 w-10" />
          <h2
            id="projects-heading"
            className="font-display text-2xl text-text-primary"
          >
            {siteConfig.headings.projects}
          </h2>
        </div>
        <div className="mt-8 flex flex-col gap-6">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-md border border-line bg-surface p-6 transition-colors hover:border-primary/40"
            >
              {project.coverImage && (
                <div className="mb-4 overflow-hidden rounded-sm border border-line">
                  <SanityImage
                    image={project.coverImage}
                    width={800}
                    alt={project.title}
                    className="block w-full"
                    aspect="16/9"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {project.tech?.map((tech) => (
                  <TechPill key={tech} label={tech} />
                ))}
              </div>
              <h3 className="mt-4 font-display text-xl text-text-primary">
                {project.title}
              </h3>
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
                {project.summary ?? `${toPlainText(project.body).slice(0, 140)}…`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpen(project.id)}
                className="mt-4 -ml-2"
              >
                {siteConfig.ctas.readCaseStudy}
                <ArrowRightIcon width={14} height={14} aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Journal / learning */}
      <section aria-labelledby="journal-heading" className="py-16">
        <div className="flex items-center gap-3">
          <RoomIcon id="journal" className="h-10 w-10" />
          <h2
            id="journal-heading"
            className="font-display text-2xl text-text-primary"
          >
            {siteConfig.headings.journal}
          </h2>
        </div>
        <div className="mt-8 flex flex-col gap-6 md:grid md:grid-cols-2">
          {journalEntries.map((entry) => {
            const preview = journalPreview(entry.body);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpen(entry.id)}
                aria-label={`Open journal entry: ${entry.title}`}
                className="group rounded-md border border-secondary/20 bg-surface p-6 text-left transition-colors hover:border-secondary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <h3 className="font-display text-lg text-text-primary group-hover:text-secondary">
                  {entry.title}
                </h3>
                {entry.date && (
                  <p className="mt-1 text-xs text-text-secondary">{entry.date}</p>
                )}
                {preview && (
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {preview.slice(0, 110)}…
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      {portfolio.profile.faq && portfolio.profile.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="py-16">
          <h2 id="faq-heading" className="font-display text-2xl text-text-primary">
            FAQ
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {portfolio.profile.faq.filter((item) => item.question && item.answer).map((item) => (
              <details
                key={item.question}
                className="group rounded-md border border-line bg-surface p-5 open:border-primary/40"
              >
                <summary className="cursor-pointer font-display text-sm text-text-primary">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section aria-labelledby="contact-heading" className="py-16">
        <div className="rounded-md border border-line bg-surface p-8">
          <div className="flex items-center gap-3">
            <RoomIcon id="contact" className="h-10 w-10" />
            <h2
              id="contact-heading"
              className="font-display text-2xl text-text-primary"
            >
              {siteConfig.headings.contact}
            </h2>
          </div>
          {contact.body.length > 0 && (
            <div className="mt-3 max-w-[55ch]">
              <RichText value={contact.body} />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={`mailto:${contact.contact?.email ?? ""}`}
              className="rounded-sm border border-primary/60 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-ink"
            >
              {siteConfig.ctas.email}
            </a>
            {contact.contact?.socials?.map((s) => (
              <a
                key={s._key ?? s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm px-5 py-2.5 text-sm font-medium capitalize text-text-secondary transition-colors hover:text-text-primary"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
