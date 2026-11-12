# Scroll Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On desktop, native page scroll drives the camera from stop to stop on the 3D desk (intro, about, stack, experience, projects, journal, contact), with clickable objects, progress dots and limited free rotation.

**Architecture:** A pure module (`lib/journey.ts`) builds the stop list from Sanity data and maps scroll position to stops. A client hook (`useJourney`) owns scroll (the single source of truth: native scroll, invisible spacer, snap after scroll stops) and exposes `activeIndex` and `goTo`. `HomeClient` derives `zoomTarget` from the active stop and feeds the existing `CameraRig`, which is extended with reduced-motion snapping and limited rotation. Stops without an in-scene screen (experience, journal) show a DOM overlay panel.

**Tech Stack:** Next.js 16 App Router (read `frontend/node_modules/next/dist/docs/` before touching Next APIs), React 19, TypeScript strict, Tailwind v4, React Three Fiber + drei, `node:test` (Node type stripping), pnpm.

**Spec:** `docs/superpowers/specs/2026-11-12-scroll-journey-design.md` (decisions below marked "Ruling" are mine where the spec hands the choice to the builder).

## Global Constraints

- Desktop only (`min-width: 768px` and WebGL available, as `HomeClient` already gates). Mobile / no WebGL / scene failure keep Standard View and never render the spacer.
- Camera stays perspective (`fov: 35`); update the PRD note (Task 8).
- All Sanity data is nullable; a stop with empty content is skipped. `intro`, `about`, `contact` always exist (fallback text).
- Native scroll, never hijacked or locked (except while a modal is open). Canvas stays `fixed`; spacer height = `stops.length * 100vh`.
- Scroll is the only writer of the active stop. Clicking an object or HUD item calls `goTo`, it does not set `zoomTarget`.
- Limited rotation: azimuth within ±0.26 rad and polar within ±0.15 rad of the stop pose, springs back to the pose after release. Zoomed stops stay locked as today.
- `prefers-reduced-motion`: camera jumps to the stop pose without damping and snapping uses `behavior: "auto"`.
- Accessible: progress dots are buttons in a labelled group, keyboard focusable; panels keep existing modal/ARIA rules. Tailwind tokens from `DESIGN.md`, no raw colour classes.
- Tests: `pnpm --dir frontend test` (pure modules, `node:test`, `.ts` import extensions). Browser checks use the CDP script from Task 1.

## Review Focus

1. All journey data empty (no projects, journal, experiences, stack): stops are `intro, about, contact`; dots, spacer height and Esc still work.
2. Modal open: page scroll locked, scroll position and active stop unchanged, closing returns to the same stop (no jump to top).
3. Wheel over an in-scene panel (showcase grid scrolls internally): must not trap the user; dots and keyboard always escape.
4. Resize / viewport height change: snap targets recompute, no scroll fighting between smooth scroll and snap.
5. Reduced motion: no damped flight, no smooth scroll; page still navigable.

---

### Task 1: CDP screenshot tool for browser verification

**Files:**
- Create: `frontend/scripts/e2e/shoot.mjs`

**Interfaces:**
- Produces: `node scripts/e2e/shoot.mjs <outDir> [--w 1440 --h 900 --reduced-motion] <step>...` where a step is `name:action[:arg]`; actions: `wait:<ms>`, `scroll:<px>`, `click:<x>,<y>`, `key:<Key>`, `shot` (writes `<outDir>/<name>.png`), `log` (prints `window.scrollY` and the count of `.glb` requests seen). Launches headless Chrome with SwiftShader WebGL over CDP using Node's global `WebSocket`; no new dependencies.

- [ ] **Step 1: Implement** the script (generalise the throwaway driver used earlier: spawn Chrome with `--remote-debugging-port`, `Emulation.setDeviceMetricsOverride`, `Emulation.setEmulatedMedia` for reduced motion, `Input.dispatchMouseEvent`/`dispatchKeyEvent`, `Page.captureScreenshot`, `Network.requestWillBeSent` counting `.glb`).
- [ ] **Step 2: Run** `node scripts/e2e/shoot.mjs ../.superpowers/shots home:wait:8000 home:shot` with the dev server up. Expected: `home.png` shows the desk.
- [ ] **Step 3: Commit.**

---

### Task 2: Pure journey model

**Files:**
- Create: `frontend/lib/journey.ts`
- Test: `frontend/lib/journey.test.ts`

**Interfaces:**
- Consumes: `PortfolioData` from `lib/portfolio.ts` (`import type` only).
- Produces:
  - `type StopId = "intro" | "about" | "stack" | "experience" | "showcase" | "journal" | "contact"`
  - `interface Stop { id: StopId; zoomTarget: "about" | "stack" | "pc" | "contact" | null; label: string }`
  - `buildStops(p: PortfolioData): Stop[]` order: intro (null), about ("about"), stack ("stack", only if stack or services non-empty), experience (null, only if `items.about.experiences` non-empty), showcase ("pc", only if projects non-empty), journal (null, only if journalEntries non-empty), contact ("contact"). Labels: Intro, About, Stack, Experience, Projects, Journal, Contact.
  - `nearestStopIndex(scrollY: number, viewportH: number, count: number): number` (rounded, clamped to `0..count-1`; `count 0` returns 0).
  - `scrollTopFor(index: number, viewportH: number): number`
  - `snapTarget(scrollY: number, viewportH: number, count: number): number | null` (the `scrollTop` to snap to, or `null` when already within 2 px).
  - `stopIndexForContent(stops: Stop[], contentId: string, journalIds: string[]): number` (`showcase`, `about`, `stack`, `contact` map to their stop; any id in `journalIds` maps to `journal`; anything else, including `resume`, returns `-1`).

- [ ] **Step 1: Write the failing tests**: full data yields the 7 stops in order; empty `buildPortfolio({})` yields exactly `["intro","about","contact"]`; only projects present adds only `showcase`; `nearestStopIndex(0, 900, 5) === 0`, `(449, 900, 5) === 0`, `(451, 900, 5) === 1`, `(99999, 900, 5) === 4`, `(−50, 900, 5) === 0`, `(0, 900, 0) === 0`; `scrollTopFor(3, 800) === 2400`; `snapTarget(901, 900, 5) === null`, `snapTarget(1100, 900, 5) === 900`; `stopIndexForContent` cases above including `-1` for `resume` and for a journal id when no journal stop exists.
- [ ] **Step 2: Run** `pnpm test lib/journey.test.ts`; expected FAIL (module missing).
- [ ] **Step 3: Implement** the functions above in `lib/journey.ts`.
- [ ] **Step 4: Run** the test and `pnpm tsc --noEmit`; expected PASS.
- [ ] **Step 5: Commit.**

---

### Task 3: `useJourney` hook and spike removal

**Files:**
- Create: `frontend/hooks/useJourney.ts`, `frontend/hooks/useReducedMotion.ts`
- Modify: `frontend/components/HomeClient.tsx` (delete `SPIKE_STAGES` and its scroll effect)

**Interfaces:**
- Consumes: `Stop`, `nearestStopIndex`, `scrollTopFor`, `snapTarget` (Task 2); `useMediaQuery` for reduced motion.
- Produces: `useReducedMotion(): boolean`; `useJourney(opts: { count: number; enabled: boolean; locked: boolean }): { activeIndex: number; goTo: (index: number) => void; reducedMotion: boolean }`. `enabled` false disables listeners; `locked` true (modal open) sets `document.documentElement.style.overflow = "hidden"` with `scrollbar-gutter: stable` and ignores snap; unlocking restores it and does not change `scrollY`. Snap runs 150 ms after the last scroll event via `window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" })` and never while a smooth scroll started by `goTo` is still running (track with a ref cleared on the next idle).

- [ ] **Step 1: Implement** both hooks; `activeIndex` is state updated from the scroll listener (passive) only when it changes. Ruling: scroll position is read from `window.scrollY` and `window.innerHeight` at event time, so resizes are handled by recomputing on `resize` too.
- [ ] **Step 2: Wire** `HomeClient`: `const stops = useMemo(() => buildStops(portfolio), [portfolio])`, `const journey = useJourney({ count: stops.length, enabled: showHUD, locked: activeModal != null })`, `zoomTarget = showHUD ? stops[journey.activeIndex]?.zoomTarget ?? null : null`; replace the spacer height with `stops.length * 100vh`; remove the `zoomTarget` state setter paths (`setZoomTarget`, `closeShowcase`'s zoom reset).
- [ ] **Step 3: Verify** `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`. In the browser: scrolling with the wheel moves the camera between stops with the existing zooms (about, pc, contact), page never locks, scroll stops snap to a stop.
- [ ] **Step 4: Commit.**

---

### Task 4: CameraRig: reduced motion and limited rotation

**Files:**
- Modify: `frontend/components/scene/DesktopScene.tsx` (`CameraRig`, `DesktopSceneProps`)

**Interfaces:**
- Consumes: `reducedMotion: boolean` prop (new), existing `zoomTarget`.
- Produces: `DesktopSceneProps.reducedMotion?: boolean`. `CameraRig` behaviour: when `reducedMotion`, a stop change sets position/target/up instantly (no damp) and calls `onZoomed` at once; at the overview pose (`zoomTarget == null`) OrbitControls is enabled with `minAzimuthAngle`/`maxAzimuthAngle` = current azimuth ± 0.26, `minPolarAngle`/`maxPolarAngle` = current polar ± 0.15 (set when the pose is reached), `enableZoom` false, `enablePan` false; on OrbitControls `end` event a `returning` flag makes the next frames damp back to the stored stop pose, then re-enable controls.

- [ ] **Step 1: Implement** (listen to `oc.addEventListener("end", ...)` in an effect; remove on cleanup). Ruling: the stored pose is the pose captured on arrival at the overview stop, not recomputed from `DEFAULT_TARGET`.
- [ ] **Step 2: Verify** in the browser: drag at the overview rotates a little then eases back; cannot orbit past the limits; with `--reduced-motion` stop changes jump instantly.
- [ ] **Step 3: Commit.**

---

### Task 5: Whiteboard stop (stack) and in-scene panel

**Files:**
- Modify: `frontend/components/scene/layout.ts` (`ZOOM_VIEWS.stack`, `SCREENS.stack`), `frontend/components/scene/DesktopScene.tsx` (render `StackScreen`)
- Create: `frontend/components/scene/StackScreen.tsx`, `frontend/scripts/glb/measure-bounds.mjs`

**Interfaces:**
- Consumes: `ContentItem` (`items.stack`), `categoryLabel`, `TechPill`, same `Html` pattern as `AboutScreen.tsx` (portal to `document.body`, `overscroll-behavior: contain`).
- Produces: `ZOOM_VIEWS.stack` and `SCREENS.stack` entries; `StackScreen({ position, widthPx, heightPx, content, onClose })`.

- [ ] **Step 1: Measure** the whiteboard: `node scripts/glb/measure-bounds.mjs public/glb/whiteboard.glb` prints the world bounds and face normal of the board surface; combine with its `MODEL_LAYOUT` transform (`position [0.5,0.84,1.31]`, `rotation [0,π/2,0]`) to get the board's four corners in world space.
- [ ] **Step 2: Add** `SCREENS.stack` (bl, br, tl corners from step 1) and `ZOOM_VIEWS.stack` (`screenOffset` from the model origin to the board centre, `camDir` = the board's front normal, `camUp` `[0,1,0]`, `camDist` so the board fills about 70% of the viewport height).
- [ ] **Step 2b: Implement** `StackScreen` listing the stack grouped by category and the services (tabs not needed here); empty groups are not rendered.
- [ ] **Step 3: Verify** with the CDP tool: scrolling to the stack stop shows the board centred and upright with the panel inside it; screenshot reviewed.
- [ ] **Step 4: Commit.**

---

### Task 6: Overlay panels for intro, experience and journal

**Files:**
- Create: `frontend/components/journey/StopOverlay.tsx`
- Modify: `frontend/components/HomeClient.tsx` (render it)

**Interfaces:**
- Consumes: `Stop`, `PortfolioData`, `ExperienceTimeline`, `RichText`, `hireMeHref`/`resumeHref`.
- Produces: `StopOverlay({ stop, portfolio, onOpen }: { stop: Stop; portfolio: PortfolioData; onOpen: (id: string) => void })`, rendered fixed at the left of the viewport (`z-10`, `pointer-events-auto` only on the card). Content per stop: intro = name, hero tagline, Resume (when href exists); experience = `ExperienceTimeline`; journal = entry list (title, date), each row calls `onOpen(entry.id)`; other stops render a one-line caption from `siteConfig.headings`. Null data renders nothing for that part, never an empty card. Panel uses `overscroll-behavior: contain` and `max-h` with internal scroll.

- [ ] **Step 1: Implement** `StopOverlay` with a CSS fade (opacity transition, disabled under `prefers-reduced-motion`).
- [ ] **Step 2: Verify** in the browser: each stop shows its panel; the intro stop has Resume; with `NEXT`-side data blanked (temporarily pass an empty portfolio in a scratch run) no empty cards appear.
- [ ] **Step 3: Commit.**

---

### Task 7: Progress dots, contact button, hint, click-to-scroll, modal behaviour

**Files:**
- Create: `frontend/components/journey/ProgressDots.tsx`
- Modify: `frontend/components/view/HUD.tsx`, `frontend/components/HomeClient.tsx`

**Interfaces:**
- Consumes: `useJourney` (`activeIndex`, `goTo`), `stopIndexForContent`, `Stop[]`.
- Produces: `ProgressDots({ stops, activeIndex, onSelect }: ...)`: `role="group"` `aria-label="Journey progress"`, one button per stop (`aria-label` "Go to <label>", `aria-current="step"` on the active one), text counter "02/06" beside it. `HUD` props add `onContact: () => void` (always-visible "Contact" button, scrolls to the contact stop) and `journeyHint: boolean` (replaces "Drag to rotate · Click glowing objects to inspect" with "Scroll to explore · Click glowing objects").

- [ ] **Step 1: Rework `openContent(id)`** in `HomeClient`: `const i = stopIndexForContent(stops, id, journalIds)`; if `showHUD && i >= 0` then `journey.goTo(i)` (no modal; clicking the active stop's object does nothing); otherwise open the modal as today (Standard View, resume, journal entries). Journal entry rows from `StopOverlay` open the modal directly (`setActiveModal(id)`).
- [ ] **Step 2: Esc** while no modal is open and the active stop is not `intro` scrolls to stop 0; Esc inside a modal is handled by the dialog as today.
- [ ] **Step 3: Implement** `ProgressDots` and the HUD changes; keyboard: dots are native buttons, arrow keys move focus between them.
- [ ] **Step 4: Verify** in the browser: clicking the monitor scrolls to the projects stop; clicking a dot jumps; Contact button reaches the contact stop; opening a modal locks scroll and closing it keeps the same stop; Esc returns to intro.
- [ ] **Step 5: Commit.**

---

### Task 8: End-to-end verification and docs

**Files:**
- Modify: `docs/prd.md` (camera note: perspective, fov 35), `frontend/components/scene/layout.ts` comments if stale.

- [ ] **Step 1:** `pnpm test`, `pnpm tsc --noEmit`, `pnpm lint` from `frontend/`; `node --test ../content/`.
- [ ] **Step 2: Desktop pass** with the CDP tool: walk all stops (screenshots), dots, Contact button, modal lock/unlock, limited rotation, Resume/Hire me visible at every stop.
- [ ] **Step 3: Reduced motion** (`--reduced-motion`): instant camera, no smooth scroll.
- [ ] **Step 4: Mobile 390 px**: Standard View, zero `.glb`, no spacer. **No WebGL / scene failure**: Standard View with the notice, no spacer, page scrolls normally.
- [ ] **Step 5: Empty data** pass (Review Focus 1) and a resize pass (Review Focus 4).
- [ ] **Step 6: Update** the PRD note and commit. Ask the owner for visual sign-off (smoothness, stop framing).
