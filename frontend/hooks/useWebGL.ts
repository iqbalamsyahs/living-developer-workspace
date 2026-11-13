"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function probe(): boolean {
  if (cached === null) {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  }
  return cached;
}

const subscribe = () => () => {};

/** null on the server and during hydration, then whether the browser can create a WebGL context. */
export function useWebGL(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, probe, () => null);
}
