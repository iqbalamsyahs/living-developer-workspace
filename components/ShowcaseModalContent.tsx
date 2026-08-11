"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { Button } from "@/components/Button";
import { TechPill } from "@/components/TechPill";
import { ModalHeader } from "@/components/ModalHeader";
import { SanityImage } from "@/components/SanityImage";
import { toPlainText } from "@/lib/portfolio";

interface ShowcaseModalContentProps {
  content: ContentItem;
  projects: ContentItem[];
  /** Open a specific project; on close the Showcase modal returns. */
  onOpen: (id: string) => void;
  onClose: () => void;
}

/** One project card. Shared by the modal list and the on-monitor slider. */
export function ShowcaseCard({
  project,
  onOpen,
}: {
  project: ContentItem;
  onOpen: (id: string) => void;
}) {
  return (
    <article
      className="rounded-md border border-primary/10 bg-surface p-6 transition-colors hover:border-primary/40"
    >
      {project.coverImage && (
        <div className="mb-4 overflow-hidden rounded-sm border border-primary/10">
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
      {project.date && (
        <p className="mt-1 text-xs text-text-secondary">{project.date}</p>
      )}
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-text-secondary">
        {project.summary ?? `${toPlainText(project.body).slice(0, 140)}…`}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onOpen(project.id)}
        className="mt-4 -ml-2"
      >
        View project
        <ArrowRightIcon width={14} height={14} aria-hidden="true" />
      </Button>
    </article>
  );
}

/**
 * Showcase Projects modal: a card list of projects; each card opens the
 * detailed project, which restores this modal on close. Opened by the PC.
 */
export function ShowcaseModalContent({
  content,
  projects,
  onOpen,
  onClose,
}: ShowcaseModalContentProps) {
  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          {projects.map((project) => (
            <ShowcaseCard key={project.id} project={project} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </>
  );
}
