"use client";

import { useRef, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { ShowcaseSlider } from "@/components/ShowcaseSlider";
import { Button } from "@/components/Button";

interface ShowcaseScreenProps {
  /** World-space anchor: the PC monitor screen center. The panel sticks to it
   *  and follows the camera, so it reads as content rendered on the monitor. */
  position: [number, number, number];
  /** Pixel size of the rendered panel. Sized from the monitor glass's world
   *  bounds so the panel overlays the actual screen. */
  widthPx: number;
  heightPx: number;
  content: ContentItem;
  caseStudies: ContentItem[];
  onOpen: (id: string) => void;
  onClose: () => void;
}

/**
 * Showcase rendered on the PC monitor in 3D space as a browser window: a
 * toolbar chrome (back/forward, address bar, close) over the ShowcaseSlider
 * cards. Inside a drei <Html> anchor; the native <dialog> is intentionally
 * bypassed so the slider lives in the scene. portal={document.body} lifts it
 * out of the z-[-1] canvas wrapper; the zIndexRange keeps it above the HUD
 * (z-10) but below any open <dialog>.
 *
 * The projected glass bounds include bezels and model padding, so the panel is
 * scaled down to sit inside the actual display area.
 */
const GLASS_SCALE = 0.7; // panel size as a fraction of the glass projection

export function ShowcaseScreen({
  position,
  widthPx,
  heightPx,
  content,
  caseStudies,
  onOpen,
  onClose,
}: ShowcaseScreenProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  // drei Html resolves `portal.current` during render (falls back to the canvas
  // wrapper otherwise), so initialize the ref in render, not an effect. The
  // null-check is idempotent, so the ref-init lint rule accepts it.
  if (portalRef.current === null) portalRef.current = document.body;
  return (
    <Html
      // portalRef.current is set above before drei reads it; the cast narrows
      // the null-slot to the non-null RefObject<HTMLElement> drei expects.
      portal={portalRef as RefObject<HTMLElement>}
      zIndexRange={[30, 0]}
      center
      position={position}
      occlude={false}
    >
      <div
        style={{ width: widthPx * GLASS_SCALE, height: heightPx * GLASS_SCALE }}
        className="flex flex-col overflow-hidden bg-surface"
      >
        {/* Window chrome: browser-style toolbar above the monitor screen. The
            header lives here, not in ShowcaseSlider, so it stays fixed while
            the cards scroll underneath. */}
        <div className="flex shrink-0 items-center gap-3 border-b border-primary/10 px-3 py-2">
          <ChevronLeftIcon width={14} height={14} className="text-text-secondary/40" aria-hidden="true" />
          <ChevronRightIcon width={14} height={14} className="text-text-secondary/40" aria-hidden="true" />
          <div
            title={content.title}
            className="flex flex-1 items-center gap-2 rounded-sm border border-primary/10 bg-background px-2 py-0.5 font-mono text-[11px] text-text-secondary"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="truncate">portofolio.dev/{content.title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Close ${content.title}`}
            onClick={onClose}
            className="p-1"
          >
            <Cross2Icon width={14} height={14} aria-hidden="true" />
          </Button>
        </div>

        {/* Screen content: slider fills the remaining viewport */}
        <div className="min-h-0 flex-1">
          <ShowcaseSlider
            caseStudies={caseStudies}
            onOpen={onOpen}
          />
        </div>
      </div>
    </Html>
  );
}
