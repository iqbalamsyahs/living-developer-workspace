/**
 * Shared viewport-fixed mount for the in-scene <Html transform> panels. drei's wrapper is
 * position:absolute, so portalling straight into <body> scrolls the panel away with the page.
 * Mounted on <body> (not inside the aria-hidden canvas wrapper) to keep its controls reachable.
 */
export function getOverlayRoot(): HTMLElement {
  const existing = document.getElementById("scene-overlay");
  if (existing) return existing;
  const root = document.createElement("div");
  root.id = "scene-overlay";
  root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:30";
  document.body.appendChild(root);
  return root;
}
