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
const MODEL_LAYOUT: (SceneModelLayout & { key: string })[] = [
  {
    key: "desk",
    url: "/glb/desk.glb",
    position: [0, 0, 0],
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
    id: "cs-pensioner-admin",
    position: [-0.0200, 0.9439, -0.0074],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.0016, 0.0016, 0.0016],
  },
  {
    key: "notebook",
    url: "/glb/notebook.glb",
    id: "jrn-japanese",
    position: [0.2034, 0.9366, 0.1812],
    // Rotate π so the spine rings sit at the back; the top cover faces the camera.
    rotation: [0, Math.PI / 9, 0],
    scale: [3.2145e-7, 3.2145e-7, 3.2145e-7],
  },
  {
    key: "whiteboard",
    url: "/glb/whiteboard.glb",
    position: [0.242, 0.84, -1.7],
    rotation: [0, -Math.PI / 2, 0],
    scale: [1, 1, 1],
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
      <Canvas dpr={[1, 2]} camera={{ position: [0.5, 1.7, 3.4], fov: 45 }}>
        {/* Dim cool base light (slate) */}
        <ambientLight intensity={0.35} color="#5c6f92" />
        {/* Sky/ground gradient for soft depth — no flat mud */}
        <hemisphereLight intensity={0.45} color="#8fa3c4" groundColor="#1e293b" />
        {/* Emerald key light pooling onto the desk */}
        <spotLight
          position={[1.8, 4, 2.2]}
          angle={0.55}
          penumbra={0.8}
          intensity={90}
          color="#10b981"
        />
        {/* Cool fill from the front-left so PC + notebook read clearly */}
        <directionalLight position={[-2.5, 2, 3]} intensity={1.4} color="#b6c3d6" />
        {/* Violet glow in front of the screen — tints, doesn't blow out */}
        <pointLight position={[-0.02, 1.25, 0.9]} intensity={5} distance={3} color="#8b5cf6" />

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
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}
