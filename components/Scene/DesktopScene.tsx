"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { SceneModel, type SceneModelLayout } from "./SceneModel";

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
    position: [0.5, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  // {
  //   key: "monitor",
  //   url: "/glb/monitor.glb",
  //   id: "cs-pensioner-admin",
  //   position: [-0.242, 0.942, -0.004],
  //   rotation: [0, Math.PI / 2, 0],
  //   scale: [2, 2, 2],
  // },
  // PC replaces the monitor: same content, base flush on the desk top (y=0.942).
  // Unnormalized export (units in hundreds, offset center), so it is scaled to
  // ~0.45 tall and recentered via position offset.
  {
    key: "pc",
    url: "/glb/pc.glb",
    id: "showcase",
    position: [0.4800, 0.9439, -0.0074],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.0016, 0.0016, 0.0016],
  },
  {
    key: "notebook",
    url: "/glb/notebook.glb",
    id: "about",
    position: [0.7034, 0.9366, 0.1812],
    // Rotate π so the spine rings sit at the back; the top cover faces the camera.
    rotation: [0, Math.PI / 9, 0],
    scale: [3.2145e-7, 3.2145e-7, 3.2145e-7],
  },
  {
    key: "whiteboard",
    url: "/glb/whiteboard.glb",
    id: "stack",
    position: [0.742, 0.84, 1.5],
    rotation: [0, Math.PI / 2, 0],
    scale: [1, 1, 1],
  },
  {
    key: "phone",
    url: "/glb/phone.glb",
    id: "contact",
    position: [1.15, 0.943, -0.7],
    rotation: [Math.PI / 2, 0, Math.PI / 2],
    scale: [0.15, 0.15, 0.15],
  },
];

interface DesktopSceneProps {
  onOpenModal: (id: string) => void;
}

/**
 * "Midnight Engineering" 3D desktop. Renders at z-[-1] behind the HUD overlay
 * (z-10); the wrapper is aria-hidden since interactive content lives in HUD/Modal.
 */
export function DesktopScene({ onOpenModal }: DesktopSceneProps) {
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

        {/* Clamped so the camera stays above the floor and can't get lost */}
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
          target={[0.25, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}
