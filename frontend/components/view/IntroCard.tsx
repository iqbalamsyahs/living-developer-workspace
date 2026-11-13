interface IntroCardProps {
  name: string;
  tagline: string;
  resumeHref?: string;
  resumeLabel: string;
  /** Shown when there is no resume, so the card always offers a next step. */
  hireMeHref?: string;
}

/** Overview greeting: who this is and the resume, without touching the 3D. */
export function IntroCard({ name, tagline, resumeHref, resumeLabel, hireMeHref }: IntroCardProps) {
  return (
    <div className="fixed bottom-16 left-6 z-10 max-w-xs rounded-md border border-line bg-surface/85 p-6 backdrop-blur">
      <h1 tabIndex={-1} className="font-display text-3xl leading-tight text-text-primary outline-none">{name}</h1>
      {tagline && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{tagline}</p>}
      {(resumeHref || hireMeHref) && (
        <a
          href={resumeHref ?? hireMeHref}
          {...(resumeHref || hireMeHref?.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="mt-5 inline-flex rounded-sm border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
        >
          {resumeHref ? resumeLabel : "Hire me"}
        </a>
      )}
    </div>
  );
}
