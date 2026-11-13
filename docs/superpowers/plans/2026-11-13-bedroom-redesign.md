# Bedroom Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the GLB desk + scroll journey with a code-built low-poly night bedroom the visitor orbits freely and clicks, plus a recolored 2D view.

**Architecture:** One pure data module (`lib/room.ts`) holds every box of the room, which objects are clickable, camera poses and clamps, and which objects have content. `components/scene/DesktopScene.tsx` is rewritten to render that table (no model files) and reuses the existing `CameraRig` flight. `HomeClient` drops the journey and drives a single right-hand `RoomPanel` keyed by the focused object; project and journal details still open the existing `Modal`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, three + @react-three/fiber + @react-three/drei, `node --test`, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-13-bedroom-redesign-design.md`

## Global Constraints

- No new dependencies. Remove `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`, `meshoptimizer`; remove `sharp` only after confirming nothing in the app needs it.
- Canvas never loads on mobile or without WebGL: keep `dynamic(() => import(...DesktopScene), { ssr: false })`, `useWebGL`, `SceneBoundary`, and the `webglcontextlost` fallback.
- All Sanity data may be null. An object with empty content is still drawn but has no hover, no click, and no nav entry.
- `prefers-reduced-motion`: the camera jumps instead of flying.
- UI copy stays English. Fonts unchanged.
- Palette replaces navy/green everywhere: base `#0f0d17`, surface `#1a1626`, line `#2c2540`, accent `#ffb86b`, text `#f3ece4`, text secondary `#a99fb5`, plus a soft-purple secondary accent. Final values may shift but body text must pass WCAG AA (4.5:1) on base and surface.
- No `#0f172a`, `#10b981`, `#1e293b`, `slate-*`, or `emerald-*` left in `frontend/app`, `frontend/components`, `frontend/lib` after Task 6.
- Read the relevant guide in `frontend/node_modules/next/dist/docs/` before touching any Next API.
- `lib/*.ts` files imported by tests may only `import type` from other modules without a `.ts` extension (node strips types; value imports without an extension fail under `node --test`).
- All commands run from `frontend/`.

## Review Focus

1. **Empty CMS:** with no projects, no stack, no journal, no experience, no bio, and no email, every object still renders, none is clickable, the nav is empty, and no panel can open. Pinned by `activeRoomIds` tests in Task 1.
2. **Panning out of the room:** dragging with right-button/shift must never move the orbit target outside the room or let the camera see past the walls or under the floor. Pinned by `clampTarget` tests in Task 1 plus the screenshot check in Task 3.
3. **Escape with two layers open:** a project or journal `Modal` opened from the panel closes first on Esc; the panel stays open and the camera stays put. Checked in Task 4.
4. **WebGL context lost or scene crash while a panel is open:** page falls back to Standard View, the panel state clears, the status message shows. Checked in Task 4 with `--no-webgl` and a forced context loss.
5. **Keyboard-only visitor:** HUD nav buttons open the panel, focus moves to the panel's close button, closing returns focus to the triggering nav button. Checked in Task 4.

---

### Task 1: Room data and pure logic

**Files:**
- Create: `frontend/lib/room.ts`
- Test: `frontend/lib/room.test.ts`

**Interfaces:**
- Produces (all exported from `lib/room.ts`):
  - `type Vec3 = [number, number, number]`
  - `type RoomId = "about" | "showcase" | "stack" | "experience" | "journal" | "contact"`
  - `const ROOM_ORDER: RoomId[]` = `["about", "showcase", "stack", "experience", "journal", "contact"]` (nav order)
  - `const ROOM_LABELS: Record<RoomId, string>` = `{ about: "About", showcase: "Projects", stack: "Stack", experience: "Experience", journal: "Journal", contact: "Contact" }`
  - `interface Box { position: Vec3; size: Vec3; color: string; glow?: boolean }` (three.js space, y up, `position` is the box center)
  - `function fromSketch(x, y, z, w, d, h: number, color: string, glow?: boolean): Box`
  - `const DECOR: Box[]` (room shell + window, lamp, chair, rug, wall shelf, plant)
  - `const OBJECTS: Record<RoomId, { boxes: Box[]; camera: { position: Vec3; target: Vec3 } }>` (monitor→showcase, PC→stack, bookshelf→journal, poster→experience, bed→about, phone→contact)
  - `const OVERVIEW: { position: Vec3; target: Vec3 }`
  - `const ORBIT_LIMITS: { minAzimuth: number; maxAzimuth: number; minPolar: number; maxPolar: number; minDistance: number; maxDistance: number }`
  - `function clampTarget(t: Vec3): Vec3`
  - `function activeRoomIds(p: PortfolioData): RoomId[]` (`import type { PortfolioData } from "./portfolio"`)

- [x] **Step 1: Write the failing tests in `lib/room.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPortfolio } from "./portfolio.ts";
import { activeRoomIds, clampTarget, fromSketch, OBJECTS, ORBIT_LIMITS, OVERVIEW, ROOM_ORDER } from "./room.ts";

test("fromSketch maps sketch (x,y floor; z up) to a centered three.js box", () => {
  const b = fromSketch(0, 0, -0.2, 6, 6, 0.2, "#6b4a3a");
  assert.deepEqual([b.position, b.size, b.color, !!b.glow], [[3, -0.1, 3], [6, 0.2, 6], "#6b4a3a", false]);
});

test("empty CMS: nothing is clickable", () => {
  assert.deepEqual(activeRoomIds(buildPortfolio({})), []);
});

test("each object turns on only with its own content, in nav order", () => {
  const p = buildPortfolio({
    profile: {
      _id: "profile",
      bio: [{ _type: "block", children: [{ _type: "span", text: "hi" }] }] as never,
      stack: [{ name: "React", category: "framework" }],
      experiences: [{ position: "Dev", company: "X", startDate: "2020-01", description: [] }],
      contact: { email: "a@b.co" },
    },
    projects: [{ _id: "p1" }],
    journalEntries: [{ _id: "j1" }],
  });
  assert.deepEqual(activeRoomIds(p), ROOM_ORDER);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", services: [{ name: "a", description: "b" }] } })), ["stack"]);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", philosophy: "x" } })), ["about"]);
  assert.deepEqual(activeRoomIds(buildPortfolio({ profile: { _id: "profile", contact: { email: "" } } })), []);
});

test("clampTarget keeps the orbit target inside the room", () => {
  assert.deepEqual(clampTarget([-5, -5, 99]), [1, 0.5, 5]);
  assert.deepEqual(clampTarget([3, 1.5, 3]), [3, 1.5, 3]);
});

test("every pose looks from the open side and overview obeys the orbit limits", () => {
  for (const pose of [OVERVIEW, ...Object.values(OBJECTS).map((o) => o.camera)]) {
    assert.ok(pose.position[0] > pose.target[0] && pose.position[2] > pose.target[2], "camera on +x/+z side");
    assert.ok(pose.position[1] > 0, "camera above floor");
  }
  const [dx, dy, dz] = OVERVIEW.position.map((v, i) => v - OVERVIEW.target[i]);
  const dist = Math.hypot(dx, dy, dz);
  const azimuth = Math.atan2(dx, dz);
  const polar = Math.acos(dy / dist);
  assert.ok(dist >= ORBIT_LIMITS.minDistance && dist <= ORBIT_LIMITS.maxDistance);
  assert.ok(azimuth >= ORBIT_LIMITS.minAzimuth && azimuth <= ORBIT_LIMITS.maxAzimuth);
  assert.ok(polar >= ORBIT_LIMITS.minPolar && polar <= ORBIT_LIMITS.maxPolar);
});
```

- [x] **Step 2: Run to verify failure**

Run: `node --test lib/room.test.ts`
Expected: FAIL, cannot find module `./room.ts`.

- [x] **Step 3: Implement `lib/room.ts`**

- `fromSketch` converts the spec appendix format `[x, y, z, w, d, h]` (x/y on the floor, z up) to `position: [x + w/2, z + h/2, y + d/2]`, `size: [w, h, d]`. Build `DECOR` and `OBJECTS[*].boxes` by calling it with the spec appendix rows as the starting point; split rows into several boxes where that reads better (desk legs, monitor stand, bed frame + mattress + pillow + blanket `#b5544d`, book spines on both shelves, pot + leaves). Monitor screen, window, and lamp head get `glow: true`.
- `clampTarget` clamps x to `[1, 5]`, y to `[0.5, 2.5]`, z to `[1, 5]`.
- Starting values for the builder to tune visually in Task 3: `OVERVIEW = { position: [15, 11, 15], target: [3, 1.2, 3] }`; `ORBIT_LIMITS = { minAzimuth: 0.2, maxAzimuth: Math.PI / 2 - 0.2, minPolar: 0.55, maxPolar: 1.25, minDistance: 7, maxDistance: 24 }`. Each object's `camera.target` is its box center; `camera.position` is the target plus an offset toward +x/+y/+z sized so the object fills roughly the left 60% of the viewport (the panel covers the right side).
- `activeRoomIds` returns `ROOM_ORDER` filtered by: about = bio non-empty or `philosophy` or `photo?.asset?._ref`; showcase = `projects.length > 0`; stack = `stack` or `services` non-empty; experience = `items.about.experiences` non-empty; journal = `journalEntries.length > 0`; contact = `contact.email` non-empty or `contact.socials` non-empty.

- [x] **Step 4: Run to verify pass**

Run: `node --test lib/room.test.ts`
Expected: 5 tests pass.

- [x] **Step 5: Commit**

```bash
git add lib/room.ts lib/room.test.ts
git commit -m "feat(room): room layout table, camera poses, active-object logic"
```

---

### Task 2: Night palette

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/components/ui/Button.tsx:11-14` (comment names old hexes)
- Modify: `frontend/components/HomeClient.tsx:185` (`slate-*` fallback message)
- Modify: `DESIGN.md` sections 2 and 3

**Interfaces:**
- Produces: Tailwind tokens keep their names so no component class changes: `background`, `surface`, `primary`, `primary-ink`, `secondary`, `secondary-ink`, `text-primary`, `text-secondary`, and one new token `line` (`border-line`).

- [x] **Step 1: Replace token values in `globals.css`**

`--background #0f0d17`, `--foreground #f3ece4`, `surface #1a1626`, `line #2c2540`, `primary #ffb86b`, `primary-ink` a dark brown that passes AA on `#ffb86b`, `secondary` a soft purple around `#b39ddb`, `secondary-ink` dark purple passing AA on it, `text-primary #f3ece4`, `text-secondary #a99fb5`. Rewrite `--shadow-modal-glow` and `dialog::backdrop` rgba values from the new base and accent.

- [x] **Step 2: Fix stray old colors**

`HomeClient` fallback message uses `border-line bg-surface/90 text-text-primary`. Button comment names the new accent.

- [x] **Step 3: Verify contrast**

Run a one-off node script (not committed) computing WCAG contrast for: text-primary and text-secondary on background and surface, primary on surface, primary-ink on primary, secondary-ink on secondary.
Expected: every ratio ≥ 4.5.

- [x] **Step 4: Update `DESIGN.md`**

Section 2 mood becomes "warm night bedroom" (dark room, desk lamp, monitor glow, cozy, low-poly). Section 3 color list replaced with the new tokens and their roles. Leave other sections for Task 6.

- [x] **Step 5: Verify build and old colors gone from tokens**

Run: `pnpm exec tsc --noEmit; pnpm lint`
Expected: no errors.
Run: `git grep -nE "#0f172a|#10b981|#1e293b|slate-" -- app components/ui components/view components/HomeClient.tsx`
Expected: no output.

- [x] **Step 6: Commit**

```bash
git add app/globals.css components/ui/Button.tsx components/HomeClient.tsx ../DESIGN.md
git commit -m "feat(theme): warm night palette replaces navy and terminal green"
```

---

### Task 3: Code-built room scene with free orbit

**Files:**
- Rewrite: `frontend/components/scene/DesktopScene.tsx`
- Modify: `frontend/components/HomeClient.tsx` (remove journey wiring)

**Interfaces:**
- Consumes: everything from Task 1.
- Produces: `DesktopScene` props become

```ts
interface DesktopSceneProps {
  active: RoomId[];             // clickable objects
  labels: Record<RoomId, string>;
  focus: RoomId | null;         // null = overview
  onSelect: (id: RoomId) => void;
  onBackgroundClick: () => void;
  onContextLost?: () => void;
  reducedMotion?: boolean;
}
```

- [x] **Step 1: Rewrite `DesktopScene.tsx`**

- Render `DECOR` and every `OBJECTS[id].boxes` as `<mesh>` with shared `boxGeometry` (one unit box, scaled per mesh) and `meshStandardMaterial` with `flatShading`; `glow` boxes get `emissive` = own color, `toneMapped={false}`.
- Each object is a `<group>`; only ids in `active` get `onPointerOver/Out/Click`. Hover: set `document.body.style.cursor = "pointer"`, raise that group's emissive intensity slightly, show a drei `<Html>` label (`labels[id]`, `pointer-events-none`, palette classes) above the object. `onClick` calls `e.stopPropagation()` then `onSelect(id)`. Reset cursor on out and on unmount.
- Lights per spec decision 8: warm `pointLight` at the lamp head (main source), small `pointLight`s at monitor and window matching their colors, a weak cool `directionalLight` from the window side, low ambient. Background `<color attach="background" args={["#0f0d17"]} />`. Keep `ContactShadows` (color = base) instead of renderer shadows.
- Move `CameraRig` over from the old file with its damp/arrive logic and reduced-motion jump, minus: the spring-back `end` listener, `lockRotationAroundPose`, `GlassProjector`, and `zoomUp`. It takes `pose = focus ? OBJECTS[focus].camera : OVERVIEW` and flies on change. Controls are enabled only when `focus === null` and the flight has arrived.
- `OrbitControls makeDefault` with `ORBIT_LIMITS` mapped to `minAzimuthAngle`, `maxAzimuthAngle`, `minPolarAngle`, `maxPolarAngle`, `minDistance`, `maxDistance`; `enableZoom` and `enablePan` on; `target={OVERVIEW.target}`. On the controls' `change` event apply `clampTarget` to the target and shift `camera.position` by the same correction so the view does not distort.
- Canvas: `camera={{ position: OVERVIEW.position, fov: 35 }}`, `dpr={[1, 2]}`, `onPointerMissed={onBackgroundClick}`, keep the `webglcontextlost` + `mountedRef` guard. Wrapper `div` stays `aria-hidden fixed inset-0 z-0`; drop the `touch-pan-y` override (no page scroll any more).
- Drop the `DEBUG` grid/axes helper.

- [x] **Step 2: Rewire `HomeClient.tsx`**

Remove `useJourney`, `buildStops`, `stopIndexForContent`, `StopOverlay`, `ProgressDots`, and the `100vh` spacer. Add `const [focus, setFocus] = useState<RoomId | null>(null)`, `const active = useMemo(() => activeRoomIds(portfolio), [portfolio])`, `const reducedMotion = useReducedMotion()`. For this task only, `onSelect` sets `focus` and opens the existing `Modal` with the matching item (`showcase` → `ShowcaseModalContent`, `experience` → `about` item); closing the modal sets `focus` to null. Pass `onContact={() => setActiveModal("contact")}` and `journeyHint={false}` to `HUD` until Task 4 changes its props. `handleSceneFailure` also clears `focus`.

- [x] **Step 3: Type check and lint**

Run: `pnpm exec tsc --noEmit; pnpm lint; pnpm test`
Expected: no errors; all tests pass (old journey/layout tests still run, deleted in Task 6).

- [x] **Step 4: Visual check**

Run `pnpm dev` in the background, then:
`node scripts/e2e/shoot.mjs ../.shots/t3 overview:shot drag:900,450,200,450 wait:400 left:shot release drag:900,450,1300,250 wait:400 right:shot release wheel:-3000 wait:400 close:shot wheel:6000 wait:400 far:shot`
Expected, by looking at each PNG: the room reads as a bedroom at night; no shot shows the outside of a wall, under the floor, or empty space past the room; hovering a clickable object (add `click`-free `eval` hover if needed) shows label and pointer. Tune `OVERVIEW`, `ORBIT_LIMITS`, object boxes, and light intensities in `lib/room.ts` until true, then rerun `node --test lib/room.test.ts`.

- [x] **Step 5: Commit**

```bash
git add components/scene/DesktopScene.tsx components/HomeClient.tsx lib/room.ts
git commit -m "feat(scene): code-built night bedroom with clamped free orbit"
```

---

### Task 4: Side panel, intro card, HUD

**Files:**
- Create: `frontend/components/view/RoomPanel.tsx`
- Create: `frontend/components/view/IntroCard.tsx`
- Modify: `frontend/components/view/HUD.tsx`
- Modify: `frontend/components/HomeClient.tsx`

**Interfaces:**
- Consumes: `RoomId`, `ROOM_LABELS`, `activeRoomIds` (Task 1); `DesktopScene` props (Task 3).
- Produces:
  - `RoomPanel({ id, portfolio, onClose, onOpenItem }: { id: RoomId; portfolio: PortfolioData; onClose: () => void; onOpenItem: (itemId: string) => void })`
  - `IntroCard({ name, tagline, resumeHref, resumeLabel }: { name: string; tagline: string; resumeHref?: string; resumeLabel: string })`
  - `HUD` props: drop `zoomed`, `onContact`, `journeyHint`, `navItems`; add `nav: { id: RoomId; label: string }[]` and `panelOpen: boolean`. `onOpen` becomes `(id: RoomId) => void`.

- [x] **Step 1: `RoomPanel`**

`<aside aria-labelledby={`${id}-title`}>` fixed to the right edge, full height, `w-[min(28rem,50vw)]`, `bg-surface border-l border-line`, `z-10`, flex column, slide-in from right with the existing `modal-in` animation (reduced motion: none). Body by id, reusing existing components:
- `about` → `AboutModalContent` with `{ ...items.about, title: ROOM_LABELS.about, experiences: undefined }`
- `showcase` → `ShowcaseModalContent` with `projects`, `onOpen={onOpenItem}`
- `stack` → `StackModalContent` with `categoryLabels`
- `experience` → `ModalHeader` (id `experience`, title `ROOM_LABELS.experience`) + `ExperienceTimeline`
- `journal` → `ModalHeader` (id `journal`) + entry list moved from `components/journey/StopOverlay.tsx:56-70` calling `onOpenItem(entry.id)`
- `contact` → `ContactModalContent`

On mount and on `id` change, focus the panel's close button (`aside.querySelector("button")`).

- [x] **Step 2: `IntroCard`**

Port the intro branch of `StopOverlay.tsx:21-40` to a fixed left card (`left-6 top-24`, `max-w-sm`, `bg-surface/85 border-line backdrop-blur`), `h1` name, tagline, resume link with `resumeLabel`.

- [x] **Step 3: `HUD`**

Remove the Credits link and the journey/zoom props. Contact button → `onOpen("contact")`, rendered only if `contact` is in `nav`. Hint text `"Drag to rotate · Scroll to zoom · Click an object to open it"`, hidden while `panelOpen`. Nav buttons map `nav`; add icons for `experience` (`IdCardIcon`) and `journal` (`ReaderIcon`) from `@radix-ui/react-icons`; set `aria-pressed` on the open one. Hide the nav column while `panelOpen` on screens narrower than `lg` so it does not sit on the panel; at `lg+` shift it left of the panel.

- [x] **Step 4: Wire `HomeClient`**

- `nav = active.map((id) => ({ id, label: ROOM_LABELS[id] }))`.
- `select(id)` sets `focus`; `closePanel()` sets `focus` null and returns focus to the HUD nav button for that id if it exists. `onBackgroundClick` → `closePanel`.
- Esc listener (window `keydown`) closes the panel only when `focus != null && activeModal == null`.
- `onOpenItem` sets `activeModal` to a project or journal id; the existing `Modal` renders it over the panel. Remove the interim Task 3 modal path for room objects.
- `IntroCard` renders when `showHUD && focus == null`. Resume link stays in the HUD top bar too.
- `handleSceneFailure` clears `focus` and `activeModal`.

- [x] **Step 5: Type check, lint, tests**

Run: `pnpm exec tsc --noEmit; pnpm lint; pnpm test`
Expected: clean.

- [x] **Step 6: Behavior check with the e2e driver** (dev server running)

Each run saves PNGs; inspect them.
1. Click each active object (coordinates from the Task 3 overview shot), `wait:1500`, `shot`: camera framed on the object, panel open with the right content, intro card hidden.
2. Monitor → click a project card's "View project" → `key:Escape` → `shot`: modal gone, panel still open. `key:Escape` again → `shot`: panel closed, camera back at overview.
3. `--reduced-motion`: click an object, `wait:100`, `shot`: camera already at the object pose.
4. `--no-webgl`: Standard View renders with no blank page. Then a normal run with `eval:document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` while a panel is open: Standard View plus the status message, no panel.
5. Keyboard: `key:Tab` until a nav button is focused, `key:Enter`, `eval:document.activeElement.getAttribute('aria-label')` + `log`: the close button is focused. `key:Escape`, `log` again: focus is back on the nav button.

- [x] **Step 7: Commit**

```bash
git add components/view/RoomPanel.tsx components/view/IntroCard.tsx components/view/HUD.tsx components/HomeClient.tsx
git commit -m "feat(room): side panel per object, intro card, HUD nav from active objects"
```

---

### Task 5: Standard View in the room mood

**Files:**
- Create: `frontend/components/view/RoomIcons.tsx`
- Modify: `frontend/components/view/StandardView.tsx`

**Interfaces:**
- Produces: `RoomIcon({ id, className }: { id: RoomId; className?: string })` returning a small inline low-poly SVG (`aria-hidden`, `viewBox="0 0 48 48"`, flat fills in the scene's colors from `lib/room.ts` or the palette).

- [x] **Step 1: `RoomIcons.tsx`**

One SVG per `RoomId`: bed (about), monitor (showcase), PC tower (stack), poster (experience), book stack (journal), phone (contact). Simple rects and polygons only.

- [x] **Step 2: Use them in `StandardView`**

Put the matching `RoomIcon` (size `h-10 w-10`) beside each section `h2`: about → bed, stack and services → PC, projects → monitor, journal → books, contact → phone; the experience subheading inside about gets the poster. Remove the `/credits` footer link. Guard the hero "View project" button: render it only if `projects[0]` exists (today it calls `onOpen(undefined)`). Swap any `border-primary/10` dividers to `border-line`. Update the component doc comment (no "future 3D desk").

- [x] **Step 3: Check**

Run: `pnpm exec tsc --noEmit; pnpm lint`
Then `node scripts/e2e/shoot.mjs ../.shots/t5 --w 390 --h 844 mobile:shot` and `--w 1440 --h 900` with a click on "Standard View": both show the new palette and icons, no navy or green.

- [x] **Step 4: Commit**

```bash
git add components/view/RoomIcons.tsx components/view/StandardView.tsx
git commit -m "feat(standard-view): room object icons and night palette"
```

---

### Task 6: Delete the desk era and update docs

**Files:**
- Delete: `frontend/components/journey/`, `frontend/hooks/useJourney.ts`, `frontend/lib/journey.ts`, `frontend/lib/journey.test.ts`
- Delete: `frontend/components/scene/{SceneModel.tsx,layout.ts,layout.test.ts,AboutScreen.tsx,ContactScreen.tsx,ShowcaseScreen.tsx,StackScreen.tsx,overlayRoot.ts}`, `frontend/components/showcase/ShowcaseGrid.tsx` (only `ShowcaseScreen` used it; keep `ProjectDetail.tsx`)
- Delete: `frontend/public/glb/`, `frontend/public/animated_book/`, `frontend/scripts/glb/`, `frontend/lib/credits.ts`, `frontend/lib/credits.test.ts`, `frontend/app/credits/`
- Modify: `frontend/package.json`, `frontend/pnpm-lock.yaml`
- Modify: `PRD.md`, `DESIGN.md`, `AGENTS.md:35`
- Keep: `frontend/scripts/e2e/shoot.mjs` unchanged (generic driver, used by Tasks 3 to 5).

- [x] **Step 1: Confirm nothing imports what is about to go**

Run: `git grep -nE "journey|SceneModel|scene/layout|overlayRoot|ShowcaseGrid|credits|\.glb|\.gltf|AboutScreen|ContactScreen|ShowcaseScreen|StackScreen" -- app components hooks lib`
Expected: only hits inside the files being deleted.

- [x] **Step 2: Delete the files listed above**

- [x] **Step 3: Drop dependencies**

Run: `pnpm why sharp` and check `next.config.ts` uses no image optimizer (the app uses plain `<img>` via `SanityImage`). Then:
`pnpm remove @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp`
If `pnpm why` shows a runtime need, keep `sharp` and say so in the commit message.

- [x] **Step 4: Docs**

- `AGENTS.md:35`: replace the orthographic line with "Perspective camera (small fov) over a code-built bedroom; see PRD 6.1." Also the GLB rule on line 34: all 3D is built from primitives in code, no model files.
- `PRD.md` 6.1: free orbit within clamps (azimuth on the open side, polar above the floor, clamped zoom and pan), click an object to fly the camera to it and open the right-hand panel, hover shows glow + pointer + label, objects with empty content are inert. 6.2: panel replaces per-object modals; project and journal details still use the modal. Remove scroll-stop wording and the `.gltf` loading screen mention.
- `DESIGN.md`: screen inventory, user flows, and per-screen layout describe the bedroom, the panel, the intro card, and Standard View icons. Remove "terminal green" and `.gltf` wording.

- [x] **Step 5: Full verification**

Run: `pnpm test; pnpm exec tsc --noEmit; pnpm lint; pnpm build`
Expected: all pass, build has no `/credits` route.
Run: `git grep -nE "#0f172a|#10b981|#1e293b|slate-|emerald-" -- app components lib`
Expected: no output.

- [x] **Step 6: Commit**

```bash
git add -A . ../PRD.md ../DESIGN.md ../AGENTS.md
git commit -m "chore: remove GLB desk, scroll journey, credits; docs describe the bedroom"
```
