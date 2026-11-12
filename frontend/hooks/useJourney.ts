"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nearestStopIndex, scrollTopFor, snapTarget } from "@/lib/journey";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SNAP_DELAY_MS = 150;

interface JourneyOptions {
  count: number;
  /** Listen to scroll only while the 3D journey is on screen. */
  enabled: boolean;
  /** A modal is open: freeze page scroll without moving it. */
  locked: boolean;
}

/**
 * Native-scroll journey: scroll position is the single source of truth for the active stop.
 * Scroll is never hijacked; a snap to the nearest stop runs only after scrolling has been idle.
 */
export function useJourney({ count, enabled, locked }: JourneyOptions) {
  const reducedMotion = useReducedMotion();
  const [rawIndex, setRawIndex] = useState(0);
  const activeIndex = Math.min(rawIndex, Math.max(0, count - 1));
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

    const sync = () => {
      setRawIndex(nearestStopIndex(window.scrollY, window.innerHeight, count));
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (lockedRef.current) return;
        const top = snapTarget(window.scrollY, window.innerHeight, count);
        if (top !== null) window.scrollTo({ top, behavior });
      }, SNAP_DELAY_MS);
    };

    const raf = requestAnimationFrame(sync);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [enabled, count, reducedMotion]);

  useEffect(() => {
    if (!enabled || !locked) return;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev.overflow;
      root.style.scrollbarGutter = prev.gutter;
    };
  }, [enabled, locked]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(0, index), Math.max(0, count - 1));
      window.scrollTo({
        top: scrollTopFor(clamped, window.innerHeight),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [count, reducedMotion],
  );

  return { activeIndex, goTo, reducedMotion };
}
