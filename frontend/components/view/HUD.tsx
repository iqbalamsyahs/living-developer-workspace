"use client";

import {
  DesktopIcon,
  IdCardIcon,
  MobileIcon,
  PersonIcon,
  ReaderIcon,
  StackIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/Button";
import { useLocalTime } from "@/hooks/useLocalTime";
import { zoneLabel } from "@/lib/time";
import type { Availability } from "@/lib/portfolio";
import type { RoomId } from "@/lib/room";

interface HUDProps {
  brand: string;
  /** Active room objects, in nav order. */
  nav: { id: RoomId; label: string }[];
  /** True while the room panel is open; hides the hint and moves the side controls off it. */
  panelOpen: boolean;
  onToggleStandard: () => void;
  onOpen: (id: RoomId) => void;
  /** Room whose panel is open, for aria-pressed. */
  openId?: RoomId | null;
  hireMeHref?: string;
  resumeHref?: string;
  availability?: Availability;
}

const LINK_BASE =
  "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors active:translate-y-[1px]";

function AvailabilityBadge({ availability }: { availability: Availability }) {
  const zone = availability.timezone || "Asia/Jakarta";
  const time = useLocalTime(zone);
  return (
    <p className="flex items-center gap-2 font-mono text-xs text-text-secondary">
      <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
      <span>{availability.statusText || "Available for work"}</span>
      {time && (
        <span className="tabular-nums">
          · {zoneLabel(zone)} {time}
        </span>
      )}
    </p>
  );
}

const ICONS: Record<RoomId, typeof DesktopIcon> = {
  showcase: DesktopIcon,
  about: PersonIcon,
  stack: StackIcon,
  experience: IdCardIcon,
  journal: ReaderIcon,
  contact: MobileIcon,
};

/** RoomPanel is w-[min(28rem,50vw)]; while open, right-edge controls sit just left of it. */
const LEFT_OF_PANEL = "right-[calc(min(28rem,50vw)+1.5rem)]";

/**
 * Desktop HUD overlaying the 3D canvas (z-10; canvas renders at z-0
 * below this in the future). The root is pointer-events-none so the canvas
 * underneath stays interactive; only the controls opt back in.
 */
export function HUD({
  brand,
  nav,
  panelOpen,
  onToggleStandard,
  onOpen,
  openId,
  hireMeHref,
  resumeHref,
  availability,
}: HUDProps) {
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

      {/* Top-right actions; shift left of the room panel so its close button stays clear */}
      <div className={`pointer-events-auto absolute top-6 flex items-center gap-3 ${panelOpen ? LEFT_OF_PANEL : "right-6"}`}>
        {availability?.isAvailable && !panelOpen && <AvailabilityBadge availability={availability} />}
        {resumeHref && (
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${LINK_BASE} text-text-secondary hover:bg-surface hover:text-text-primary`}
          >
            Resume
          </a>
        )}
        {nav.some((n) => n.id === "contact") && (
          <Button variant="ghost" size="sm" onClick={() => onOpen("contact")}>
            Contact
          </Button>
        )}
        {hireMeHref && (
          <a
            href={hireMeHref}
            {...(hireMeHref.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`${LINK_BASE} bg-primary text-primary-ink hover:bg-primary/90`}
          >
            Hire me
          </a>
        )}
        <Button variant="outline" size="sm" onClick={onToggleStandard}>
          Standard View
        </Button>
      </div>


      {!panelOpen && (
        <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-xs text-text-secondary">
          Drag to rotate · Scroll to zoom · Click an object to open it
        </p>
      )}

      {/* Right-edge floating actions */}
      <div
        role="group"
        aria-label="Open content"
        className={`pointer-events-auto absolute top-1/2 flex -translate-y-1/2 flex-col gap-3 ${panelOpen ? `max-lg:hidden ${LEFT_OF_PANEL}` : "right-6"}`}
      >
        {nav.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-pressed={openId === item.id}
              data-room={item.id}
              onClick={() => onOpen(item.id)}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-surface/80 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px"
            >
              <Icon width={18} height={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
