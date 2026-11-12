"use client";

import { getOverlayRoot } from "./overlayRoot";
import { useRef, useState, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { ShowcaseGrid } from "../showcase/ShowcaseGrid";
import { ProjectDetail } from "../showcase/ProjectDetail";
import { Button } from "../ui/Button";

interface ShowcaseScreenProps {
  /** World-space anchor: the PC monitor screen center. The panel sticks to it
   *  and follows the camera, so it reads as content rendered on the monitor. */
  position: [number, number, number];
  /** Pixel size of the rendered panel. Sized from the monitor glass's world
   *  bounds so the panel overlays the actual screen. */
  widthPx: number;
  heightPx: number;
  content: ContentItem;
  projects: ContentItem[];
  onClose: () => void;
}

/**
 * Showcase rendered on the PC monitor in 3D space as a browser window: a
 * toolbar chrome (back/forward, address bar, close) over the project grid.
 * Clicking a card slides the whole window content to that project's detail
 * page — a browser-like page transition, no modal. "← Back to Projects"
 * slides back. Inside a drei <Html> anchor; the native <dialog> is
 * intentionally bypassed so the grid lives in the scene.
 * portal={getOverlayRoot()} lifts it out of the aria-hidden canvas wrapper; the
 * zIndexRange keeps it above the HUD (z-10) but below any open <dialog>.
 *
 * The projected glass bounds include bezels and model padding, so the panel is
 * scaled down to sit inside the actual display area.
 */
const GLASS_SCALE = 0.8; // panel size as a fraction of the glass projection

export function ShowcaseScreen({
  position,
  widthPx,
  heightPx,
  content,
  projects,
  onClose,
}: ShowcaseScreenProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  // drei Html resolves `portal.current` during render (falls back to the canvas
  // wrapper otherwise), so initialize the ref in render, not an effect. The
  // null-check is idempotent, so the ref-init lint rule accepts it.
  if (portalRef.current === null) portalRef.current = getOverlayRoot();

  // Window-internal navigation: which project detail (if any) is open. Both
  // panes stay mounted so the grid's scroll position survives Back.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

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
        className="pointer-events-auto flex flex-col overflow-hidden bg-surface"
      >
        {/* Window chrome: browser-style toolbar above the monitor screen. The
            header lives here, not in the grid, so it stays fixed while the
            grid scrolls underneath. */}
        <div className="flex shrink-0 items-center gap-3 border-b border-primary/10 px-3 py-2">
          <ChevronLeftIcon width={14} height={14} className="text-text-secondary/40" aria-hidden="true" />
          <ChevronRightIcon width={14} height={14} className="text-text-secondary/40" aria-hidden="true" />
          <div
            title={selected?.title ?? content.title}
            className="flex flex-1 items-center gap-2 rounded-sm border border-primary/10 bg-background px-2 py-0.5 font-mono text-[11px] text-text-secondary"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="truncate">
              portofolio.dev/{selected?.title ?? content.id}
            </span>
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

        {/* Page track: grid and detail sit side by side; the whole window
            slides between them. flex-1 fills panel minus the chrome, so the
            scroll panes get the real content height. */}
        <div
          className="flex min-h-0 flex-1 transition-transform duration-300 ease-out"
          style={{ transform: selected ? "translateX(-100%)" : "translateX(0)" }}
        >
          {/* Pane 1: bento grid. Constrained to the window height so it scrolls
              when the grid is taller; the grid itself keeps content height. */}
          <div className="h-full w-full shrink-0 scrollbar-none overflow-y-auto">
            <ShowcaseGrid projects={projects} onOpen={setSelectedId} />
          </div>

          {/* Pane 2: project detail page */}
          <div className="h-full w-full shrink-0 scrollbar-none overflow-y-auto">
            {selected ? (
              <>
                <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-primary/10 bg-surface/95 px-3 py-2 backdrop-blur">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="p-1"
                  >
                    <ChevronLeftIcon width={16} height={16} aria-hidden="true" />
                    <span className="text-xs">Back to Projects</span>
                  </Button>
                </div>
                <header className="border-b border-primary/10 px-8 pt-6 pb-4">
                  <h2 className="font-display text-xl leading-none text-text-primary">
                    {selected.title}
                  </h2>
                  {selected.date && (
                    <p className="mt-1.5 text-xs text-text-secondary">{selected.date}</p>
                  )}
                </header>
                <ProjectDetail content={selected} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Html>
  );
}
