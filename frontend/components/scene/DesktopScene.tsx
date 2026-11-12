"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { SceneModel } from "./SceneModel";
import { DEFAULT_TARGET, MODEL_LAYOUT, SCREENS, ZOOM_VIEWS } from "./layout";
import { ShowcaseScreen } from "./ShowcaseScreen";
import { ContactScreen } from "./ContactScreen";
import { AboutScreen } from "./AboutScreen";
import type { ContentItem } from "@/lib/portfolio";

// Calibration flag from .env.local (NEXT_PUBLIC_ is inlined into the client
// bundle). True shows the drei Grid + axes helper while tuning MODEL_LAYOUT.
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_SCENE === "true";

// drei OrbitControls enforces these in its own useFrame update() (priority -1).
// CameraRig mirrors them onto the instance the frame it re-enables controls, so
// there is no one-frame snap while React catches up with the `zoomed` state.
const DEFAULT_CLAMPS = { minDistance: 1.5, maxDistance: 6, maxPolarAngle: Math.PI / 2.1 };
const ZOOMED_CLAMPS = { minDistance: 0.5, maxDistance: 2.5, maxPolarAngle: Math.PI / 2 };

const DAMP_LAMBDA = 6; // ~1s ease-out for a 0.9-unit flight
const ARRIVE_EPS = 0.005;

interface DesktopSceneProps {
  /** Called when the WebGL context is lost so the page can fall back to Standard View. */
  onContextLost?: () => void;
  /** Jump to each stop pose instead of flying (prefers-reduced-motion). */
  reducedMotion?: boolean;
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
  onContextLost,
}: DesktopSceneProps) {
  // R3F force-loses the context ~500ms after unmount; that is not a failure.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
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
      : new Vector3(...MODEL_LAYOUT.find((m) => m.key === "monitor")!.position);
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
      <Canvas dpr={[1, 2]} camera={{ position: [15, 10, 0], fov: 35 }}
        onCreated={({ gl }) =>
          gl.domElement.addEventListener("webglcontextlost", () => {
            if (mountedRef.current) onContextLost?.();
          })
        }
      >
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
