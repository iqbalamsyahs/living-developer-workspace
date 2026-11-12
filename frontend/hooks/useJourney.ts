"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nearestStopIndex, scrollTopFor, settleIndex } from "@/lib/journey";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SNAP_DELAY_MS = 150;
// A programmatic smooth scroll owns the page until it lands or this long passes.
const GOTO_GRACE_MS = 3000;

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
  const flight = useRef<{ top: number; until: number } | null>(null);
  // Last stop the page settled on: the origin that gives a small scroll its direction.
  const settled = useRef(0);
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
        const f = flight.current;
        if (f && Date.now() < f.until && Math.abs(window.scrollY - f.top) > 2) {
          sync();
          return;
        }
        const landed = f !== null;
        flight.current = null;
        const h = window.innerHeight;
        const index = landed ? nearestStopIndex(window.scrollY, h, count) : settleIndex(window.scrollY, h, count, settled.current);
        settled.current = index;
        const top = scrollTopFor(index, h);
        if (Math.abs(window.scrollY - top) > 2) {
          flight.current = { top, until: Date.now() + GOTO_GRACE_MS };
          window.scrollTo({ top, behavior });
        }
      }, SNAP_DELAY_MS);
    };

    const cancelFlight = () => {
      flight.current = null;
    };
    // The viewport height changed: keep the same stop instead of re-deriving it from stale pixels.
    const onResize = () => {
      flight.current = null;
      clearTimeout(timer);
      const index = Math.min(settled.current, Math.max(0, count - 1));
      window.scrollTo({ top: scrollTopFor(index, window.innerHeight), behavior: "auto" });
      setRawIndex(index);
    };
    const raf = requestAnimationFrame(sync);
    window.addEventListener("wheel", cancelFlight, { passive: true });
    window.addEventListener("touchstart", cancelFlight, { passive: true });
    window.addEventListener("keydown", cancelFlight);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", cancelFlight);
      window.removeEventListener("touchstart", cancelFlight);
      window.removeEventListener("keydown", cancelFlight);
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
      const top = scrollTopFor(clamped, window.innerHeight);
      flight.current = { top, until: Date.now() + GOTO_GRACE_MS };
      window.scrollTo({
        top,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [count, reducedMotion],
  );

  return { activeIndex, goTo, reducedMotion };
}
