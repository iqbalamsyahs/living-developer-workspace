import type { Experience } from "@/lib/content";

interface ExperienceTimelineProps {
  experiences: Experience[];
}

/**
 * Minimalist vertical career timeline: dot + line on the left, position /
 * company / date range / description on the right. Shared by the About modal
 * and StandardView.
 */
export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  return (
    <ol className="flex flex-col gap-6">
      {experiences.map((exp, index) => (
        <li key={`${exp.company}-${exp.startDate}`} className="relative pl-6">
          {/* Node + connecting line (line skipped on the last entry) */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary"
          />
          {index < experiences.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute -bottom-6 left-0.75 top-4 w-px bg-primary/20"
            />
          )}
          <h3 className="font-display text-base text-text-primary">
            {exp.position}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-primary">
            {exp.company}
          </p>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-text-secondary">
            {exp.startDate} – {exp.endDate ?? "Present"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary/80">
            {exp.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
