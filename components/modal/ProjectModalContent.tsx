"use client";

import type { ContentItem } from "@/lib/portfolio";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ProjectDetail } from "@/components/showcase/ProjectDetail";

interface ProjectModalContentProps {
  content: ContentItem;
  onClose: () => void;
}

/**
 * Project detail modal: the shared ProjectDetail body under a modal header.
 * The showcase window uses ProjectDetail directly (page transition, no modal);
 * this thin wrapper stays for mobile/StandardView, which still open a dialog.
 */
export function ProjectModalContent({ content, onClose }: ProjectModalContentProps) {
  return (
    <>
      <ModalHeader id={content.id} title={content.title} subtitle={content.date} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        <ProjectDetail content={content} />
      </div>
    </>
  );
}
