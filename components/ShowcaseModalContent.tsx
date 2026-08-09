"use client";

import { ArrowRight } from "@phosphor-icons/react";
import type { ContentItem } from "@/lib/content";
import { contentItems } from "@/lib/content";
import { Button } from "@/components/Button";
import { TechPill } from "@/components/TechPill";
import { ModalHeader } from "@/components/ModalHeader";

interface ShowcaseModalContentProps {
  content: ContentItem;
  /** Open a specific case study; on close the Showcase modal returns. */
  onOpen: (id: string) => void;
  onClose: () => void;
}

const caseStudies = contentItems.filter((item) => item.kind === "caseStudy");

/**
 * Showcase Projects modal: a card list of case studies; each card opens the
 * detailed study, which restores this modal on close. Opened by the PC.
 */
export function ShowcaseModalContent({
  content,
  onOpen,
  onClose,
}: ShowcaseModalContentProps) {
  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
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
              {project.date && (
                <p className="mt-1 text-xs text-text-secondary">{project.date}</p>
              )}
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
      </div>
    </>
  );
}
