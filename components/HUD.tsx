"use client";

import { Books, Monitor, TerminalWindow } from "@phosphor-icons/react";
import { Button } from "@/components/Button";

interface HUDProps {
  onToggleStandard: () => void;
  onOpen: (id: string) => void;
}

const FABs: { id: string; label: string; icon: typeof Monitor }[] = [
  { id: "cs-pensioner-admin", label: "Case studies", icon: Monitor },
  { id: "jrn-japanese", label: "Learning journal", icon: Books },
  { id: "resume", label: "Resume", icon: TerminalWindow },
];

/**
 * Desktop HUD overlaying the 3D canvas (z-10; canvas renders at z-[-1]
 * below this in the future). The root is pointer-events-none so the canvas
 * underneath stays interactive; only the controls opt back in.
 */
export function HUD({ onToggleStandard, onOpen }: HUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Top-left name mark */}
      <div className="pointer-events-auto absolute left-6 top-6 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 bg-primary"
        />
        <span className="font-display text-lg leading-none text-text-primary">
          Ibang.dev
        </span>
      </div>

      {/* Top-right view toggle */}
      <div className="pointer-events-auto absolute right-6 top-6">
        <Button variant="outline" size="sm" onClick={onToggleStandard}>
          Standard View
        </Button>
      </div>

      {/* Bottom-center hint */}
      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-xs text-text-secondary">
        Drag to rotate · Click glowing objects to inspect
      </p>

      {/* Right-edge floating actions */}
      <div
        role="group"
        aria-label="Open content"
        className="pointer-events-auto absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-3"
      >
        {FABs.map((fab) => {
          const Icon = fab.icon;
          return (
            <button
              key={fab.id}
              type="button"
              aria-label={fab.label}
              onClick={() => onOpen(fab.id)}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-surface/80 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-[1px]"
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
