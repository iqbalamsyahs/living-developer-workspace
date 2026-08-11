"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/Button";

interface ModalHeaderProps {
  id: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

/**
 * Shared header for every content modal: title (named by ariaLabelledBy in
 * Modal), optional subtitle/date, and a ghost close button.
 */
export function ModalHeader({ id, title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-primary/10 p-8 pb-6">
      <div className="min-w-0">
        <h2 id={`${id}-title`} className="font-display text-2xl leading-none">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="shrink-0 p-1.5"
      >
        <Cross2Icon width={16} height={16} aria-hidden="true" />
      </Button>
    </header>
  );
}
