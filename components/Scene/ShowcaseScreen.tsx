"use client";

import { useRef, type RefObject } from "react";
import { Html } from "@react-three/drei";
import type { ContentItem } from "@/lib/portfolio";
import { ShowcaseModalContent } from "@/components/ShowcaseModalContent";

interface ShowcaseScreenProps {
  /** World-space anchor: the PC monitor screen center. The panel sticks to it
   *  and follows the camera, so it reads as content rendered on the monitor. */
  position: [number, number, number];
  content: ContentItem;
  caseStudies: ContentItem[];
  onOpen: (id: string) => void;
  onClose: () => void;
}

/**
 * Showcase list rendered on the PC monitor in 3D space. Reuses
 * ShowcaseModalContent (header + card list) inside a drei <Html> anchor; the
 * native <dialog> is intentionally bypassed so the list lives in the scene.
 * portal={document.body} lifts it out of the z-[-1] canvas wrapper; the
 * zIndexRange keeps it above the HUD (z-10) but below any open <dialog>.
 */
export function ShowcaseScreen({
  position,
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
      <div className="flex max-h-80 w-110 flex-col overflow-hidden rounded-md border border-primary/20 bg-surface/95 shadow-modal-glow backdrop-blur">
        <ShowcaseModalContent
          content={content}
          caseStudies={caseStudies}
          onOpen={onOpen}
          onClose={onClose}
        />
      </div>
    </Html>
  );
}
