"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/Button";
import { TechPill } from "@/components/TechPill";
import { contentItems } from "@/lib/content";

interface StandardViewProps {
  /** Present on desktop when the 3D HUD is the alternative view. */
  onToggleHUD?: () => void;
  onOpen: (id: string) => void;
}

const caseStudies = contentItems.filter((item) => item.kind === "caseStudy");
const journalEntries = contentItems.filter((item) => item.kind === "journal");

const JP_CHARS = /[぀-ヿ㐀-䶿一-鿿]/;

/**
 * Mobile-first 2D layout: the default view on small screens and the opt-in
 * "Standard View" on desktop. Cards here are the 2D fallback for the future
 * 3D desk interactions.
 */
export function StandardView({ onToggleHUD, onOpen }: StandardViewProps) {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-6 py-16">
      {onToggleHUD && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onToggleHUD}>
            Toggle 3D View
          </Button>
        </div>
      )}

      {/* Hero */}
      <header className="py-16">
        <h1 className="font-display text-4xl leading-none tracking-tight text-text-primary md:text-5xl">
          Ibang
        </h1>
        <p className="mt-4 max-w-[45ch] text-base leading-relaxed text-text-secondary">
          Frontend developer building fast, accessible React interfaces. 4x
          faster dashboard loads, an offline-first KYC flow, and a ledger that
          never loses a record.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => onOpen(caseStudies[0].id)}
            className="group"
          >
            Read a case study
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Button>
          <Button variant="outline" onClick={() => onOpen("resume")}>
            View resume
          </Button>
        </div>
      </header>

      {/* Projects */}
      <section aria-labelledby="projects-heading" className="py-16">
        <h2
          id="projects-heading"
          className="font-display text-2xl text-text-primary"
        >
          Selected projects
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          {caseStudies.map((project) => (
            <article
              key={project.id}
              className="rounded-md border border-primary/10 bg-surface p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-wrap gap-2">
                {project.tech?.map((tech) => (
                  <TechPill key={tech} label={tech} />
                ))}
              </div>
              <h3 className="mt-4 font-display text-xl text-text-primary">
                {project.title}
              </h3>
              <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
                {project.body[0].slice(0, 140)}…
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpen(project.id)}
                className="mt-4 -ml-2"
              >
                Read case study
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Journal / learning */}
      <section aria-labelledby="journal-heading" className="py-16">
        <h2
          id="journal-heading"
          className="font-display text-2xl text-text-primary"
        >
          Learning journal
        </h2>
        <div className="mt-8 flex flex-col gap-6 md:grid md:grid-cols-2">
          {journalEntries.map((entry) => {
            const preview = entry.body.find((p) => !JP_CHARS.test(p)) ?? entry.body[0];
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpen(entry.id)}
                aria-label={`Open journal entry: ${entry.title}`}
                className="group rounded-md border border-secondary/20 bg-surface p-6 text-left transition-colors hover:border-secondary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <h3 className="font-display text-lg text-text-primary group-hover:text-secondary">
                  {entry.title}
                </h3>
                {entry.date && (
                  <p className="mt-1 text-xs text-text-secondary">{entry.date}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {preview.slice(0, 110)}…
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact-heading" className="py-16">
        <div className="rounded-md border border-primary/10 bg-surface p-8">
          <h2
            id="contact-heading"
            className="font-display text-2xl text-text-primary"
          >
            Contact
          </h2>
          <p className="mt-3 max-w-[55ch] text-sm leading-relaxed text-text-secondary">
            Open to frontend roles and interesting projects. Email works best.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="mailto:hello@ibang.dev"
              className="rounded-sm border border-primary/60 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-ink"
            >
              Email me
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
