"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { toPlainText } from "@/lib/portfolio";
import { Button } from "@/components/Button";
import { TechPill } from "@/components/TechPill";

interface ShowcaseSliderProps {
  caseStudies: ContentItem[];
  /** Open a specific case study; on close the Showcase modal returns. */
  onOpen: (id: string) => void;
}

/**
 * One case study as a mini application window: traffic-light chrome bar on top
 * (the project slug as a fake title), body with title/tech/summary, and a Read
 * action in the footer. The whole card is a click target (bigger hit area);
 * the Read button stops propagation so it doesn't double-fire.
 */
function SliderCard({
  project,
  onOpen,
}: {
  project: ContentItem;
  onOpen: (id: string) => void;
}) {
  return (
    <article
      onClick={() => onOpen(project.id)}
      className="flex h-full cursor-pointer flex-col rounded-md border border-primary/10 bg-surface transition-colors hover:border-primary/40"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-primary/10 px-4 py-2.5">
        <span className="size-2 rounded-full bg-rose-500/70" aria-hidden="true" />
        <span className="size-2 rounded-full bg-amber-400/70" aria-hidden="true" />
        <span className="size-2 rounded-full bg-primary/70" aria-hidden="true" />
        <span className="ml-2 truncate font-mono text-xs text-text-secondary">
          {project.id}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <h3 className="font-display text-lg text-text-primary">{project.title}</h3>
        {project.tech && project.tech.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <TechPill key={tech} label={tech} />
            ))}
          </div>
        )}
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {project.summary ?? `${toPlainText(project.body).slice(0, 140)}…`}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex justify-end border-t border-primary/10 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project.id);
          }}
          className="text-xs"
        >
          Read
          <ArrowRightIcon width={12} height={12} aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

/**
 * One-card-per-slide slider rendered on the 3D monitor. Each slide fills the
 * screen; snap-scrollable with mouse drag (pointer events) or the arrow
 * buttons, with a position counter. Distinct from ShowcaseModalContent's
 * vertical list, which stays for the dialog fallback. The camera is locked
 * while the monitor is zoomed, so dragging here never fights the orbit
 * controls.
 */
export function ShowcaseSlider({ caseStudies, onOpen }: ShowcaseSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const count = caseStudies.length;

  // Drag-to-scroll state. dragStart.x/null = not dragging; moved tracks whether
  // the pointer travelled far enough to be a drag (so a button click after a
  // drag isn't swallowed, and a click without drag still works).
  const drag = useRef<{ startX: number; scrollLeft: number; moved: boolean } | null>(null);

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      setIndex(Math.round(el.scrollLeft / el.clientWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={trackRef}
        aria-label="Showcase projects"
        className={`flex h-full flex-1 snap-x snap-mandatory overflow-auto scroll-smooth ${
          dragging ? "cursor-grabbing select-none" : ""
        }`}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          drag.current = { startX: e.clientX, scrollLeft: e.currentTarget.scrollLeft, moved: false };
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.startX;
          if (Math.abs(dx) > 4) d.moved = true;
          e.currentTarget.scrollLeft = d.scrollLeft - dx;
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          // A real drag must not also click through to a card.
          if (d?.moved) {
            const el = trackRef.current;
            const suppress = (ev: MouseEvent) => {
              ev.preventDefault();
              ev.stopPropagation();
              el?.removeEventListener("click", suppress, true);
            };
            el?.addEventListener("click", suppress, true);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        {caseStudies.map((project) => (
          <div
            key={project.id}
            className="h-full w-full shrink-0 snap-start p-4"
          >
            <SliderCard project={project} onOpen={onOpen} />
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-primary/10 px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Previous project"
          disabled={index === 0}
          onClick={() => step(-1)}
          className="p-1"
        >
          <ChevronLeftIcon width={16} height={16} aria-hidden="true" />
        </Button>
        <p className="text-[11px] tabular-nums text-text-secondary" aria-live="polite">
          {count > 0 ? `${index + 1}/${count}` : "0/0"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Next project"
          disabled={index >= count - 1}
          onClick={() => step(1)}
          className="p-1"
        >
          <ChevronRightIcon width={16} height={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
