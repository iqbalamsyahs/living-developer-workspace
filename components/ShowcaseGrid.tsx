"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { TechPill } from "@/components/TechPill";
import { SanityImage } from "@/components/SanityImage";
import { toPlainText } from "@/lib/portfolio";

interface ShowcaseGridProps {
  projects: ContentItem[];
  /** Open a project detail page inside the showcase window. */
  onOpen: (id: string) => void;
}

/**
 * One project tile. The media area (cover screenshot, or a text fallback) fills
 * the whole tile and the title row overlays its bottom edge, so every tile is
 * the same size and shape whether or not it has a coverImage. Absolute layout
 * keeps the tile height driven solely by the button's aspect ratio.
 */
function GridCard({ project }: { project: ContentItem }) {
  const summary = project.summary ?? `${toPlainText(project.body).slice(0, 120)}…`;

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-md border border-primary/10 bg-surface transition-colors hover:border-primary/40">
      {/* Media layer: fills the whole tile. */}
      <div className="absolute inset-0">
        {project.coverImage ? (
          <SanityImage
            image={project.coverImage}
            width={800}
            alt={project.title}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col justify-end gap-3 bg-linear-to-br from-surface/60 to-background p-5">
            {project.tech && project.tech.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tech.slice(0, 5).map((tech) => (
                  <TechPill key={tech} label={tech} />
                ))}
              </div>
            )}
            {summary && (
              <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                {summary}
              </p>
            )}
            <div className="pointer-events-auto flex items-center">
              <h3 className="min-w-0 flex-1 truncate font-display text text-text-primary">
                {project.title}
              </h3>
              <ArrowRightIcon width={14} height={14} className="shrink-0 text-primary" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {/* Tech + summary overlaid on the screenshot (only when there is one). */}
      {project.coverImage && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end gap-2 bg-linear-to-t from-background via-background/85 to-transparent p-5 pt-30">
          {project.tech && project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tech.slice(0, 5).map((tech) => (
                <TechPill key={tech} label={tech} />
              ))}
            </div>
          )}
          {summary && (
            <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
              {summary}
            </p>
          )}
          <div className="pointer-events-auto flex items-center">
            <h3 className="min-w-0 flex-1 truncate font-display text text-text-primary">
              {project.title}
            </h3>
            <ArrowRightIcon width={14} height={14} className="shrink-0 text-primary" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Bento grid on the PC monitor: two-up cards, all sharing the same aspect so
 * every row is full and aligned. More cards → the window body scrolls
 * vertically (scrollbar hidden).
 */
export function ShowcaseGrid({ projects, onOpen }: ShowcaseGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-5">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          onClick={() => onOpen(project.id)}
          aria-label={`View ${project.title}`}
          className="aspect-16/10 block min-h-0 w-full overflow-hidden rounded-md text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <GridCard project={project} />
        </button>
      ))}
    </div>
  );
}
