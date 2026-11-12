"use client";

import { useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { BoxGeometry, MathUtils, Vector3 } from "three";
import { clampTarget, DECOR, OBJECTS, ORBIT_LIMITS, OVERVIEW, type Box, type RoomId, type Vec3 } from "@/lib/room";

const DAMP_LAMBDA = 6;
const ARRIVE_EPS = 0.005;

interface DesktopSceneProps {
  active: RoomId[];
  labels: Record<RoomId, string>;
  focus: RoomId | null;
  onSelect: (id: RoomId) => void;
  onBackgroundClick: () => void;
  /** Called when the WebGL context is lost so the page can fall back to Standard View. */
  onContextLost?: () => void;
  /** Jump to each pose instead of flying (prefers-reduced-motion). */
  reducedMotion?: boolean;
}

type ControlsImpl = ElementRef<typeof OrbitControls>;

// Deferred cursor clear (rAF) makes over/out ordering-safe when moving straight
// from one object to another: the new over re-sets the flag before the clear runs.
let interactiveHovered = false;

function Boxes({ boxes, geometry, hovered = false }: { boxes: Box[]; geometry: BoxGeometry; hovered?: boolean }) {
  return boxes.map((b, i) => (
    <mesh key={i} geometry={geometry} position={b.position} scale={b.size}>
      <meshStandardMaterial
        color={b.color}
        flatShading
        emissive={b.color}
        emissiveIntensity={b.glow ? (hovered ? 1.4 : 1) : hovered ? 0.3 : 0}
        toneMapped={!b.glow}
      />
    </mesh>
  ));
}

function RoomObject({
  id,
  label,
  clickable,
  showLabel,
  geometry,
  onSelect,
}: {
  id: RoomId;
  label: string;
  clickable: boolean;
  /** False while a panel is open: the camera is framed on an object and the label would sit over it. */
  showLabel: boolean;
  geometry: BoxGeometry;
  onSelect: (id: RoomId) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const boxes = OBJECTS[id].boxes;
  const labelAt = useMemo<Vec3>(() => {
    const lo = (a: number) => Math.min(...boxes.map((b) => b.position[a] - b.size[a] / 2));
    const hi = (a: number) => Math.max(...boxes.map((b) => b.position[a] + b.size[a] / 2));
    return [(lo(0) + hi(0)) / 2, hi(1) + 0.35, (lo(2) + hi(2)) / 2];
  }, [boxes]);

  // Drop hover state without waiting for a pointer move (after a click, or when the object stops being clickable).
  const clearHover = () => {
    interactiveHovered = false;
    document.body.style.cursor = "";
    setHovered(false);
  };
  // Lost clickability while hovered: no pointerout will come, so release the cursor here. `lit` already
  // drops the glow/label; the stale flag is reset when the object becomes clickable again.
  useEffect(() => {
    if (clickable || !hovered) return;
    interactiveHovered = false;
    document.body.style.cursor = "";
  }, [clickable, hovered]);
  const [wasClickable, setWasClickable] = useState(clickable);
  if (clickable !== wasClickable) {
    setWasClickable(clickable);
    if (clickable) setHovered(false);
  }

  const handlers = clickable
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          clearHover();
          onSelect(id);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          interactiveHovered = true;
          document.body.style.cursor = "pointer";
          setHovered(true);
        },
        onPointerOut: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          interactiveHovered = false;
          setHovered(false);
          requestAnimationFrame(() => {
            if (!interactiveHovered) document.body.style.cursor = "";
          });
        },
      }
    : {};

  const lit = clickable && hovered;
  return (
    <group {...handlers}>
      <Boxes boxes={boxes} geometry={geometry} hovered={lit} />
      {lit && showLabel && (
        <Html position={labelAt} center pointerEvents="none" zIndexRange={[5, 0]}>
          <span className="pointer-events-none whitespace-nowrap rounded-sm border border-line bg-surface/90 px-2 py-1 font-mono text-xs text-text-primary">
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}

/**
 * Flies the camera between the overview and each object pose with damped
 * easing. The pose change is detected inside useFrame so OrbitControls is
 * disabled on the same frame the flight starts (no fight with update()).
 * Controls come back only once the camera has arrived at the overview.
 */
function CameraRig({ focus, reducedMotion }: { focus: RoomId | null; reducedMotion: boolean }) {
  const pose = focus ? OBJECTS[focus].camera : OVERVIEW;

  const prevPose = useRef(OVERVIEW);
  const anim = useRef<{ to: Vector3; toTarget: Vector3 } | null>(null);
  const reducedRef = useRef(reducedMotion);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useFrame(({ camera, controls: c }, delta) => {
    const controls = c as ControlsImpl | null;
    if (!controls) return;

    if (pose !== prevPose.current) {
      prevPose.current = pose;
      anim.current = { to: new Vector3(...pose.position), toTarget: new Vector3(...pose.target) };
      controls.enabled = false;
    }

    const a = anim.current;
    if (!a) return;
    const pos = camera.position;
    const target = controls.target;
    if (reducedRef.current) {
      pos.copy(a.to);
      target.copy(a.toTarget);
    }
    pos.set(
      MathUtils.damp(pos.x, a.to.x, DAMP_LAMBDA, delta),
      MathUtils.damp(pos.y, a.to.y, DAMP_LAMBDA, delta),
      MathUtils.damp(pos.z, a.to.z, DAMP_LAMBDA, delta),
    );
    target.set(
      MathUtils.damp(target.x, a.toTarget.x, DAMP_LAMBDA, delta),
      MathUtils.damp(target.y, a.toTarget.y, DAMP_LAMBDA, delta),
      MathUtils.damp(target.z, a.toTarget.z, DAMP_LAMBDA, delta),
    );
    camera.lookAt(target);

    if (pos.distanceTo(a.to) < ARRIVE_EPS && target.distanceTo(a.toTarget) < ARRIVE_EPS) {
      pos.copy(a.to);
      target.copy(a.toTarget);
      anim.current = null;
      controls.enabled = focus === null;
    }
  });

  return null;
}

/** Pulls a panned target back into the room, moving the camera by the same amount so the view keeps its angle. */
function keepInRoom(e?: { target: ControlsImpl }) {
  const oc = e?.target;
  if (!oc) return;
  const t = oc.target;
  const [x, y, z] = clampTarget([t.x, t.y, t.z]);
  if (x === t.x && y === t.y && z === t.z) return;
  oc.object.position.add(new Vector3(x - t.x, y - t.y, z - t.z));
  t.set(x, y, z);
}

/**
 * Low-poly night bedroom built from unit boxes. Renders at z-0 behind the HUD
 * overlay; the wrapper is aria-hidden since interactive content lives in HUD/Modal.
 */
export function DesktopScene({
  active,
  labels,
  focus,
  onSelect,
  onBackgroundClick,
  onContextLost,
  reducedMotion = false,
}: DesktopSceneProps) {
  // R3F force-loses the context ~500ms after unmount; that is not a failure.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      interactiveHovered = false;
      document.body.style.cursor = "";
    };
  }, []);

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: OVERVIEW.position, fov: 35 }}
        onPointerMissed={onBackgroundClick}
        onCreated={({ gl }) =>
          gl.domElement.addEventListener("webglcontextlost", () => {
            if (mountedRef.current) onContextLost?.();
          })
        }
      >
        <color attach="background" args={["#0f0d17"]} />
        <ambientLight intensity={0.45} color="#b9a8d6" />
        {/* Desk lamp head: the main warm source. */}
        <pointLight position={[1.07, 1.5, 0.57]} intensity={9} distance={9} decay={1.6} color="#ffb86b" />
        <pointLight position={[2.2, 1.8, 0.8]} intensity={1.5} distance={3} color="#9be7c4" />
        <pointLight position={[2.2, 2.6, 0.6]} intensity={2} distance={5} color="#6f8fd6" />
        {/* Cool moonlight from the window side keeps the dark faces readable. */}
        <directionalLight position={[4, 7, 1]} intensity={0.7} color="#8fa3d9" />

        <Boxes boxes={DECOR} geometry={geometry} />
        {(Object.keys(OBJECTS) as RoomId[]).map((id) => (
          <RoomObject
            key={id}
            id={id}
            label={labels[id]}
            clickable={active.includes(id)}
            showLabel={focus === null}
            geometry={geometry}
            onSelect={onSelect}
          />
        ))}

        <ContactShadows position={[3, 0.002, 3]} opacity={0.6} scale={6} blur={2.2} far={2.5} resolution={512} frames={1} color="#0f0d17" />

        <CameraRig focus={focus} reducedMotion={reducedMotion} />

        <OrbitControls
          makeDefault
          enableDamping={false}
          enableZoom
          enablePan
          target={OVERVIEW.target}
          minAzimuthAngle={ORBIT_LIMITS.minAzimuth}
          maxAzimuthAngle={ORBIT_LIMITS.maxAzimuth}
          minPolarAngle={ORBIT_LIMITS.minPolar}
          maxPolarAngle={ORBIT_LIMITS.maxPolar}
          minDistance={ORBIT_LIMITS.minDistance}
          maxDistance={ORBIT_LIMITS.maxDistance}
          onChange={keepInRoom}
        />
      </Canvas>
    </div>
  );
}
