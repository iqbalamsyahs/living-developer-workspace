"use client";

import { getOverlayRoot } from "./overlayRoot";
import { useRef, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { Cross2Icon } from "@radix-ui/react-icons";
import { categoryLabel, type ContentItem, type SiteConfig, type StackCategory } from "@/lib/portfolio";
import { TechPill } from "../ui/TechPill";
import { Button } from "../ui/Button";

interface StackScreenProps {
  /** World-space centre of the board face (already offset toward the camera). */
  position: [number, number, number];
  content: ContentItem;
  categoryLabels: SiteConfig["categoryLabels"];
  onClose: () => void;
}

// drei <Html transform> world size = cssPx * distanceFactor / 400, so 400 css px = 1 world unit.
// The board's writable face is ~1.0 x 0.7 world.
const CSS_W = 400;
const CSS_H = 280;

const VARIANT: Record<StackCategory, "default" | "language" | "tool"> = {
  framework: "default",
  language: "language",
  tool: "tool",
  cloud: "default",
  database: "default",
};

/** Whiteboard panel: stack grouped by category plus services. Empty groups are not rendered. */
export function StackScreen({ position, content, categoryLabels, onClose }: StackScreenProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  if (portalRef.current === null) portalRef.current = getOverlayRoot();

  const stack = content.stack ?? [];
  const services = content.services ?? [];
  const categories = [...new Set(stack.map((item) => item.category))];

  return (
    <Html
      portal={portalRef as RefObject<HTMLElement>}
      transform
      distanceFactor={1}
      center
      position={position}
      zIndexRange={[30, 0]}
      occlude={false}
    >
      <div
        style={{ width: CSS_W, height: CSS_H }}
        className="flex flex-col overflow-hidden rounded-xs border border-primary/25 bg-surface/95 shadow-[0_0_24px_rgba(0,0,0,0.55)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary/10 px-4 py-2">
          <h2 className="truncate font-display text-base text-text-primary">{content.title}</h2>
          <Button variant="ghost" size="sm" aria-label="Close board" onClick={onClose} className="shrink-0 p-1">
            <Cross2Icon width={14} height={14} aria-hidden="true" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3" style={{ overscrollBehavior: "contain" }}>
          {categories.map((category) => (
            <section key={category} className="mb-3">
              <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
                {categoryLabel(categoryLabels, category)}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {stack
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <TechPill key={item.name} label={item.name} variant={VARIANT[category]} />
                  ))}
              </div>
            </section>
          ))}
          {services.length > 0 && (
            <section>
              <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">Services</h3>
              <ul className="space-y-1.5">
                {services.map((service) => (
                  <li key={service.name} className="rounded-xs border border-primary/15 px-2.5 py-1.5">
                    <p className="text-xs font-medium text-text-primary">{service.name}</p>
                    {service.description && <p className="text-[11px] leading-snug text-text-secondary">{service.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Html>
  );
}
