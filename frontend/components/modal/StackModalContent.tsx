"use client";

import type { ContentItem, StackCategory } from "@/lib/portfolio";
import { TechPill } from "@/components/ui/TechPill";
import { ModalHeader } from "@/components/ui/ModalHeader";

interface StackModalContentProps {
  content: ContentItem;
  /** Override category labels from siteConfig; falls back to code defaults. */
  categoryLabels?: Record<StackCategory, string>;
  onClose: () => void;
}

// DESIGN.md: solid green for core stack, solid violet for languages and
// design tools, outline for everything else.
const CATEGORY_VARIANT: Record<StackCategory, "default" | "language" | "tool"> = {
  framework: "default",
  language: "language",
  tool: "tool",
  cloud: "default",
};

const DEFAULT_LABELS: Record<StackCategory, string> = {
  framework: "Frameworks",
  language: "Languages",
  tool: "Tools",
  cloud: "Cloud & Infra",
};

/**
 * My Stack & My Services modal: the tech stack grouped by category (bento
 * feel via pill rows), then services as bordered cards. Opened by the
 * whiteboard on the desk.
 */
export function StackModalContent({
  content,
  categoryLabels = DEFAULT_LABELS,
  onClose,
}: StackModalContentProps) {
  const stack = content.stack ?? [];
  const categories = [...new Set(stack.map((item) => item.category))];
  const services = content.services ?? [];

  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-8">
        {categories.map((category) => (
          <section key={category} className="mb-8">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-text-secondary">
              {categoryLabels[category]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {stack
                .filter((item) => item.category === category)
                .map((item) => (
                  <TechPill
                    key={item.name}
                    label={item.name}
                    variant={CATEGORY_VARIANT[category]}
                  />
                ))}
            </div>
          </section>
        ))}

        {services.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.name}
                className="rounded-md border border-primary/10 bg-surface p-5"
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
      </div>
    </>
  );
}
