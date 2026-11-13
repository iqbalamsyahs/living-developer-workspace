"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

/** True when the user asked the OS/browser for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
