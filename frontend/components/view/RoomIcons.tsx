import type { ReactNode } from "react";
import type { RoomId } from "@/lib/room";

/** Flat low-poly icons for each room object, in the scene's night-palette colors. */
const ICONS: Record<RoomId, ReactNode> = {
  about: (
    <>
      <rect x="4" y="30" width="40" height="10" fill="#4a3a33" />
      <rect x="6" y="20" width="36" height="12" fill="#d8c9b8" />
      <rect x="8" y="22" width="12" height="6" fill="#d8c9b8" />
      <rect x="6" y="28" width="36" height="8" fill="#b5544d" />
    </>
  ),
  showcase: (
    <>
      <rect x="20" y="36" width="8" height="4" fill="#2a2a2a" />
      <rect x="8" y="10" width="32" height="22" fill="#2a2a2a" />
      <rect x="11" y="13" width="26" height="16" fill="#9be7c4" />
    </>
  ),
  stack: (
    <>
      <rect x="14" y="6" width="20" height="36" fill="#1f2430" />
      <rect x="18" y="12" width="12" height="3" fill="#9be7c4" />
      <rect x="18" y="19" width="12" height="3" fill="#3d4a66" />
    </>
  ),
  experience: (
    <>
      <rect x="10" y="6" width="28" height="36" fill="#e0a458" />
      <polygon points="14,12 34,12 24,24" fill="#4a3a33" />
    </>
  ),
  journal: (
    <>
      <rect x="6" y="30" width="36" height="6" fill="#8a5e41" />
      <rect x="8" y="22" width="30" height="6" fill="#c9915a" />
      <rect x="6" y="14" width="34" height="6" fill="#8a5e41" />
    </>
  ),
  contact: (
    <>
      <rect x="15" y="4" width="18" height="40" rx="2" fill="#111111" />
      <rect x="17" y="8" width="14" height="28" fill="#3d5a9e" />
    </>
  ),
};

/** Small inline icon of a room object, matching the night bedroom scene's colors. */
export function RoomIcon({ id, className }: { id: RoomId; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className={className}>
      {ICONS[id]}
    </svg>
  );
}
