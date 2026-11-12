"use client";

import { useRef, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { RichText } from "../ui/RichText";
import { ExperienceTimeline } from "../ExperienceTimeline";
import { Button } from "../ui/Button";

interface AboutScreenProps {
  /** World-space anchor: the open book's page top-center (page surface). The
   *  panel sticks to it as a flat 3D plane facing up, so it reads as the book's
   *  pages when the camera parks above. Derived in DesktopScene from the book's
   *  MODEL_LAYOUT (page top-center = group origin + local offset, at world
   *  y ≈ 0.9828). A slight lift keeps it off the page surface. */
  position: [number, number, number];
  /** Pixel size of the rendered panel (reported by GlassProjector). Unused in
   *  transform mode — the plane is sized in world units via distanceFactor. */
  widthPx?: number;
  heightPx?: number;
  content: ContentItem;
  onClose: () => void;
}

// drei <Html transform> sizes its plane as: worldSize = cssPx * distanceFactor / 400.
// The open page footprint (from SCREENS.about) is ~0.336 (long) x ~0.238 (short)
// world. df=1 → 1 css px = 0.0025 world, so a 128x86 css panel is ~0.32x0.215
// world — just inside the page. Landscape (W>H) so About/Experience read side by
// side like an open book. Tune df / css size with NEXT_PUBLIC_DEBUG_SCENE=true.
const DISTANCE_FACTOR = 1;
const CSS_W = 128;
const CSS_H = 86;
// Lift the plane a hair above the page top (world y ≈ 0.9828) so it never
// z-fights; Html occlude={false} keeps it drawn over the book regardless.
const PANEL_Y = 0.983;
// Panel faces UP (+Y) and is yawed so its CSS width aligns with the book's LONG
// axis (raw Z spread) and CSS height with the SHORT spine axis — i.e. landscape.
// Derived from the MODEL_LAYOUT transform [0,5,π/2] @ scale 0.13: basis
// ex=longAxis[-0.9589,0,0.2837], ey=shortAxis[-0.2837,0,-0.9589], ez=[0,1,0]
// → Euler(XYZ) [-π/2, 0, -2.854]. (An earlier -1.2832 mapped width onto the
// short axis, rendering the panel vertical/upright — wrong here.)
const PANEL_ROTATION: [number, number, number] = [-Math.PI / 2, 0, -2.854];

/**
 * "Open book" panel: About on the left page, Experience on the right, rendered
 * as a flat 3D plane (<Html transform>) laid on the open-book model's pages.
 * The camera parks above the book (camDir +Y), so the plane — rotated to face
 * up and yawed with the book — reads with About on screen-left, Experience on
 * screen-right. Attribution per the model's CC-BY-4.0 license (Zayfert1999).
 */
export function AboutScreen({ position, content, onClose }: AboutScreenProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  if (portalRef.current === null) portalRef.current = document.body;

  return (
    <Html
      portal={portalRef as RefObject<HTMLElement>}
      transform
      distanceFactor={DISTANCE_FACTOR}
      center
      position={[position[0], PANEL_Y, position[2]]}
      rotation={PANEL_ROTATION}
      zIndexRange={[30, 0]}
      occlude={false}
    >
      <div
        style={{ width: CSS_W, height: CSS_H }}
        className="flex flex-col overflow-hidden rounded-xs border border-primary/25 bg-surface/95 shadow-[0_0_24px_rgba(0,0,0,0.55)]"
      >
        {/* Header strip */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary/10 px-3 py-1.5">
          <h2 className="truncate font-display text-[12px] text-text-primary">
            {content.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close book"
            onClick={onClose}
            className="shrink-0 p-1"
          >
            <Cross2Icon width={13} height={13} aria-hidden="true" />
          </Button>
        </div>

        {/* Two pages split by a spine overlay */}
        <div className="relative grid min-h-0 flex-1 grid-cols-2">
          {/* Left page — About */}
          <div className="min-w-0 overflow-y-auto px-2.5 py-2">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-text-secondary">
              About
            </p>
            <RichText value={content.body} className="text-[10px] leading-relaxed" />
            {content.philosophy && (
              <blockquote className="mt-2 border-l-2 border-primary/50 pl-2 text-[10px] italic text-primary/90">
                {content.philosophy}
              </blockquote>
            )}
          </div>

          {/* Right page — Experience */}
          <div className="min-w-0 overflow-y-auto border-l border-primary/15 px-2.5 py-2">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-text-secondary">
              Experience
            </p>
            {content.experiences && content.experiences.length > 0 ? (
              <ExperienceTimeline experiences={content.experiences} />
            ) : (
              <p className="text-[10px] text-text-secondary">No experience yet.</p>
            )}
          </div>

          {/* Spine overlay down the fold */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-linear-to-b from-primary/50 via-primary/20 to-primary/50"
          />
        </div>

        {/* CC-BY-4.0 attribution (required by the model license). */}
        <p className="shrink-0 truncate border-t border-primary/10 px-2.5 py-1 text-[8px] text-text-secondary/70">
          Book model © Zayfert1999 · CC-BY-4.0
        </p>
      </div>
    </Html>
  );
}
