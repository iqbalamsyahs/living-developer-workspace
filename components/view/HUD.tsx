"use client";

import {
  CodeIcon,
  DesktopIcon,
  MobileIcon,
  PersonIcon,
  ReaderIcon,
  StackIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/Button";

interface HUDProps {
  brand: string;
  navItems: { id: string; label: string }[];
  onToggleStandard: () => void;
  onOpen: (id: string) => void;
  /** True while the showcase is zoomed on the monitor; hides the orbit hint. */
  zoomed: boolean;
}

/** Icon per content id; anything unknown falls back to a generic square. */
const ICONS: Record<string, typeof DesktopIcon> = {
  showcase: DesktopIcon,
  about: PersonIcon,
  stack: StackIcon,
  contact: MobileIcon,
  resume: CodeIcon,
  "jrn-japanese": ReaderIcon,
};
const FALLBACK_ICON = DesktopIcon;

/**
 * Desktop HUD overlaying the 3D canvas (z-10; canvas renders at z-[-1]
 * below this in the future). The root is pointer-events-none so the canvas
 * underneath stays interactive; only the controls opt back in.
 */
export function HUD({ brand, navItems, onToggleStandard, onOpen, zoomed }: HUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Top-left name mark */}
      <div className="pointer-events-auto absolute left-6 top-6 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 bg-primary"
        />
        <span className="font-display text-lg leading-none text-text-primary">
          {brand}
        </span>
      </div>

      {/* Top-right view toggle */}
      <div className="pointer-events-auto absolute right-6 top-6">
        <Button variant="outline" size="sm" onClick={onToggleStandard}>
          Standard View
        </Button>
      </div>

      {/* Bottom-center hint (hidden while zoomed into the PC) */}
      {!zoomed && (
        <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-xs text-text-secondary">
          Drag to rotate · Click glowing objects to inspect
        </p>
      )}

      {/* Right-edge floating actions */}
      <div
        role="group"
        aria-label="Open content"
        className="pointer-events-auto absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-3"
      >
        {navItems.map((item) => {
          const Icon = ICONS[item.id] ?? FALLBACK_ICON;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => onOpen(item.id)}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-surface/80 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-[1px]"
            >
              <Icon width={18} height={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
