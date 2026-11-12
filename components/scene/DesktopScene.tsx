"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { SceneModel, type SceneModelLayout } from "./SceneModel";
import { ShowcaseScreen } from "./ShowcaseScreen";
import { ContactScreen } from "./ContactScreen";
import { AboutScreen } from "./AboutScreen";
import type { ContentItem } from "@/lib/portfolio";

// Calibration flag from .env.local (NEXT_PUBLIC_ is inlined into the client
// bundle). True shows the drei Grid + axes helper while tuning MODEL_LAYOUT.
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_SCENE === "true";

// Positions calibrated against each GLB's world bounds (see plan notes):
// - desk: origin sits on the floor, top surface at y=0.942, center x=0.242
// - monitor: base at local y=0, centered on desk center -> y = 0.942; rotated Y 90deg
//   and scaled 1.7x per user request
// - book: open-book GLTF (CC-BY-4.0, Zayfert1999); Rz(90°) lays it flat,
//   scale 0.196 → ~0.36 (spine) x ~0.507 (span) on the desk, left-front
// - whiteboard: face lies in the Y-Z plane, rotated Y 180deg per user request
const MODEL_LAYOUT: SceneModelLayout[] = [
  {
    key: "desk",
    url: "/glb/desk.glb",
    position: [0.7, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    key: "keyboard",
    url: "/glb/keyboard.glb",
    position: [0.88, 0.955, -0.0074],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.26, 0.26, 0.26],
  },
  {
    key: "cpu",
    url: "/glb/cpu.glb",
    position: [0.65, 1.15, -0.7574],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.0015, 0.0015, 0.0015],
  },
  {
    key: "mouse",
    url: "/glb/mouse.glb",
    position: [0.90, 0.944, -0.4574],
    rotation: [0, -Math.PI / 2, 0],
    scale: [0.04, 0.04, 0.04],
  },
  {
    key: "pc",
    url: "/glb/monitor.glb",
    id: "showcase",
    position: [0.5, 1.075, -0.0074],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
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
    position: [0.727, 0.9665, 0.78],
    rotation: [0, 5, Math.PI / 2],
    scale: [0.13, 0.13, 0.13],
  },
  {
    key: "whiteboard",
    url: "/glb/whiteboard.glb",
    id: "stack",
    position: [0.942, 0.84, 1.5],
    rotation: [0, Math.PI / 2, 0],
    scale: [1, 1, 1],
  },
  {
    key: "phone",
    url: "/glb/phone.glb",
    id: "contact",
    position: [1.35, 0.943, -0.7],
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
const ZOOM_VIEWS: Record<
  string,
  {
    screenOffset: [number, number, number];
    camDist: number;
    camDir: [number, number, number];
    camUp: [number, number, number];
  }
> = {
  // PC monitor screen (measured from monitor.glb: screen-glass centers at
  // local (0.026, 0.186, 0.007), spans 0.730 (z) x 0.440 (y)). Faces +X.
  pc: { screenOffset: [0.026, 0.186, 0.007], camDist: 1, camDir: [1, 0, 0], camUp: [0, 1, 0] },
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
    camUp: [-0.2837, 0, -0.9589],
  },
};

const DEFAULT_TARGET: [number, number, number] = [0.25, 0.5, 0];
// drei OrbitControls enforces these in its own useFrame update() (priority -1).
// CameraRig mirrors them onto the instance the frame it re-enables controls, so
// there is no one-frame snap while React catches up with the `zoomed` state.
const DEFAULT_CLAMPS = { minDistance: 1.5, maxDistance: 6, maxPolarAngle: Math.PI / 2.1 };
const ZOOMED_CLAMPS = { minDistance: 0.5, maxDistance: 2.5, maxPolarAngle: Math.PI / 2 };
// Screen-glass of monitor.glb (identity node transforms): local x/y/z ranges.
// The glass is 0.730 wide (z) x 0.440 tall (y). The panel is pixel-sized from
// these world bounds projected to the screen, so it overlays the actual glass.
const GLASS_BOUNDS = {
  min: { x: 0.645, y: -0.047843, z: -0.37929 },
  max: { x: 0.845, y: 0.445057, z: 0.43671 },
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
const SCREENS: Record<
  string,
  { bl: [number, number, number]; br: [number, number, number]; tl: [number, number, number] }
> = {
  pc: {
    bl: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.min.y, GLASS_BOUNDS.min.z],
    br: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.min.y, GLASS_BOUNDS.max.z],
    tl: [GLASS_BOUNDS.min.x, GLASS_BOUNDS.max.y, GLASS_BOUNDS.min.z],
  },
  contact: {
    bl: [1.2094, 0.95, -0.622],
    br: [1.4484, 0.95, -0.622],
    tl: [1.2094, 0.95, -0.7532],
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
    bl: [0.8887, 0.9828, 0.734],
    br: [0.5662, 0.9828, 0.8294],
    tl: [0.8211, 0.9828, 0.5053],
  },
};
const DAMP_LAMBDA = 6; // ~1s ease-out for a 0.9-unit flight
const ARRIVE_EPS = 0.005;

interface DesktopSceneProps {
  /** Objects other than the PC (notebook/whiteboard/phone) open modals directly. */
  onOpenModal: (id: string) => void;
  /** "pc" while the showcase zoom is active; null in the idle desk view. */
  zoomTarget: string | null;
  projects: ContentItem[];
  showcaseContent?: ContentItem;
  /** Contact item rendered on the phone screen while its zoom is active. */
  contactContent?: ContentItem;
  /** About item rendered as an open book on the notebook while its zoom is active. */
  aboutContent?: ContentItem;
  onCloseShowcase: () => void;
}

type ControlsImpl = ElementRef<typeof OrbitControls>;

/**
 * Projects the inspected screen's world corners to the viewport and reports
 * the pixel size of the panel. Lives inside <Canvas> (needs useThree);
 * re-projects every frame while zoomed so the panel tracks the camera and any
 * resize. The onSize setter is the stable setState from DesktopScene.
 * Orientation-agnostic: whichever projected edge is closer to horizontal is
 * the panel's width, the other its height. This lets the same logic serve the
 * monitor (long axis horizontal) and the phone presented portrait (long axis
 * vertical on screen).
 */
function GlassProjector({
  corners,
  onSize,
}: {
  corners: { bl: [number, number, number]; br: [number, number, number]; tl: [number, number, number] };
  onSize: (w: number, h: number) => void;
}) {
  const refs = useThree((s) => ({ gl: s.gl, camera: s.camera }));
  const last = useRef({ w: 0, h: 0 });
  useFrame(() => {
    const renderer = refs.gl;
    const camera = refs.camera;
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    if (w === 0 || h === 0) return;
    const px = (p: [number, number, number]) =>
      new Vector3(p[0], p[1], p[2]).project(camera);
    const bl = px(corners.bl);
    const br = px(corners.br);
    const tl = px(corners.tl);
    // Edge vectors in viewport pixels. project() maps clip space to NDC
    // (-1..1), so an edge spanning full width is 2.0 NDC, not 1.0 — divide by
    // 2 to convert to true viewport pixels. (Without it the panel is 2x too
    // big; the PC panel only looked fine because its camDist is far enough that
    // 2x still fit the viewport.) The screen is axis-aligned on screen under
    // the locked perpendicular camera (one edge horizontal, the other
    // vertical), so the dominant component of each edge tells which is which.
    const ex = ((br.x - bl.x) * w) / 2;
    const ey = ((br.y - bl.y) * h) / 2;
    const fx = ((tl.x - bl.x) * w) / 2;
    const fy = ((tl.y - bl.y) * h) / 2;
    const len = (x: number, y: number) => Math.hypot(x, y);
    const brIsHorizontal = Math.abs(ex) >= Math.abs(ey);
    const size = {
      w: brIsHorizontal ? len(ex, ey) : len(fx, fy),
      h: brIsHorizontal ? len(fx, fy) : len(ex, ey),
    };
    if (last.current.w !== size.w || last.current.h !== size.h) {
      last.current = size;
      onSize(size.w, size.h);
    }
  });
  return null;
}

/**
 * Flies the camera to/from the monitor screen center with damped easing.
 * Zoom transitions are detected and acted on *inside* useFrame (not in a
 * useEffect) so OrbitControls is disabled on the exact same frame the damp
 * starts — no one-frame gap where OrbitControls.update() fights the camera.
 */
function CameraRig({
  zoomTarget,
  zoomPos,
  zoomLookTarget,
  zoomUp,
  onZoomed,
}: {
  zoomTarget: string | null;
  zoomPos: Vector3;
  zoomLookTarget: Vector3;
  zoomUp: [number, number, number];
  onZoomed: (zoomed: boolean) => void;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as ControlsImpl | null;

  // makeDefault fills s.controls after the first render. Stash it in a ref
  // (assigned in an effect, read only from useFrame callbacks) so the frame
  // loop sees a non-null, stable instance without accessing refs in render.
  const ocRef = useRef<ControlsImpl | null>(null);
  useEffect(() => {
    if (controls && !ocRef.current) ocRef.current = controls;
  }, [controls]);

  const restore = useRef<{ pos: Vector3; target: Vector3 } | null>(null);
  const anim = useRef<{
    from: Vector3;
    fromTarget: Vector3;
    to: Vector3;
    toTarget: Vector3;
  } | null>(null);
  // Track previous zoomTarget inside useFrame to avoid useEffect timing gaps.
  const prevZt = useRef<string | null>(null);

  useFrame((_, delta) => {
    const oc = ocRef.current;
    if (!oc) return;

    // --- Detect zoomTarget transition on the first frame it changes ---
    if (zoomTarget !== prevZt.current) {
      const prev = prevZt.current;
      prevZt.current = zoomTarget;
      if (zoomTarget) {
        // Zoom-in: capture the restore pose only when coming from the idle
        // desk view. A zoom → zoom transition (pc → contact) must NOT
        // overwrite it — otherwise closing the second zoom flies back to the
        // first zoom instead of the desk.
        if (prev == null) {
          restore.current = {
            pos: camera.position.clone(),
            target: oc.target.clone(),
          };
        }
        anim.current = {
          from: camera.position.clone(),
          fromTarget: oc.target.clone(),
          to: zoomPos.clone(),
          toTarget: zoomLookTarget.clone(),
        };
        oc.enabled = false; // same frame as the first damp → zero fight
      } else if (restore.current) {
        // Zoom-out: fly back to the captured pre-zoom pose.
        anim.current = {
          from: camera.position.clone(),
          fromTarget: oc.target.clone(),
          to: restore.current.pos,
          toTarget: restore.current.target,
        };
        oc.enabled = false;
      }
    }

    // --- Per-frame damp ---
    const a = anim.current;
    if (!a) return;
    const pos = camera.position;
    pos.set(
      MathUtils.damp(pos.x, a.to.x, DAMP_LAMBDA, delta),
      MathUtils.damp(pos.y, a.to.y, DAMP_LAMBDA, delta),
      MathUtils.damp(pos.z, a.to.z, DAMP_LAMBDA, delta),
    );
    const target = oc.target;
    target.set(
      MathUtils.damp(target.x, a.toTarget.x, DAMP_LAMBDA, delta),
      MathUtils.damp(target.y, a.toTarget.y, DAMP_LAMBDA, delta),
      MathUtils.damp(target.z, a.toTarget.z, DAMP_LAMBDA, delta),
    );
    camera.up.set(...zoomUp);
    camera.lookAt(target);

    if (
      pos.distanceTo(a.to) < ARRIVE_EPS &&
      target.distanceTo(a.toTarget) < ARRIVE_EPS
    ) {
      pos.copy(a.to);
      target.copy(a.toTarget);
      camera.up.set(...zoomUp);
      const clamps = zoomTarget ? ZOOMED_CLAMPS : DEFAULT_CLAMPS;
      oc.minDistance = clamps.minDistance;
      oc.maxDistance = clamps.maxDistance;
      oc.maxPolarAngle = clamps.maxPolarAngle;
      // Locked while inspecting the monitor: no drag/rotate or wheel-zoom until
      // the user exits (re-click or Esc), which re-enables controls on the way out.
      oc.enabled = zoomTarget == null;
      anim.current = null;
      onZoomed(zoomTarget != null);
    }
  });

  return null;
}

/**
 * "Midnight Engineering" 3D desktop. Renders at z-[-1] behind the HUD overlay
 * (z-10); the wrapper is aria-hidden since interactive content lives in HUD/Modal.
 */
export function DesktopScene({
  onOpenModal,
  zoomTarget,
  projects,
  showcaseContent,
  contactContent,
  aboutContent,
  onCloseShowcase,
}: DesktopSceneProps) {
  const [zoomed, setZoomed] = useState(false);
  // Pixel size of the showcase panel, reported by GlassProjector (inside the
  // Canvas) from the monitor glass's world bounds projected to the viewport.
  // w/h are the horizontal (z) and vertical (y) world extents in pixels.
  const [screenSize, setScreenSize] = useState({ w: 0, h: 0 });

  const zoomView = useMemo(() => {
    const cfg = ZOOM_VIEWS[zoomTarget ?? "pc"] ?? ZOOM_VIEWS.pc;
    // screenOffset is relative to the object group origin, so add it to the
    // object's world position.
    const anchor = MODEL_LAYOUT.find(
      (m) => m.id === (zoomTarget ?? "showcase"),
    );
    const base = anchor
      ? new Vector3(...anchor.position)
      : new Vector3(...MODEL_LAYOUT.find((m) => m.key === "pc")!.position);
    const lookTarget = base.clone().add(new Vector3(...cfg.screenOffset));
    const camDir = new Vector3(...cfg.camDir);
    return {
      lookTarget,
      camPos: lookTarget.clone().add(camDir.multiplyScalar(cfg.camDist)),
      camUp: cfg.camUp,
    };
  }, [zoomTarget]);

  return (
    <div aria-hidden className="fixed inset-0 z-[-1]">
      <Canvas dpr={[1, 2]} camera={{ position: [15, 10, 0], fov: 35 }}>
        {/* ── Ambient: neutral base so every material reads true ── */}
        <ambientLight intensity={0.22} color="#e6ecf4" />
        {/* ── Hemisphere: cool sky above + warm bounce below — lifts the tops of
             the notebook, phone, and whiteboard; keeps the desk from going flat ── */}
        <hemisphereLight intensity={0.45} color="#dce5f2" groundColor="#3a2e20" />

        {/* ── Key (desk lamp): warm pool from the camera-side upper right —
             lights the desk top, the notebook cover, and the phone's screen ── */}
        <spotLight
          position={[2.6, 3.4, 1.4]}
          angle={0.55}
          penumbra={0.9}
          intensity={28}
          distance={8}
          color="#ffdcae"
        />

        {/* ── Fill (moonlight): cool from the camera side (+x/+z) — lifts the
             PC's right face, the notebook, and the whiteboard's visible face ── */}
        <directionalLight position={[3, 1.6, 1.8]} intensity={0.6} color="#b6c6de" />

        {/* ── Rim: subtle cool from behind-left — separates the PC and
             whiteboard silhouettes from the night background ── */}
        <directionalLight position={[-2.5, 1.4, -2]} intensity={0.3} color="#8090ac" />

        {/* ── Monitor glow (brand accent): tight emerald pool at the screen so
             it reads as atmosphere, not a flood on the desk or whiteboard ── */}
        <pointLight position={[-0.02, 1.25, 0.4]} intensity={3.5} distance={1.5} color="#10b981" />

        <Suspense fallback={null}>
          {MODEL_LAYOUT.map((model) => (
            <SceneModel key={model.key} layout={model} onOpenModal={onOpenModal} />
          ))}
        </Suspense>

        <CameraRig
          zoomTarget={zoomTarget}
          zoomPos={zoomView.camPos}
          zoomLookTarget={zoomView.lookTarget}
          zoomUp={zoomView.camUp}
          onZoomed={setZoomed}
        />

        <GlassProjector
          corners={SCREENS[zoomTarget ?? "pc"] ?? SCREENS.pc}
          onSize={(w, h) => setScreenSize({ w, h })}
        />

        {zoomed && zoomTarget === "pc" && showcaseContent && screenSize.w > 0 && (
          <ShowcaseScreen
            position={zoomView.lookTarget.toArray() as [number, number, number]}
            widthPx={screenSize.w}
            heightPx={screenSize.h}
            content={showcaseContent}
            projects={projects}
            onClose={onCloseShowcase}
          />
        )}

        {zoomed && zoomTarget === "contact" && contactContent && screenSize.w > 0 && (
          <ContactScreen
            position={zoomView.lookTarget.toArray() as [number, number, number]}
            widthPx={screenSize.w}
            heightPx={screenSize.h}
            content={contactContent}
            onClose={onCloseShowcase}
          />
        )}

        {zoomed && zoomTarget === "about" && aboutContent && screenSize.w > 0 && (
          <AboutScreen
            position={zoomView.lookTarget.toArray() as [number, number, number]}
            widthPx={screenSize.w}
            heightPx={screenSize.h}
            content={aboutContent}
            onClose={onCloseShowcase}
          />
        )}

        {/* Grounds the scene; renders its own depth pass, no renderer shadows needed */}
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.55}
          scale={8}
          blur={2.4}
          far={2}
          resolution={512}
          color="#0f172a"
        />

        {DEBUG && (
          <>
            <Grid
              infiniteGrid
              cellSize={0.25}
              cellThickness={0.6}
              cellColor="#1e293b"
              sectionSize={1}
              sectionThickness={1}
              sectionColor="#10b981"
              fadeDistance={8}
            />
            <axesHelper args={[2]} />
          </>
        )}

        {/* makeDefault so CameraRig can read controls via useThree. Clamps only
            matter in the idle desk view — while zoomed the camera is locked
            (oc.enabled stays false), so ZOOMED_CLAMPS is never live. */}
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minDistance={DEFAULT_CLAMPS.minDistance}
          maxDistance={DEFAULT_CLAMPS.maxDistance}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={DEFAULT_CLAMPS.maxPolarAngle}
          target={DEFAULT_TARGET}
        />
      </Canvas>
    </div>
  );
}
