"use client";

import { useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

// Shared hover flag. Deferred cursor-clear (rAF) makes over/out ordering-safe:
// moving monitor -> notebook fires both events in one frame; the notebook's
// onPointerOver re-sets this flag before the deferred clear checks it, so the
// clear no-ops. No double-clearing, no 'stuck arrow'.
let interactiveHovered = false;

export type SceneModelLayout = {
  url: string;
  /** Present => model is clickable and shows the pointer cursor. */
  id?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

interface SceneModelProps {
  layout: SceneModelLayout;
  onOpenModal: (id: string) => void;
}

export function SceneModel({ layout, onOpenModal }: SceneModelProps) {
  const { scene } = useGLTF(layout.url); // cached by URL inside drei

  // Safety net: whole-scene unmount (Standard View toggle) resets the cursor.
  useEffect(() => {
    return () => {
      interactiveHovered = false;
      document.body.style.cursor = "";
    };
  }, []);

  const interactive = !!layout.id;
  const handlers = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // Ignore clicks that followed an orbit drag (OrbitControls listens on
          // the DOM canvas, so stopPropagation can't suppress the double-fire).
          if (e.delta > 4) return;
          if (layout.id) onOpenModal(layout.id);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          interactiveHovered = true;
          document.body.style.cursor = "pointer";
        },
        onPointerOut: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          interactiveHovered = false;
          requestAnimationFrame(() => {
            if (!interactiveHovered) document.body.style.cursor = "";
          });
        },
      }
    : {};

  return (
    <group
      position={layout.position}
      rotation={layout.rotation}
      scale={layout.scale}
    >
      <primitive object={scene} {...handlers} />
    </group>
  );
}
