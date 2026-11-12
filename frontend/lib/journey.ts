import type { PortfolioData } from "./portfolio";

export type StopId = "intro" | "about" | "stack" | "experience" | "showcase" | "journal" | "contact";

export interface Stop {
  id: StopId;
  /** Key into ZOOM_VIEWS, or null for the full-desk overview pose. */
  zoomTarget: "about" | "stack" | "pc" | "contact" | null;
  label: string;
}

/** Story order; stops whose content is empty are skipped. intro, about and contact always exist. */
export function buildStops(p: PortfolioData): Stop[] {
  const stack = p.items.stack;
  const hasStack = (stack?.stack?.length ?? 0) > 0 || (stack?.services?.length ?? 0) > 0;
  const hasExperience = (p.items.about?.experiences?.length ?? 0) > 0;
  const stops: (Stop | false)[] = [
    { id: "intro", zoomTarget: null, label: "Intro" },
    { id: "about", zoomTarget: "about", label: "About" },
    hasStack && { id: "stack", zoomTarget: "stack", label: "Stack" },
    hasExperience && { id: "experience", zoomTarget: null, label: "Experience" },
    p.projects.length > 0 && { id: "showcase", zoomTarget: "pc", label: "Projects" },
    p.journalEntries.length > 0 && { id: "journal", zoomTarget: null, label: "Journal" },
    { id: "contact", zoomTarget: "contact", label: "Contact" },
  ];
  return stops.filter((s): s is Stop => s !== false);
}

/** One viewport of scroll per stop. */
export function scrollTopFor(index: number, viewportH: number): number {
  return index * viewportH;
}

export function nearestStopIndex(scrollY: number, viewportH: number, count: number): number {
  if (count <= 0 || viewportH <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(scrollY / viewportH)));
}

/** scrollTop to settle on, or null when already within 2px of a stop. */
export function snapTarget(scrollY: number, viewportH: number, count: number): number | null {
  const top = scrollTopFor(nearestStopIndex(scrollY, viewportH, count), viewportH);
  return Math.abs(scrollY - top) <= 2 ? null : top;
}

/** Stop that shows a content id (object click, HUD item); -1 when it has no stop (resume, no data). */
export function stopIndexForContent(stops: Stop[], contentId: string, journalIds: string[]): number {
  const stopId: StopId | null =
    contentId === "showcase" || contentId === "about" || contentId === "stack" || contentId === "contact"
      ? contentId
      : journalIds.includes(contentId)
        ? "journal"
        : null;
  return stopId ? stops.findIndex((s) => s.id === stopId) : -1;
}
