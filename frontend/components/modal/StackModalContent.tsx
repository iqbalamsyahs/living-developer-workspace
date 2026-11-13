"use client";

import { useState, type KeyboardEvent } from "react";
import { categoryLabel, type ContentItem, type StackCategory } from "@/lib/portfolio";
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
  database: "default",
};

const DEFAULT_LABELS: Record<StackCategory, string> = {
  framework: "Frameworks",
  language: "Languages",
  tool: "Tools",
  cloud: "Cloud & Infra",
  database: "Databases",
};

/**
 * Stack & Services modal: the tech stack grouped by category (bento
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
  const tabs = [
    ...(stack.length > 0 ? (["stack"] as const) : []),
    ...(services.length > 0 ? (["services"] as const) : []),
  ];
  const [selected, setSelected] = useState<"stack" | "services">("stack");
  const active = tabs.includes(selected) ? selected : (tabs[0] ?? "stack");

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(tabs.indexOf(active) + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setSelected(next);
    document.getElementById(`${content.id}-tab-${next}`)?.focus();
  };

  return (
    <>
      <ModalHeader id={content.id} title={content.title} onClose={onClose} />

      {tabs.length > 1 && (
        <div role="tablist" aria-label="Stack and services" className="flex gap-2 border-b border-primary/10 px-8 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`${content.id}-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={active === tab}
              aria-controls={`${content.id}-panel`}
              tabIndex={active === tab ? 0 : -1}
              onClick={() => setSelected(tab)}
              onKeyDown={onTabKey}
              className={`-mb-px border-b-2 px-3 py-2 font-display text-sm transition-colors ${
                active === tab
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab === "stack" ? "Stack" : "Services"}
            </button>
          ))}
        </div>
      )}

      <div
        id={`${content.id}-panel`}
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tabs.length > 1 ? `${content.id}-tab-${active}` : undefined}
        className="flex-1 overflow-y-auto p-8"
      >
        {active === "stack" && categories.map((category) => (
          <section key={category} className="mb-8">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-text-secondary">
              {categoryLabel(categoryLabels, category)}
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

        {active === "services" && services.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
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
