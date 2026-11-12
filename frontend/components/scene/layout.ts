import type { SceneModelLayout } from "./SceneModel";

// The v2 desk set (Sketchfab "Modern PC Desk Setup", CC BY 4.0) shares one transform:
// source units are ~10x the scene (desk top at y 9.54 -> 0.954), and rotating -90deg about Y
// turns the monitor (its screen faces source -Z) toward +X, where the camera sits.
// World footprint: desk x [0.085, 0.915] z [-0.814, 0.814]; screen plane x 0.379.
const DESK_SET = {
  position: [0.5, 0, 0] as [number, number, number],
  rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  scale: [0.1, 0.1, 0.1] as [number, number, number],
};

export const MODEL_LAYOUT: SceneModelLayout[] = [
  { key: "desk", url: "/glb/v2/desk.glb", ...DESK_SET },
  { key: "keyboard", url: "/glb/v2/keyboard.glb", ...DESK_SET },
  { key: "cpu", url: "/glb/v2/pc.glb", ...DESK_SET },
  { key: "mouse", url: "/glb/v2/mouse.glb", ...DESK_SET },
  { key: "speakers", url: "/glb/v2/speakers.glb", ...DESK_SET },
  { key: "monitor", url: "/glb/v2/monitor.glb", id: "showcase", ...DESK_SET },
  // Open book ("Simple animated book" by Zayfert1999, Sketchfab, CC-BY-4.0).
  // Replaces the old closed notebook: the open book IS the About surface. Rest
  // pose is already an open book (skinned mesh, no useful animation clip), so it
  // is rendered static. Rz(90°) lays it flat on the desk (page faces +Y); the
  // scene-root skinned bounds are x[-0.125,0.125] y[-0.014,1.821] z[-1.294,1.294],
  // so at scale 0.196 the flat book spans x[-0.357,0.003] (spine, ~0.36),
  // y[-0.0245,0.0245] (thin), z[-0.2536,0.2536] (opening, ~0.507); page centers
  // sit at local (x=-0.177, y=0.0245, z=±0.1267). Redistribute on the desk with
  // NEXT_PUBLIC_DEBUG_SCENE=true.
  {
    key: "book",
    url: "/animated_book/scene.gltf",
    id: "about",
    position: [0.7, 0.9785, -0.56],
    rotation: [0, 5, Math.PI / 2],
    scale: [0.13, 0.13, 0.13],
  },
  {
    key: "whiteboard",
    url: "/glb/whiteboard.glb",
    id: "stack",
    position: [0.5, 0.84, 1.31],
    rotation: [0, Math.PI / 2, 0],
    scale: [1, 1, 1],
  },
  {
    key: "phone",
    url: "/glb/phone.glb",
    id: "contact",
    position: [0.78, 0.954, 0.44],
    rotation: [Math.PI / 2, 0, Math.PI / 2],
    scale: [0.15, 0.15, 0.15],
  },
];

// Where the camera lands to inspect an object's screen, and where the HTML
// panel is anchored. screenOffset = world offset from the object group origin
// to its screen center. camDist = distance the camera parks in front of the
// screen; camDir = unit vector from the screen center toward the camera
// (perpendicular to the screen); camUp = camera.up while inspecting. The
// default up (0,1,0) is parallel to the look direction when looking straight
// down at the phone, which degenerates lookAt — the phone's camUp keeps the
// panel's long axis along the phone's long axis (world X).
export const ZOOM_VIEWS: Record<
  string,
  {
    screenOffset: [number, number, number];
    camDist: number;
    camDir: [number, number, number];
    camUp: [number, number, number];
  }
> = {
  // Ultrawide screen (scripts/glb/measure-screen.mjs: source quad centre (-0.6128, 12.5842, 1.2112),
  // 9.47 x 4.66, ratio 2.03:1). Offset from the DESK_SET origin after scale 0.1 and Ry(-90deg):
  // (-z, y, x) * 0.1. Faces +X; camDist 1.1 shows the 0.947-wide glass with bezel margin at 16:9.
  pc: { screenOffset: [-0.12112, 1.25842, -0.06128], camDist: 1.1, camDir: [1, 0, 0], camUp: [0, 1, 0] },
  // Flat phone (see MODEL_LAYOUT): lies flat, screen faces +Y at world y 0.9536,
  // spans x [1.2294, 1.4484] x z [-0.7532, -0.6482], center (1.3389, 0.9536, -0.7).
  // camDir [0,1,0] parks the camera directly above. camUp [-1,0,0] puts world
  // -X (notch end at x=1.226) at the top of the screen → portrait, notch-up.
  // camUp must be perpendicular to camDir: both [0,1,0] is degenerate in
  // Three.js lookAt → undefined camera orientation → bad framing.
  // camDist 0.4 shows the phone with bezel visible; tune as needed.
  contact: {
    screenOffset: [-0.010, 0, -0.0006],
    camDist: 0.4,
    camDir: [0, 1, 0],
    camUp: [-1, 0, 0],
  },
  // Open book (see SCREENS.about): the pages lie flat (Rz 90° lays the
  // broad face horizontal), and the MODEL_LAYOUT yaw (5 rad about Y) spins the
  // book on the desk, so camDir [0,1,0] still looks straight down the page
  // normal (+Y world). camUp is the horizontal projection of the book's spine
  // (its height axis after the transform) so the page content reads upright
  // instead of rotated. screenOffset = page top-center minus the book group
  // origin (from SCREENS.about derivation): [0.727,0.9665,0.78] + [-0.0332,
  // 0.0163,-0.1122] = [0.6938,0.9828,0.6678]. camDist is a starting estimate;
  // tune with NEXT_PUBLIC_DEBUG_SCENE=true.
  about: {
    screenOffset: [-0.0332, 0.0163, -0.1122],
    camDist: 0.5,
    camDir: [0, 1, 0],
    camUp: [0.2837, 0, 0.9589],
  },
};

export const DEFAULT_TARGET: [number, number, number] = [0.5, 0.5, 0];

// Screen-glass of monitor.glb (identity node transforms): local x/y/z ranges.
// The glass is 0.730 wide (z) x 0.440 tall (y). The panel is pixel-sized from
// these world bounds projected to the screen, so it overlays the actual glass.
export const GLASS_BOUNDS = {
  min: { x: 0.37888, y: 1.02522, z: -0.5348 },
  max: { x: 0.37888, y: 1.49162, z: 0.41225 },
};

// World-space screen rectangles keyed by zoom target, as three corners
// (bottom-left, bottom-right, top-left). The panel's width is the projection
// of bl→br, its height the projection of bl→tl, so GlassProjector is
// orientation-agnostic. pc keeps the tuned GLASS_BOUNDS numbers; contact uses
// the phone display surface measured against the flat phone's MODEL_LAYOUT
// transform: display (mat17) local x [-0.355,0.345] (width), local y
// [-0.656,0.804] (height), front face local z -0.071; world (R 90° X, 90° Z,
// scale 0.15, pos [1.35,0.943,-0.7]) the screen faces +Y and spans
// x [1.2294,1.4484] (width) x z [-0.7532,-0.6482] (height), at y 0.9536.
// Viewed from above (camDir +Y) the long axis is world X.
export const SCREENS: Record<
  string,
  { bl: [number, number, number]; br: [number, number, number]; tl: [number, number, number] }
> = {
  pc: {
    bl: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.min.y, GLASS_BOUNDS.min.z],
    br: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.min.y, GLASS_BOUNDS.max.z],
    tl: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.max.y, GLASS_BOUNDS.min.z],
  },
  contact: {
    bl: [0.6394, 0.961, 0.518],
    br: [0.8784, 0.961, 0.518],
    tl: [0.6394, 0.961, 0.3868],
  },
  // Open book (MODEL_LAYOUT pos [0.727,0.9665,0.78], Rz 90° + yaw 5, scale
  // 0.13): pages lie flat (broad face → +Y), spun on the desk by the yaw. These
  // are the world corners of the page top surface (the +X broad face of the raw
  // bbox, taken at height y=0.9 and mid-spread z=0 for the center, and the raw
  // face corners for bl/br/tl), computed through the group transform:
  //   pageTopCenter (0.6938, 0.9828, 0.6678)
  //   bl (0.8887, 0.9828, 0.734)  br (0.5662, 0.9828, 0.8294)
  //   tl (0.8211, 0.9828, 0.5053)
  // All at world y ≈ 0.9828 (the page top). The AboutScreen Html is sized in
  // world units (transform mode), so these corners only gate visibility via
  // GlassProjector's screenSize.w > 0 check.
  about: {
    bl: [0.8617, 0.9948, -0.606],
    br: [0.5392, 0.9948, -0.5106],
    tl: [0.7941, 0.9948, -0.8347],
  },
};
