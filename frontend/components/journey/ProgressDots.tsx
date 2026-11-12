"use client";

import type { KeyboardEvent } from "react";
import type { Stop } from "@/lib/journey";

interface ProgressDotsProps {
  stops: Stop[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ProgressDots({ stops, activeIndex, onSelect }: ProgressDotsProps) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const buttons = [...e.currentTarget.querySelectorAll("button")];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(at + step + buttons.length) % buttons.length]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Journey progress"
      onKeyDown={onKey}
      className="pointer-events-auto fixed bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3"
    >
      <div className="flex items-center">
        {stops.map((stop, i) => (
          <button
            key={stop.id}
            type="button"
            aria-label={`Go to ${stop.label}`}
            aria-current={i === activeIndex ? "step" : undefined}
            title={stop.label}
            onClick={() => onSelect(i)}
            className="group flex h-6 w-5 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              className={`block rounded-full transition-all motion-reduce:transition-none ${
                i === activeIndex ? "h-2.5 w-2.5 bg-primary" : "h-1.5 w-1.5 bg-text-secondary/60 group-hover:bg-primary/70"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="font-mono text-xs tabular-nums text-text-secondary">
        {pad(activeIndex + 1)}/{pad(stops.length)}
      </span>
    </div>
  );
}
