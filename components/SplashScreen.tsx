"use client";

import { useEffect } from "react";

interface SplashScreenProps {
  /** True once the minimum splash time has elapsed — start the fade-out. */
  leaving: boolean;
  /** Fired when the fade-out transition completes — parent unmounts us. */
  onTransitionEnd: () => void;
}

/**
 * Full-screen boot splash covering the first paint so the StandardView ->
 * Desktop HUD flip (SSR media-query default is mobile) happens invisibly.
 * Opaque at z-50 (above the modal top-layer is fine — nothing can be open
 * during boot); the 3D scene mounts underneath, then this fades out.
 */
export function SplashScreen({ leaving, onTransitionEnd }: SplashScreenProps) {
  // Lock scroll while the splash is up: the StandardView rendered behind it
  // (SSR mobile default) is taller than the viewport, so it would scroll. Must
  // lock BOTH html and body — overflow on body alone doesn't propagate to the
  // viewport when html is still `visible`, so the document scrollbar remains.
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div
      aria-hidden
      onTransitionEnd={onTransitionEnd}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <span aria-hidden="true" className="h-2 w-2 animate-pulse bg-primary" />
        <p className="font-display text-2xl leading-none text-text-primary">
          Ibang.dev
        </p>
        <p className="font-mono text-xs text-text-secondary">
          booting the desk…
        </p>
      </div>
    </div>
  );
}
