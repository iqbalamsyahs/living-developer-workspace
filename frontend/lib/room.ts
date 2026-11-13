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

export type Material = "wood" | "fabric" | "plastic" | "metal" | "glass" | "ceramic";
export type Shape = "box" | "cylinder" | "sphere";

/** A room object in three.js space (y up); `position` is the center, `size` the bounding box. */
export interface Box {
  position: Vec3;
  size: Vec3;
  color: string;
  glow?: boolean;
  mat?: Material;
  shape?: Shape;
}

type BoxOpts = Pick<Box, "glow" | "mat" | "shape">;

/**
 * Converts a design-spec sketch row `[x, y, z, w, d, h]` (x/y on the floor,
 * z up) into a centered three.js box (y up).
 */
export function fromSketch(x: number, y: number, z: number, w: number, d: number, h: number, color: string, opts?: BoxOpts): Box {
  return { position: [x + w / 2, z + h / 2, y + d / 2], size: [w, h, d], color, ...opts };
}

const GLOW: BoxOpts = { glow: true };
const WOOD: BoxOpts = { mat: "wood" };
const FABRIC: BoxOpts = { mat: "fabric" };
const PLASTIC: BoxOpts = { mat: "plastic" };
const METAL: BoxOpts = { mat: "metal" };
const METAL_CYL: BoxOpts = { mat: "metal", shape: "cylinder" };
const LEAF: BoxOpts = { mat: "fabric", shape: "sphere" };

const FLOOR_TONES = ["#6b4a3a", "#74513f", "#624334"];
const BOOK_COLORS = ["#8c3b3b", "#3d4a66", "#c9915a", "#4f6b5a", "#d8c9b8", "#6a4e7a", "#a8613f", "#2c2540"];
const BOOK_W = [0.06, 0.08, 0.05, 0.07, 0.09, 0.06, 0.05, 0.08];
const BOOK_H = [0.42, 0.38, 0.46, 0.4, 0.35, 0.44, 0.48, 0.39];

/**
 * Books packed from `start` to `end` along sketch x (or sketch y when `alongY`), standing on `z`.
 * `across` is where the row begins on the other floor axis; `seed` varies the pattern per shelf.
 */
export function bookRow(start: number, end: number, across: number, depth: number, z: number, scale: number, seed: number, alongY = false): Box[] {
  const out: Box[] = [];
  for (let p = start, i = seed; p + BOOK_W[i % 8] <= end; p += BOOK_W[i % 8], i++) {
    const w = BOOK_W[i % 8] - 0.006;
    const h = BOOK_H[(i * 3) % 8] * scale;
    const color = BOOK_COLORS[(i * 5) % 8];
    out.push(alongY ? fromSketch(across, p, z, depth, w, h, color, FABRIC) : fromSketch(p, across, z, w, depth, h, color, FABRIC));
  }
  return out;
}

function legs(x0: number, y0: number, x1: number, y1: number, s: number, z: number, h: number, color: string, opts: BoxOpts): Box[] {
  return [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => fromSketch(x, y, z, s, s, h, color, opts));
}

const KEY = 0.062;
const keyAt = (col: number, row: number, cols = 1, color = "#2b2b31") =>
  fromSketch(1.745 + col * KEY, 0.8 + row * KEY, 1.145, cols * KEY - 0.01, 0.052, 0.018, color, PLASTIC);

/** Non-clickable furniture: room shell, window, lamp, desk, keyboard, mouse, chair, rug, wall shelf, plant. */
export const DECOR: Box[] = [
  // Room shell
  fromSketch(0, 0, -0.2, 6, 6, 0.19, "#2a1d17"), // subfloor (shows in plank gaps)
  ...Array.from({ length: 12 }, (_, i) => fromSketch(i * 0.5, 0, -0.01, 0.494, 6, 0.01, FLOOR_TONES[i % 3], WOOD)), // floor planks
  fromSketch(-0.2, 0, 0, 0.2, 6, 4, "#3b3050"), // left wall
  fromSketch(0, -0.2, 0, 6, 0.2, 4, "#453a5c"), // back wall
  fromSketch(0, 0, 0, 0.03, 6, 0.12, "#2a2238"), // baseboard (left)
  fromSketch(0, 0, 0, 6, 0.03, 0.12, "#2a2238"), // baseboard (back)

  // Window
  fromSketch(1.25, 0, 1.95, 1.9, 0.02, 1.3, "#3d5a9e", GLOW), // glass
  fromSketch(1.2, 0, 3.25, 2, 0.06, 0.05, "#2a2238", WOOD), // frame top
  fromSketch(1.2, 0, 1.9, 0.05, 0.06, 1.4, "#2a2238", WOOD), // frame left
  fromSketch(3.15, 0, 1.9, 0.05, 0.06, 1.4, "#2a2238", WOOD), // frame right
  fromSketch(2.175, 0, 1.9, 0.05, 0.05, 1.4, "#2a2238", WOOD), // mullion
  fromSketch(1.2, 0, 2.58, 2, 0.05, 0.04, "#2a2238", WOOD), // transom
  fromSketch(1.12, 0, 1.86, 2.16, 0.12, 0.05, "#3a2f48", WOOD), // sill
  fromSketch(0.85, 0.08, 3.5, 2.7, 0.03, 0.03, "#8d8f96", METAL), // curtain rod
  fromSketch(0.92, 0.05, 1.4, 0.28, 0.1, 2.1, "#5a4a72", FABRIC), // curtain (left)
  fromSketch(3.2, 0.05, 1.4, 0.28, 0.1, 2.1, "#5a4a72", FABRIC), // curtain (right)

  // Wall shelf
  fromSketch(0, 1.6, 2.3, 0.35, 1.4, 0.04, "#a9744f", WOOD),
  ...bookRow(1.65, 2.6, 0.04, 0.26, 2.34, 0.5, 2, true),
  fromSketch(0.08, 2.75, 2.34, 0.16, 0.16, 0.14, "#4f8a5b", LEAF), // small succulent

  // Desk
  fromSketch(0.8, 0.2, 1.04, 2.8, 1.2, 0.08, "#a9744f", WOOD), // top
  ...legs(0.86, 0.26, 3.49, 1.29, 0.05, 0, 1.04, "#2b2b31", METAL),
  fromSketch(0.86, 0.26, 0.94, 2.68, 0.03, 0.1, "#2b2b31", METAL), // back rail

  // Lamp
  fromSketch(0.97, 0.47, 1.12, 0.2, 0.2, 0.03, "#2c2540", METAL_CYL), // base
  fromSketch(1.0575, 0.5575, 1.15, 0.025, 0.025, 0.42, "#2c2540", METAL_CYL), // stem
  fromSketch(0.93, 0.43, 1.55, 0.28, 0.28, 0.16, "#ffcf7a", { glow: true, shape: "cylinder" }), // shade

  // Mug
  fromSketch(1.42, 0.7, 1.12, 0.09, 0.09, 0.11, "#d8c9b8", { mat: "ceramic", shape: "cylinder" }),
  fromSketch(1.43, 0.71, 1.225, 0.07, 0.07, 0.006, "#3a2418", { shape: "cylinder" }), // coffee

  // Keyboard
  fromSketch(1.72, 0.78, 1.12, 0.9, 0.28, 0.025, "#1d1d22", PLASTIC), // case
  ...Array.from({ length: 3 * 14 }, (_, i) => keyAt(i % 14, Math.floor(i / 14), 1, i === 14 ? "#e0a458" : undefined)), // letter rows
  ...[0, 1, 2, 3, 10, 11, 12, 13].map((c) => keyAt(c, 3)), // modifiers
  keyAt(4, 3, 6), // spacebar

  // Mouse
  fromSketch(2.7, 0.78, 1.12, 0.28, 0.3, 0.004, "#232030", FABRIC), // pad
  fromSketch(2.8, 0.88, 1.124, 0.08, 0.12, 0.03, "#1d1d22", PLASTIC), // body
  fromSketch(2.835, 0.89, 1.154, 0.01, 0.025, 0.004, "#b48cff", GLOW), // scroll wheel

  // Chair
  fromSketch(1.9, 1.7, 0.45, 0.8, 0.8, 0.1, "#3d4a66", FABRIC), // seat
  fromSketch(1.95, 2.38, 0.65, 0.7, 0.1, 0.75, "#3d4a66", FABRIC), // backrest
  fromSketch(2.27, 2.44, 0.5, 0.06, 0.06, 0.2, "#2b2b31", METAL), // back support
  fromSketch(2.27, 2.07, 0.1, 0.06, 0.06, 0.35, "#8d8f96", METAL_CYL), // gas lift
  fromSketch(1.95, 2.07, 0.06, 0.7, 0.06, 0.04, "#2b2b31", PLASTIC), // base (x)
  fromSketch(2.27, 1.75, 0.06, 0.06, 0.7, 0.04, "#2b2b31", PLASTIC), // base (y)
  ...[[1.93, 2.08], [2.63, 2.08], [2.28, 1.73], [2.28, 2.43]].map(([x, y]) =>
    fromSketch(x, y, 0, 0.05, 0.05, 0.06, "#1d1d22", { mat: "plastic", shape: "cylinder" }),
  ), // casters
  ...[1.86, 2.68].flatMap((x) => [
    fromSketch(x, 1.85, 0.75, 0.06, 0.45, 0.04, "#1d1d22", PLASTIC), // armrest
    fromSketch(x + 0.01, 2.05, 0.55, 0.04, 0.04, 0.2, "#2b2b31", METAL), // armrest post
  ]),

  // Rug
  fromSketch(3.2, 2.6, 0, 2.2, 2.6, 0.02, "#7a5c8a", FABRIC),
  fromSketch(3.35, 2.75, 0, 1.9, 2.3, 0.022, "#6a4e7a", FABRIC), // inner border

  // Plant
  fromSketch(5.25, 5.15, 0, 0.5, 0.5, 0.4, "#a8613f", { mat: "ceramic", shape: "cylinder" }), // pot
  fromSketch(5.28, 5.18, 0.4, 0.44, 0.44, 0.01, "#3a2a20", { shape: "cylinder" }), // soil
  fromSketch(5.2, 5.1, 0.45, 0.6, 0.6, 0.55, "#4f8a5b", LEAF),
  fromSketch(5.1, 5.25, 0.7, 0.45, 0.45, 0.5, "#5c9a67", LEAF),
  fromSketch(5.35, 5.05, 0.8, 0.4, 0.4, 0.45, "#447a50", LEAF),
];

interface CameraPose {
  position: Vec3;
  target: Vec3;
}

function cameraFor(target: Vec3, offset: Vec3): CameraPose {
  return { position: [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]], target };
}

const monitorScreen = fromSketch(1.62, 0.44, 1.5, 1.16, 0.025, 0.62, "#16302b", GLOW);
// [indent, width] of each fake code line, top to bottom.
const CODE_LINES: [number, number][] = [[0, 0.42], [0.06, 0.6], [0.12, 0.34], [0.12, 0.52], [0.06, 0.2], [0, 0.12], [0, 0.48], [0.06, 0.38]];
const bookshelfCenter: Vec3 = [5.2, 1.3, 0.45];
const bedFrame = fromSketch(0.2, 3.2, 0.12, 2, 2.6, 0.25, "#4a3a33", WOOD);
const pc = fromSketch(3.0, 0.35, 1.12, 0.38, 0.85, 0.82, "#3a3d47", PLASTIC);
const poster = fromSketch(0, 4.0, 2.0, 0.04, 1.2, 1.4, "#1c1a22", WOOD);
const phone = fromSketch(1.25, 1.0, 1.12, 0.18, 0.32, 0.015, "#111111", PLASTIC);

export const OBJECTS: Record<RoomId, { boxes: Box[]; camera: CameraPose }> = {
  about: {
    boxes: [
      bedFrame,
      ...legs(0.24, 3.24, 2.08, 5.68, 0.08, 0, 0.12, "#3a2d27", WOOD),
      fromSketch(0.2, 3.1, 0, 2, 0.1, 1.0, "#4a3a33", WOOD), // headboard
      fromSketch(0.3, 3.2, 0.45, 1.8, 0.03, 0.45, "#5a4a72", FABRIC), // headboard cushion
      fromSketch(0.25, 3.22, 0.37, 1.9, 2.53, 0.2, "#d8c9b8", FABRIC), // mattress
      fromSketch(0.32, 3.3, 0.57, 0.8, 0.45, 0.1, "#ece2d4", FABRIC), // pillow
      fromSketch(1.28, 3.3, 0.57, 0.8, 0.45, 0.1, "#ece2d4", FABRIC), // pillow
      fromSketch(0.22, 4.0, 0.57, 1.96, 1.78, 0.06, "#b5544d", FABRIC), // blanket
      fromSketch(0.22, 3.9, 0.57, 1.96, 0.2, 0.08, "#c9665e", FABRIC), // blanket fold
    ],
    camera: cameraFor(bedFrame.position, [3, 2.2, 3]),
  },
  showcase: {
    boxes: [
      fromSketch(1.95, 0.2, 1.12, 0.5, 0.3, 0.025, "#9a9da4", METAL), // stand base
      fromSketch(2.16, 0.24, 1.14, 0.08, 0.05, 0.62, "#9a9da4", METAL), // stand neck
      fromSketch(1.85, 0.29, 1.62, 0.7, 0.09, 0.42, "#1c1c22", PLASTIC), // rear housing
      fromSketch(1.58, 0.38, 1.44, 1.24, 0.065, 0.73, "#141418", PLASTIC), // bezel
      monitorScreen,
      fromSketch(1.66, 0.4651, 2.05, 0.04, 0.004, 0.03, "#ff7a6b", GLOW), // editor tab dot
      fromSketch(1.72, 0.4651, 2.05, 0.22, 0.004, 0.03, "#2f5a50", GLOW), // editor tab
      ...CODE_LINES.map(([indent, w], i) =>
        fromSketch(1.7 + indent, 0.4651, 1.98 - i * 0.055, w, 0.004, 0.018, i % 3 === 1 ? "#e0a458" : "#9be7c4", GLOW),
      ), // code lines
      fromSketch(2.58, 0.4451, 1.462, 0.025, 0.004, 0.012, "#7cf0a8", GLOW), // power LED
    ],
    // Target shifted along screen-right so the monitor sits left of the HUD nav column and the room panel.
    camera: cameraFor([monitorScreen.position[0] + 0.2, monitorScreen.position[1], monitorScreen.position[2] - 0.17], [2.2, 1, 2.6]),
  },
  stack: {
    boxes: [
      pc,
      fromSketch(3.38, 0.4, 1.17, 0.006, 0.75, 0.72, "#1a1d26", { mat: "glass" }), // side glass
      fromSketch(3.386, 1.06, 1.2, 0.004, 0.02, 0.66, "#b48cff", GLOW), // RGB strip
      fromSketch(3.386, 0.48, 1.45, 0.01, 0.5, 0.07, "#4a4f5c", METAL), // GPU
      fromSketch(3.386, 0.48, 1.44, 0.006, 0.5, 0.008, "#9be7c4", GLOW), // GPU light bar
      fromSketch(3.386, 0.72, 1.66, 0.01, 0.16, 0.16, "#4a4f5c", METAL), // CPU cooler
      fromSketch(3.396, 0.76, 1.7, 0.004, 0.08, 0.08, "#6f8fd6", GLOW), // cooler ring
      fromSketch(3.02, 1.2, 1.14, 0.34, 0.01, 0.78, "#2a2c34", PLASTIC), // front panel
      ...Array.from({ length: 6 }, (_, i) => fromSketch(3.07, 1.21, 1.3 + i * 0.07, 0.24, 0.003, 0.02, "#0a0a0d", PLASTIC)), // vents
      fromSketch(3.17, 1.21, 1.86, 0.04, 0.006, 0.03, "#7cf0a8", GLOW), // power button
      fromSketch(3.08, 1.21, 1.8, 0.04, 0.004, 0.015, "#050506"), // USB
      fromSketch(3.26, 1.21, 1.8, 0.04, 0.004, 0.015, "#050506"), // USB
    ],
    camera: cameraFor(pc.position, [2.2, 1, 2.6]),
  },
  experience: {
    boxes: [
      poster, // frame
      fromSketch(0.04, 4.06, 2.06, 0.005, 1.08, 1.28, "#e0a458"), // print sky
      fromSketch(0.045, 4.5, 2.85, 0.005, 0.3, 0.3, "#fff1c9"), // sun
      fromSketch(0.045, 4.06, 2.36, 0.005, 1.08, 0.14, "#b5544d"), // hills
      fromSketch(0.045, 4.06, 2.06, 0.005, 1.08, 0.3, "#3d4a66"), // sea
    ],
    camera: cameraFor(poster.position, [3.0, 0.5, 2.0]),
  },
  journal: {
    boxes: [
      fromSketch(4.6, 0.2, 0, 0.05, 0.5, 2.6, "#8a5e41", WOOD), // side
      fromSketch(5.75, 0.2, 0, 0.05, 0.5, 2.6, "#8a5e41", WOOD), // side
      fromSketch(4.65, 0.2, 0, 1.1, 0.03, 2.6, "#6b4a3a", WOOD), // back
      fromSketch(4.65, 0.2, 2.55, 1.1, 0.5, 0.05, "#8a5e41", WOOD), // top
      ...[0, 0.62, 1.24, 1.86].map((z) => fromSketch(4.65, 0.23, z, 1.1, 0.47, z === 0 ? 0.08 : 0.04, "#8a5e41", WOOD)), // shelves
      ...[0.08, 0.66, 1.28, 1.9].flatMap((z, s) => bookRow(4.67, 5.72 - s * 0.12, 0.26, 0.36, z, 1, s * 3)), // books
    ],
    camera: cameraFor(bookshelfCenter, [2.5, 1.0, 3.0]),
  },
  contact: {
    boxes: [
      phone,
      fromSketch(1.265, 1.015, 1.135, 0.15, 0.29, 0.002, "#1f2c4a", GLOW), // screen
    ],
    camera: cameraFor(phone.position, [2.0, 1.5, 2.5]),
  },
};

export const OVERVIEW: CameraPose = { position: [13, 9.5, 13], target: [3, 1.2, 3] };

export const ORBIT_LIMITS = {
  minAzimuth: 0.2,
  maxAzimuth: Math.PI / 2 - 0.2,
  minPolar: 0.55,
  maxPolar: 1.25,
  minDistance: 7,
  maxDistance: 20,
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
