"use client";

import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import type { Stop } from "@/lib/journey";
import { resumeHref, type PortfolioData } from "@/lib/portfolio";

interface StopOverlayProps {
  stop: Stop;
  portfolio: PortfolioData;
  onOpen: (id: string) => void;
}

const CARD =
  "pointer-events-auto max-h-[70vh] w-[min(26rem,calc(100vw-8rem))] overflow-y-auto rounded-xs border border-primary/25 bg-surface/90 p-6 shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-opacity duration-300 starting:opacity-0 motion-reduce:transition-none";

/** Left-hand text panel for stops whose content is not drawn on a 3D object. */
export function StopOverlay({ stop, portfolio, onOpen }: StopOverlayProps) {
  const { siteConfig, profile, items, journalEntries } = portfolio;
  let card: React.ReactNode = null;

  if (stop.id === "intro") {
    const resume = resumeHref({ resumeFileUrl: profile.resumeFileUrl, links: items.resume?.links });
    card = (
      <>
        <h1 className="font-display text-3xl leading-tight text-text-primary">{profile.name}</h1>
        {siteConfig.heroTagline && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{siteConfig.heroTagline}</p>
        )}
        {resume && (
          <a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-xs border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
          >
            {siteConfig.ctas.resume}
          </a>
        )}
      </>
    );
  } else if (stop.id === "experience") {
    const experiences = items.about?.experiences ?? [];
    if (experiences.length > 0) {
      card = (
        <>
          <h2 className="mb-4 font-display text-xl text-text-primary">{siteConfig.headings.experience}</h2>
          <ExperienceTimeline experiences={experiences} />
        </>
      );
    }
  } else if (stop.id === "journal") {
    if (journalEntries.length > 0) {
      card = (
        <>
          <h2 className="mb-3 font-display text-xl text-text-primary">{siteConfig.headings.journal}</h2>
          <ul className="flex flex-col">
            {journalEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onOpen(entry.id)}
                  className="flex w-full flex-col items-start gap-0.5 border-t border-primary/10 py-3 text-left transition-colors hover:text-primary"
                >
                  <span className="font-display text-sm text-text-primary">{entry.title}</span>
                  {entry.date && (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">{entry.date}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      );
    }
  } else {
    const caption = siteConfig.headings[stop.id];
    if (caption) card = <p className="font-display text-lg text-text-primary">{caption}</p>;
  }

  if (!card) return null;
  return (
    <div className="pointer-events-none fixed left-6 top-1/2 z-10 -translate-y-1/2">
      <div key={stop.id} className={CARD}>
        {card}
      </div>
    </div>
  );
}
