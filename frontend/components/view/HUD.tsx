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
  /** Closes the room panel; a second press on the pressed nav button routes here. */
  onClose: () => void;
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
 * Desktop HUD overlaying the 3D canvas (HUD z-10, canvas z-0). The root is pointer-events-none so the canvas
 * underneath stays interactive; only the controls opt back in.
 */
export function HUD({
  brand,
  nav,
  panelOpen,
  onToggleStandard,
  onOpen,
  onClose,
  openId,
  hireMeHref,
  resumeHref,
  availability,
}: HUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Brand left, actions right in one row bounded by the viewport (or the open panel); actions wrap instead of overlapping the brand. */}
      <div className={`absolute left-6 top-6 flex items-start justify-between gap-3 ${panelOpen ? LEFT_OF_PANEL : "right-6"}`}>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-sm bg-surface/90 px-3 py-2 backdrop-blur">
          <span
            aria-hidden="true"
            className="h-2 w-2 bg-primary"
          />
          <span className="font-display text-lg leading-none text-text-primary">
            {brand}
          </span>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-3 rounded-sm bg-surface/90 px-2 py-1 backdrop-blur">
          {availability?.isAvailable && !panelOpen && (
            <div className="max-xl:hidden">
              <AvailabilityBadge availability={availability} />
            </div>
          )}
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
            // With the panel open the bar is narrower; the phone nav button still reaches Contact.
            <Button variant="ghost" size="sm" onClick={() => onOpen("contact")} className={panelOpen ? "max-xl:hidden" : ""}>
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
            Simple page
          </Button>
        </div>
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
              onClick={() => (openId === item.id ? onClose() : onOpen(item.id))}
              className="group relative flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-surface/80 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px"
            >
              <Icon width={18} height={18} aria-hidden="true" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-sm border border-line bg-surface px-2 py-1 font-display text-xs text-text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
