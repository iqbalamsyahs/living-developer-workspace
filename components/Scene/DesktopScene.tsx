"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { SceneModel, type SceneModelLayout } from "./SceneModel";
import { ShowcaseScreen } from "./ShowcaseScreen";
import type { ContentItem } from "@/lib/portfolio";

// Calibration flag from .env.local (NEXT_PUBLIC_ is inlined into the client
// bundle). True shows the drei Grid + axes helper while tuning MODEL_LAYOUT.
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_SCENE === "true";

// Positions calibrated against each GLB's world bounds (see plan notes):
// - desk: origin sits on the floor, top surface at y=0.942, center x=0.242
// - monitor: base at local y=0, centered on desk center -> y = 0.942; rotated Y 90deg
//   and scaled 1.7x per user request
// - notebook: geometry exported with a ~1.5M-unit offset + ~1.1M span, so it is
//   recentered via position offset and scaled to ~0.36 wide; rotated Y 180deg so the
//   spine sits at the back, placed at the desk's left-front
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
  {
    key: "notebook",
    url: "/glb/notebook.glb",
    id: "about",
    position: [0.9034, 0.9366, 0.1812],
    rotation: [0, Math.PI / 9, 0],
    scale: [3.2145e-7, 3.2145e-7, 3.2145e-7],
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

// Where the camera lands to inspect the PC monitor, and where the HTML
// showcase panel is anchored. screenOffset = world offset from the pc group
// origin to the monitor screen center (calibrate with the DEBUG grid);
// camDist = distance the camera parks in front of the screen. The pc group is
// rotated Y 90° so its screen faces +X, hence the camera sits on +X of the
// screen center.
const ZOOM_VIEWS: Record<
  string,
  { screenOffset: [number, number, number]; camDist: number }
> = {
  pc: { screenOffset: [0.28, 0.22, 0], camDist: 0.9 },
};

const DEFAULT_TARGET: [number, number, number] = [0.25, 0.5, 0];
// drei OrbitControls enforces these in its own useFrame update() (priority -1).
// CameraRig mirrors them onto the instance the frame it re-enables controls, so
// there is no one-frame snap while React catches up with the `zoomed` state.
const DEFAULT_CLAMPS = { minDistance: 1.5, maxDistance: 6, maxPolarAngle: Math.PI / 2.1 };
const ZOOMED_CLAMPS = { minDistance: 0.5, maxDistance: 2.5, maxPolarAngle: Math.PI / 2 };
const DAMP_LAMBDA = 6; // ~1s ease-out for a 0.9-unit flight
const ARRIVE_EPS = 0.005;

interface DesktopSceneProps {
  /** Objects other than the PC (notebook/whiteboard/phone) open modals directly. */
  onOpenModal: (id: string) => void;
  /** "pc" while the showcase zoom is active; null in the idle desk view. */
  zoomTarget: string | null;
  caseStudies: ContentItem[];
  showcaseContent?: ContentItem;
  onOpenCaseStudy: (id: string) => void;
  onCloseShowcase: () => void;
}

type ControlsImpl = ElementRef<typeof OrbitControls>;

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
  onZoomed,
}: {
  zoomTarget: string | null;
  zoomPos: Vector3;
  zoomLookTarget: Vector3;
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
      prevZt.current = zoomTarget;
      if (zoomTarget) {
        // Zoom-in: capture current pose, fly toward the monitor.
        restore.current = {
          pos: camera.position.clone(),
          target: oc.target.clone(),
        };
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
    camera.lookAt(target);

    if (
      pos.distanceTo(a.to) < ARRIVE_EPS &&
      target.distanceTo(a.toTarget) < ARRIVE_EPS
    ) {
      pos.copy(a.to);
      target.copy(a.toTarget);
      const clamps = zoomTarget ? ZOOMED_CLAMPS : DEFAULT_CLAMPS;
      oc.minDistance = clamps.minDistance;
      oc.maxDistance = clamps.maxDistance;
      oc.maxPolarAngle = clamps.maxPolarAngle;
      oc.enabled = true;
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
  caseStudies,
  showcaseContent,
  onOpenCaseStudy,
  onCloseShowcase,
}: DesktopSceneProps) {
  const [zoomed, setZoomed] = useState(false);

  const zoomView = useMemo(() => {
    const pc = MODEL_LAYOUT.find((m) => m.key === "pc")!;
    const cfg = ZOOM_VIEWS[zoomTarget ?? "pc"] ?? ZOOM_VIEWS.pc;
    const lookTarget = new Vector3(
      pc.position[0] + cfg.screenOffset[0],
      pc.position[1] + cfg.screenOffset[1],
      pc.position[2] + cfg.screenOffset[2],
    );
    return {
      lookTarget,
      camPos: lookTarget.clone().add(new Vector3(cfg.camDist, 0, 0)),
    };
  }, [zoomTarget]);

  return (
    <div aria-hidden className="fixed inset-0 z-[-1]">
      <Canvas dpr={[1, 2]} camera={{ position: [15, 10, 0], fov: 30 }}>
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
          onZoomed={setZoomed}
        />

        {zoomed && zoomTarget === "pc" && showcaseContent && (
          <ShowcaseScreen
            position={zoomView.lookTarget.toArray() as [number, number, number]}
            content={showcaseContent}
            caseStudies={caseStudies}
            onOpen={onOpenCaseStudy}
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

        {/* makeDefault so CameraRig can read controls via useThree. Clamps
            loosen while the monitor is zoomed so the user can orbit it. */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={zoomed ? ZOOMED_CLAMPS.minDistance : DEFAULT_CLAMPS.minDistance}
          maxDistance={zoomed ? ZOOMED_CLAMPS.maxDistance : DEFAULT_CLAMPS.maxDistance}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={zoomed ? ZOOMED_CLAMPS.maxPolarAngle : DEFAULT_CLAMPS.maxPolarAngle}
          target={DEFAULT_TARGET}
        />
      </Canvas>
    </div>
  );
}
