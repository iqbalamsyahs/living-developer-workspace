import type { PortfolioData } from "./portfolio";

export type Vec3 = [number, number, number];

export type RoomId = "about" | "showcase" | "stack" | "experience" | "journal" | "contact";

export const ROOM_ORDER: RoomId[] = ["about", "showcase", "stack", "experience", "journal", "contact"];

export const ROOM_LABELS: Record<RoomId, string> = {
  about: "About",
  showcase: "Projects",
  stack: "Stack",
  experience: "Experience",
  journal: "Journal",
  contact: "Contact",
};

/** A room object in three.js space (y up); `position` is the box center. */
export interface Box {
  position: Vec3;
  size: Vec3;
  color: string;
  glow?: boolean;
}

/**
 * Converts a design-spec sketch row `[x, y, z, w, d, h]` (x/y on the floor,
 * z up) into a centered three.js box (y up).
 */
export function fromSketch(x: number, y: number, z: number, w: number, d: number, h: number, color: string, glow?: boolean): Box {
  return { position: [x + w / 2, z + h / 2, y + d / 2], size: [w, h, d], color, glow };
}

/** Non-clickable furniture: room shell, window, lamp, desk, chair, rug, wall shelf, plant. */
export const DECOR: Box[] = [
  fromSketch(0, 0, -0.2, 6, 6, 0.2, "#6b4a3a"), // floor
  fromSketch(-0.2, 0, 0, 0.2, 6, 4, "#3b3050"), // left wall
  fromSketch(0, -0.2, 0, 6, 0.2, 4, "#453a5c"), // back wall
  fromSketch(1.2, 0, 1.9, 2, 0.05, 1.4, "#3d5a9e", true), // window
  fromSketch(0, 1.6, 2.3, 0.35, 1.4, 0.08, "#a9744f"), // wall shelf board
  fromSketch(0.04, 1.65, 2.38, 0.27, 1.2, 0.15, "#c9915a"), // wall shelf books
  fromSketch(0.8, 0.2, 1, 2.8, 1.2, 0.12, "#a9744f"), // desk top
  fromSketch(0.8, 0.2, 0, 0.12, 1.2, 1, "#a9744f"), // desk leg (left)
  fromSketch(3.48, 0.2, 0, 0.12, 1.2, 1, "#a9744f"), // desk leg (right)
  fromSketch(0.92, 0.42, 1.6, 0.3, 0.3, 0.12, "#ffcf7a", true), // lamp head
  fromSketch(1.9, 1.7, 0, 0.8, 0.8, 0.55, "#3d4a66"), // chair
  fromSketch(3.2, 2.6, 0, 2.2, 2.6, 0.03, "#7a5c8a"), // rug
  fromSketch(5.2, 5.1, 0.4, 0.6, 0.6, 0.25, "#6b4a3a"), // plant pot
  fromSketch(5.25, 5.15, 0.65, 0.5, 0.5, 0.45, "#4f8a5b"), // plant leaves
];

interface CameraPose {
  position: Vec3;
  target: Vec3;
}

function cameraFor(target: Vec3, offset: Vec3): CameraPose {
  return { position: [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]], target };
}

const monitorScreen = fromSketch(1.6, 0.4, 1.45, 1.2, 0.08, 0.7, "#9be7c4", true);
const bookshelfCase = fromSketch(4.6, 0.2, 0, 1.2, 0.5, 2.6, "#8a5e41");
const bedFrame = fromSketch(0.2, 3.2, 0, 2, 2.6, 0.45, "#4a3a33");
const pc = fromSketch(3.0, 0.4, 1.12, 0.35, 0.8, 0.8, "#1f2430");
const poster = fromSketch(0, 4.0, 2.0, 0.04, 1.2, 1.4, "#e0a458");
const phone = fromSketch(1.25, 1.0, 1.12, 0.18, 0.32, 0.03, "#111111");

export const OBJECTS: Record<RoomId, { boxes: Box[]; camera: CameraPose }> = {
  about: {
    boxes: [
      bedFrame,
      fromSketch(0.2, 3.2, 0.45, 2, 2.6, 0.15, "#d8c9b8"), // mattress
      fromSketch(0.3, 3.3, 0.6, 1.4, 0.5, 0.08, "#d8c9b8"), // pillow
      fromSketch(0.2, 3.9, 0.6, 2, 1.9, 0.1, "#b5544d"), // blanket
    ],
    camera: cameraFor(bedFrame.position, [3, 2.2, 3]),
  },
  showcase: {
    boxes: [
      fromSketch(2.1, 0.34, 1.12, 0.2, 0.2, 0.33, "#2a2a2a"), // monitor stand
      monitorScreen,
    ],
    camera: cameraFor(monitorScreen.position, [2.2, 1, 2.6]),
  },
  stack: {
    boxes: [pc],
    camera: cameraFor(pc.position, [2.2, 1, 2.6]),
  },
  experience: {
    boxes: [poster],
    camera: cameraFor(poster.position, [3.0, 0.5, 2.0]),
  },
  journal: {
    boxes: [
      bookshelfCase,
      fromSketch(4.65, 0.25, 0.3, 1.1, 0.4, 2.0, "#c9915a"), // book spines
    ],
    camera: cameraFor(bookshelfCase.position, [2.5, 1.0, 3.0]),
  },
  contact: {
    boxes: [phone],
    camera: cameraFor(phone.position, [2.0, 1.5, 2.5]),
  },
};

export const OVERVIEW: CameraPose = { position: [15, 11, 15], target: [3, 1.2, 3] };

export const ORBIT_LIMITS = {
  minAzimuth: 0.2,
  maxAzimuth: Math.PI / 2 - 0.2,
  minPolar: 0.55,
  maxPolar: 1.25,
  minDistance: 7,
  maxDistance: 24,
};

/** Keeps an orbit target inside the room, away from walls and floor/ceiling. */
export function clampTarget([x, y, z]: Vec3): Vec3 {
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return [clamp(x, 1, 5), clamp(y, 0.5, 2.5), clamp(z, 1, 5)];
}

/** Which room objects are clickable, given CMS content, in nav order. */
export function activeRoomIds(p: PortfolioData): RoomId[] {
  const about = p.items.about;
  const stack = p.items.stack;
  const contact = p.items.contact.contact;
  const active: Record<RoomId, boolean> = {
    about: about.body.length > 0 || !!about.philosophy || !!about.photo?.asset?._ref,
    showcase: p.projects.length > 0,
    stack: !!stack.stack?.length || !!stack.services?.length,
    experience: !!about.experiences?.length,
    journal: p.journalEntries.length > 0,
    contact: !!contact?.email || !!contact?.socials?.length,
  };
  return ROOM_ORDER.filter((id) => active[id]);
}
