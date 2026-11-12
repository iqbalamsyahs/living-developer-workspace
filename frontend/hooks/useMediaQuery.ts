"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR/hydration-safe media query hook via useSyncExternalStore (the React
 * pattern for subscribing to an external system like matchMedia). The server
 * snapshot is `false` (mobile default); the real value arrives on mount.
 * Match against `(min-width: 768px)` for the desktop HUD. The boot splash in
 * page.tsx covers the StandardView->HUD flip, so the late `true` is invisible.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
