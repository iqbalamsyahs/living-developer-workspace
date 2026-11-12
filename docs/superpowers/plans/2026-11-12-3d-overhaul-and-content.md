# 3D Overhaul and Content Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the low-poly desk models with an optimized, split version of the Sketchfab "Modern PC Desk Setup", and move the owner's Framer content into Sanity with the UI to show it for recruiters and freelance clients.

**Architecture:** A one-off Node pipeline (`frontend/scripts/glb/`) splits and optimizes the source GLB into per-object GLBs under `public/glb/v2/`; scene layout data moves to `components/scene/layout.ts`. Content moves via new Sanity profile fields, pure helpers in `lib/portfolio.ts`, and a generated NDJSON import.

**Tech Stack:** Next.js 16 (App Router), React 19, React Three Fiber/drei, Sanity, `@gltf-transform/*`, `node --test` (Node 26 strips TS types, no test framework to install).

**Spec:** `docs/superpowers/specs/2026-11-12-3d-overhaul-and-content-design.md` (scroll journey is a later plan: `2026-11-12-scroll-journey-design.md`).

## Global Constraints

- Next.js here has breaking changes: read the relevant guide in `frontend/node_modules/next/dist/docs/` before touching any Next API.
- TypeScript strict, no `any`; Tailwind utility classes only; RSC by default, `'use client'` only when needed.
- All Sanity data is nullable: every new field needs a fallback or a hidden state, never a crash.
- 3D assets live in `frontend/public/` only; no model upload through Sanity.
- Budget: whole scene about 40k faces and under about 8 MB; desk set 15-25k faces and under about 3 MB.
- Mobile (< 768 px) and no-WebGL never download a GLB or the three.js chunk.
- CC-BY: every third-party model is credited with title, author, source link, license.
- Content language English. "Hire me" is `mailto:` until a real booking URL exists. Job title "Frontend Web Developer". No stats, benefits, follower counts, or Cal.com link.
- Repo is a single git repo at the project root; commit per task with `git add <paths>`; commit trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Source GLB `_assets/desk-source/modern_pc_desk_setup_-_3d_model.glb` is git-ignored; never commit it.

## Review Focus

- Profile with no resume file: Resume button absent, not a dead link (Task 7 test `resumeHref`).
- No `bookingUrl` and no email: "Hire me" hidden; no `bookingUrl` with email: `mailto:` (Task 7 test).
- Unknown or legacy stack category string: renders under "Tools", no crash (Task 7 test).
- Project without cover image, role, links: card renders with no broken image or empty headings (Task 10 manual check with seeded empty project).
- A v2 GLB failing to load or WebGL context lost: Standard View or boundary fallback, never a blank canvas (Task 5 manual check).
- Empty `faq` or `services`: section not rendered (Task 10).
- Clock hydration: no server/client text mismatch for the WIB clock (Task 9).

---

## Phase 1: 3D overhaul

### Task 1: Split the source GLB into per-object GLBs

**Files:**
- Create: `frontend/scripts/glb/groups.mjs`, `frontend/scripts/glb/split-desk.mjs`
- Test: `frontend/scripts/glb/groups.test.mjs`
- Modify: `frontend/package.json` (devDeps `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`, `meshoptimizer`, `sharp`; script `"test": "node --test"`)

**Interfaces:**
- Produces: `GROUP_NAMES = ["desk","monitor","keyboard","mouse","pc","speakers"] as const`; `assignGroup(node: {name: string; material: string; centroid: [number,number,number]}): GroupName | "drop"`; CLI `node scripts/glb/split-desk.mjs <src.glb> <outDir> [--debug]` writes `<outDir>/<group>.glb` (no animations, source coordinates and scale kept) and with `--debug` also `groups-debug.glb` (one flat color per group).

Initial rules, in precedence order (source units, desk top at y 9.54; these are guesses from bounding boxes and are corrected in Step 5): material `wood_floor_worn` → drop; centroid x > 5.4 → pc; materials Material.007, mouseee.001 → mouse; Material.018, Material.020, mouseee.002 → keyboard; Material.008, .010, .011, .012, .013 → monitor; Material.014, .015, .016, .017 → speakers; everything else → desk.

- [ ] **Step 1: Write the failing test** `groups.test.mjs` asserting: `assignGroup({name:"x",material:"wood_floor_worn",centroid:[0,0,0]}) === "drop"`; `{material:"Material.013"}` → `"monitor"`; `{material:"Material.003", centroid:[6.6,11,1]}` → `"pc"`; `{material:"jersey_melange"}` → `"desk"`; `Material.007` → `"mouse"`.
- [ ] **Step 2: Run** `pnpm test scripts/glb/groups.test.mjs` from `frontend/`; expected FAIL (module missing).
- [ ] **Step 3: Implement** `groups.mjs` as a plain ordered rule table (array of `{group, test}`), then `split-desk.mjs` using `@gltf-transform/core` `NodeIO`: compute each mesh node's world-space centroid, call `assignGroup`, build one Document per group by cloning kept nodes, drop the animation and the floor.
- [ ] **Step 4: Run** the test; expected PASS. Then run the CLI with `--debug` into `_assets/desk-split/`.
- [ ] **Step 5: Visual check (gate).** Open `_assets/desk-split/groups-debug.glb` in https://gltf-viewer.donmccurdy.com (drag and drop). Pass = each color region is one recognizable object (tower, mouse, keyboard, monitor+stand, two speakers, desk). If parts are mixed, edit the rule table, add a test line per fix, rerun Steps 2-5.
- [ ] **Step 6: Commit** `git add frontend/package.json frontend/pnpm-lock.yaml frontend/scripts/glb && git commit -m "feat(3d): split desk set into per-object GLBs"`.

### Task 2: Optimize each object to its budget

**Files:**
- Create: `frontend/scripts/glb/optimize.mjs`
- Test: `frontend/scripts/glb/optimize.test.mjs`
- Output: `frontend/public/glb/v2/{desk,monitor,keyboard,mouse,pc,speakers}.glb`

**Interfaces:**
- Consumes: Task 1 outputs.
- Produces: `TARGETS = {desk:7000, monitor:1500, keyboard:6000, mouse:2500, pc:4000, speakers:2000}` (max faces); `optimizeFile(input: string, output: string, opts: {maxFaces: number; maxTexture: number}): Promise<{faces: number; bytes: number}>`; CLI `node scripts/glb/optimize.mjs <splitDir> <public/glb/v2>`.

- [ ] **Step 1: Write the failing test** reading `public/glb/v2/*.glb` and asserting: all six files exist; each file's triangle count `<= TARGETS[name]`; summed triangles `<= 25000`; summed bytes `<= 3_000_000`; no file has animations; no node bounding box wider than 20 source units (floor gone).
- [ ] **Step 2: Run** `pnpm test scripts/glb/optimize.test.mjs`; expected FAIL (files missing).
- [ ] **Step 3: Implement** `optimizeFile` with gltf-transform: `weld` then `simplify` (meshoptimizer, ratio = maxFaces / current, `lockBorder: true`), `prune`, `textureCompress` via sharp to WebP resized to `maxTexture` (1024; monitor 2048), `meshopt` compression. The PC tower's 8 fan meshes dominate the budget, so simplify per mesh proportionally rather than globally.
- [ ] **Step 4: Run** the CLI, then the test; expected PASS. If the budget visibly destroys a shape (check with the viewer), raise that object's target and lower another's; the 25k total stays.
- [ ] **Step 5: Commit** scripts and `public/glb/v2`.

### Task 3: Scene layout data module and tests

**Files:**
- Create: `frontend/components/scene/layout.ts`
- Test: `frontend/components/scene/layout.test.ts`
- Modify: `frontend/components/scene/DesktopScene.tsx` (remove the moved constants, import them)

**Interfaces:**
- Produces: `MODEL_LAYOUT: SceneModelLayout[]`, `ZOOM_VIEWS`, `SCREENS`, `DEFAULT_TARGET`, `GLASS_BOUNDS` (moved unchanged first, then recalibrated in Task 4), plus `DESK_SET: {position: [number,number,number]; rotation: [number,number,number]; scale: [number,number,number]}`. `SceneModelLayout` stays exported from `SceneModel.tsx`; keep `layout.ts` free of `@/` alias imports so `node --test` can load it (use a relative `import type`).

- [ ] **Step 1: Write the failing test**: every `MODEL_LAYOUT[i].url` exists under `public/` (`fs.existsSync`); every `id` among `{"showcase","about","stack","contact"}` appears at most once; every `ZOOM_VIEWS` key has a `SCREENS` entry.
- [ ] **Step 2: Run** `pnpm test components/scene/layout.test.ts`; expected FAIL (module missing).
- [ ] **Step 3: Move** the constants out of `DesktopScene.tsx` into `layout.ts` verbatim.
- [ ] **Step 4: Run** the test and `pnpm tsc --noEmit`; expected PASS and no errors. App at http://localhost:3000 renders as before.
- [ ] **Step 5: Commit.**

### Task 4: Swap the desk set into the scene and calibrate

**Files:**
- Modify: `frontend/components/scene/layout.ts`; touch `DesktopScene.tsx` / `ShowcaseScreen.tsx` only if the ultrawide panel needs it
- Create: `frontend/scripts/glb/measure-screen.mjs`

**Interfaces:**
- Consumes: `DESK_SET`, `MODEL_LAYOUT`, `ZOOM_VIEWS.pc`, `SCREENS.pc`, `GLASS_BOUNDS`.
- Produces: `MODEL_LAYOUT` entries `desk`, `monitor` (keeps `id: "showcase"`), `keyboard`, `mouse`, `cpu` (the tower), `speakers`, all at `/glb/v2/<name>.glb` sharing `DESK_SET` (starting values: scale `[0.1,0.1,0.1]` because the source desk top is y 9.54 and the scene's is about 0.94; rotation `[0, -Math.PI/2, 0]` so the monitor faces +X toward the camera; position about `[0.5,0,0]`). Keyboard, mouse, tower, speakers stay non-interactive (no `id`), as today. Old book, whiteboard, phone entries stay, re-placed on the new desk top.

- [ ] **Step 1: Write** `measure-screen.mjs <monitor.glb>`: prints the world bounding box of the mesh using material `Material.013` (the 2-triangle screen quad; about 9.47 x 4.67 source units, ratio about 2.03:1). Run it and note the numbers.
- [ ] **Step 2: Replace** old desk/keyboard/cpu/mouse/monitor entries with the v2 set; delete the old three decor GLBs from `layout.ts` references only (leave files in `public/glb/` until the owner approves).
- [ ] **Step 3: Calibrate** with `NEXT_PUBLIC_DEBUG_SCENE=true`: set `DESK_SET`, re-place book/whiteboard/phone on the desk top, recompute `GLASS_BOUNDS`/`SCREENS.pc`/`ZOOM_VIEWS.pc` from Step 1 (camera still lands perpendicular to the screen).
- [ ] **Step 4: Verify** `pnpm tsc --noEmit`, `pnpm test`, `pnpm lint`. In the browser at http://localhost:3000: click the monitor, the showcase fills the ultrawide screen without distortion; Esc returns; book, whiteboard, phone zooms still work; frame rate holds (DevTools Performance, no sustained drops).
- [ ] **Step 5: Commit.**

### Task 5: Desktop-only scene bundle and failure fallback

**Files:**
- Modify: `frontend/components/HomeClient.tsx`
- Create (only if none exists): `frontend/components/scene/SceneBoundary.tsx`

**Interfaces:**
- Produces: `HomeClient` loads `DesktopScene` with `next/dynamic(() => import("@/components/scene/DesktopScene").then(m => m.DesktopScene), { ssr: false })` and renders it only on the HUD path; `SceneBoundary` (class error boundary, props `{children: ReactNode; onError: () => void}`) calls `onError` so `HomeClient` sets `standardOverride`.

- [ ] **Step 1: Check** first: `grep -ri "ErrorBoundary\|webglcontextlost" frontend/components frontend/app`. Reuse what exists; create `SceneBoundary` only if nothing does this.
- [ ] **Step 2: Convert** the static import to `next/dynamic`; wrap in the boundary; also fall back to Standard View on the canvas's `webglcontextlost`.
- [ ] **Step 3: Verify (mobile).** DevTools Network, viewport 390 px, hard reload: zero `.glb` requests and no three.js chunk loaded.
- [ ] **Step 4: Verify (failure).** Temporarily rename `public/glb/v2/pc.glb`, reload on desktop: Standard View appears with its notice, no blank canvas. Restore the file.
- [ ] **Step 5: Commit.**

### Task 6: Credits page and optional props

**Files:**
- Create: `frontend/lib/credits.ts`, `frontend/app/credits/page.tsx`
- Test: `frontend/lib/credits.test.ts`
- Modify: `frontend/components/view/HUD.tsx` (small "Credits" link), `frontend/components/view/StandardView.tsx` (footer link)

**Interfaces:**
- Produces: `interface Credit {title: string; author: string; authorUrl: string; sourceUrl: string; license: string; licenseUrl: string}`; `CREDITS: Credit[]`; `formatAttribution(c: Credit): string` returning `"<title>" by <author> is licensed under <license>`.

- [ ] **Step 1: Write the failing test**: every entry has non-empty `title`, `author`, `license` and `https://` `sourceUrl`, `authorUrl`, `licenseUrl`; `formatAttribution` contains title, author, license.
- [ ] **Step 2: Run** `pnpm test lib/credits.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** `credits.ts` with two entries: "Modern PC Desk Setup - 3D Model" by Fahriyan Fikri Pradana (https://sketchfab.com/fahriyanfikripradana11), CC BY 4.0; and the existing open-book model (read `public/animated_book/license.txt` for exact title, author, license). Add the route page (RSC) and the two links.
- [ ] **Step 4: Run** tests and `pnpm tsc --noEmit`; open `/credits` in the browser.
- [ ] **Step 5 (optional, gated on the owner): other props.** Prerequisite: the owner downloads GLBs of the shortlisted book ("book folded and unfolded"), whiteboard ("Whiteboards +") and phone ("Apple iPhone 13 Pro Max") into `_assets/props-source/`. For each: `optimizeFile` to `public/glb/v2/<name>.glb` (suggested maxFaces 4000 / 3000 / 6000), swap into `MODEL_LAYOUT`, recalibrate its `ZOOM_VIEWS`/`SCREENS`, add its `CREDITS` entry. Keep a prop only if it matches the desk's style on screen; otherwise leave the old model.
- [ ] **Step 6: Commit.**

---

## Phase 2: Content

### Task 7: Pure content helpers (types, labels, fallbacks)

**Files:**
- Modify: `frontend/lib/portfolio.ts`, `frontend/lib/sanity/queries.ts`
- Test: `frontend/lib/portfolio.test.ts`

**Interfaces:**
- Produces in `lib/portfolio.ts`: `StackCategory` adds `"database"`; `categoryLabels.database` default `"Databases"`; `interface FaqItem {question: string; answer: string}`; `interface Availability {isAvailable: boolean; statusText?: string; timezone?: string}`; `Contact` adds `bookingUrl?: string`; `PortfolioData.profile` adds `photo?: RawImage; availability?: Availability; faq?: FaqItem[]; resumeFileUrl?: string`; `hireMeHref(contact?: Contact): string | undefined`; `resumeHref(p: {resumeFileUrl?: string; links?: {label: string; href: string}[]}): string | undefined`; `categoryLabel(labels: SiteConfig["categoryLabels"], category: string): string`.
- `PORTFOLIO_QUERY` profile projection adds `photo, availability, faq, "resumeFileUrl": resume.file.asset->url`.

- [ ] **Step 1: Write the failing tests** (`node:test`): `hireMeHref({email:"a@b.co", bookingUrl:"https://cal.com/x"})` is the booking URL; with `bookingUrl` missing it is `"mailto:a@b.co"`; with `bookingUrl: "javascript:alert(1)"` it is `"mailto:a@b.co"`; with neither it is `undefined`; `hireMeHref(undefined)` is `undefined`. `resumeHref({})` is `undefined`; with `resumeFileUrl` it returns it. `categoryLabel(defaultSiteConfig.categoryLabels, "database")` is `"Databases"` and `"banana"` returns the `tool` label. `buildPortfolio({})` does not throw, has `profile.faq` undefined, and `items.stack.stack` undefined.
- [ ] **Step 2: Run** `pnpm test lib/portfolio.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** the types, helpers and query changes; `buildPortfolio` maps the new profile fields through.
- [ ] **Step 4: Run** the test and `pnpm tsc --noEmit`; expected PASS.
- [ ] **Step 5: Commit.**

### Task 8: Sanity schema additions

**Files:**
- Modify: `studio-portofolio/schemaTypes/documents/profile.ts`

**Interfaces:**
- Produces fields: `photo` (image, hotspot, required `alt`); `availability` object `{isAvailable: boolean, statusText: string, timezone: string}` (defaults `true`, `"Available for work"`, `"Asia/Jakarta"`); `faq` array of `{question: string (required), answer: text (required)}`; `contact.bookingUrl` (url, optional); `resume.file` (file, optional); stack `category` option `{title: 'Database', value: 'database'}`; `siteConfig.categoryLabels.database` string.

- [ ] **Step 1: Add** the fields following the existing `defineField`/`defineArrayMember` style in the file.
- [ ] **Step 2: Verify** `cd studio-portofolio && pnpm sanity schema validate`; expected no errors.
- [ ] **Step 3: Verify** Studio (`pnpm dev`): the profile document shows all new fields and the Database option.
- [ ] **Step 4: Commit.**

### Task 9: HUD actions and availability badge

**Files:**
- Create: `frontend/lib/time.ts`, `frontend/hooks/useLocalTime.ts`
- Test: `frontend/lib/time.test.ts`
- Modify: `frontend/components/view/HUD.tsx`, `frontend/components/HomeClient.tsx`

**Interfaces:**
- Consumes: `hireMeHref`, `resumeHref`, `PortfolioData.profile.availability`.
- Produces: `formatLocalTime(date: Date, timeZone: string): string` returning `"HH:mm:ss"` (24 h, zero padded); `useLocalTime(timeZone: string): string | null` (null until mounted, then ticks each second). HUD props add `hireMeHref?: string; resumeHref?: string; availability?: Availability`.

- [ ] **Step 1: Write the failing test**: `formatLocalTime(new Date("2026-01-01T00:00:00Z"), "Asia/Jakarta") === "07:00:00"` and `"America/New_York"` gives `"19:00:00"` for the previous day.
- [ ] **Step 2: Run** `pnpm test lib/time.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** `formatLocalTime` with `Intl.DateTimeFormat` (`hourCycle: "h23"`) and the hook (effect-only; renders null on the server so there is no hydration mismatch).
- [ ] **Step 4: Run** the test; expected PASS.
- [ ] **Step 5: Wire HUD**: Resume and "Hire me" buttons only when their href exists (Tailwind tokens from `DESIGN.md`); badge "statusText · WIB 13:41:47" only when `availability?.isAvailable`. Keep the existing "Standard View" toggle and nav.
- [ ] **Step 6: Verify** in the browser with and without the data (temporarily blank the fields): buttons appear and disappear, no console hydration warning.
- [ ] **Step 7: Commit.**

### Task 10: Stack/Services tabs, About photo, Standard View sections

**Files:**
- Modify: `frontend/components/modal/StackModalContent.tsx`, `frontend/components/modal/AboutModalContent.tsx`, `frontend/components/scene/AboutScreen.tsx`, `frontend/components/view/StandardView.tsx`, `frontend/components/showcase/ShowcaseGrid.tsx` (and `ProjectDetail.tsx` if empty fields misrender)
- Reuse: `components/ui/SanityImage.tsx`, `TechPill.tsx`, `lib/portfolio.ts#categoryLabel`

**Interfaces:**
- Consumes: Task 7 helpers and types.
- Produces: no new exports; a `Stack | Services` tab control in `StackModalContent` (accessible `role="tablist"`), a Database group in the stack list via `categoryLabel`, `profile.photo` shown on About when present, Standard View sections Services and FAQ (`<details>` per item) rendered only when non-empty.

- [ ] **Step 1: Implement** each piece with null checks; no section heading when its data is empty.
- [ ] **Step 2: Verify** `pnpm tsc --noEmit` and `pnpm lint`.
- [ ] **Step 3: Verify (seeded)** after Task 11's test-dataset import: tabs switch by keyboard, FAQ expands, photo renders. Also with an empty project (title only): card has no broken image, no empty role/highlights headings, no link buttons.
- [ ] **Step 4: Commit.**

### Task 11: Content import file

**Files:**
- Create: `content/data.mjs`, `content/build-import.mjs`, `content/content.ndjson` (generated)
- Test: `content/build-import.test.mjs`

**Interfaces:**
- Produces: `node content/build-import.mjs` writes `content/content.ndjson` (one JSON document per line) with documents: `profile` (singleton; use the `_id` the Studio structure pins, see `studio-portofolio/sanity.config.ts`/structure), one `experience`, six `project`. Images use `{_type:"image", asset:{_sanityAsset:"image@<url>"}}` with Framer image URLs from the scraped pages.

Content (verbatim from the Framer site unless marked mine):
- Profile: name "Iqbal Alamsyah"; `heroTagline` "Experienced web developer from Bandung, Indonesia, with a passion for crafting seamless digital experiences and a proven track record."; contact email taken from the site's "Email me" link; blurb "Connect with Me Today. Let's Create Something Amazing Together!"; socials LinkedIn, Instagram, X, Facebook with their site URLs; availability `{isAvailable:true, statusText:"Available for work", timezone:"Asia/Jakarta"}`; 4 services (Web Dev, Landing Page Dev, CMS Dev, API Integration; the API Integration description is mine: "Connecting web apps to third-party and internal APIs for reliable, well-structured data flow."); 8 FAQ items from `/contact`.
- Experience: Frontend Web Developer, Aegislabs, `startDate` `2021-01-01` (only the year is known; owner to correct), no end date; description from the site.
- Stack (category): framework: Laravel, React JS, Vue JS, Express JS, Tailwind CSS, Bootstrap, Redux, Pinia, Axios; language: PHP, JavaScript, TypeScript; tool: Git, Node JS, Jira, Trello, Figma, Framer; database: MySQL, MongoDB.
- Projects (slug): cmms, new-virtual-cubicle, vyneapple-landing, vyneapple-app, vyneapple-cms, mindtrex-academy; title, summary and cover from the site; `links` only where the site has an `href` (vyneapple.com, apps.vyneapple.com, mindtrexacademy.com); role, highlights, outcomes, techStack, date left empty.

- [ ] **Step 1: Write the failing test** parsing `content.ndjson`: exactly one `profile`, one `experience`, six `project`; slugs unique; every stack item has a category in the schema's list; 20 stack items; 8 FAQ items; no document contains `cal.com`, `Followers`, `Happy Clients`, or `"IT Consultant"`; project `links` hrefs are a subset of the three public URLs; every `startDate` matches `^\d{4}-\d{2}-\d{2}$`.
- [ ] **Step 2: Run** `node --test content/` from the project root (this tooling lives outside `frontend/`, so it does not use the `pnpm test` script); expected FAIL.
- [ ] **Step 3: Implement** `data.mjs` and `build-import.mjs`.
- [ ] **Step 4: Run** the generator and the test; expected PASS.
- [ ] **Step 5: Owner runs the import (test dataset first).** In `studio-portofolio/`: `pnpm sanity dataset create test`, then `pnpm sanity dataset import ../content/content.ndjson test --missing`. Point `frontend/.env.local` at dataset `test` (check `lib/sanity/client.ts` for the variable name), restart the dev server, and review the site and Studio.
- [ ] **Step 6: After the owner approves**, import into the main dataset with the same command, switch `.env.local` back, then commit `content/`.

### Task 12: Final verification

- [ ] **Step 1:** `pnpm test`, `pnpm tsc --noEmit`, `pnpm lint` all pass from `frontend/`.
- [ ] **Step 2:** Desktop pass in the browser: scene loads from v2 models, all four zooms work, HUD Resume/Hire me/availability behave with and without data, `/credits` lists both models.
- [ ] **Step 3:** Mobile pass (390 px): Standard View only, no `.glb` requests, services, FAQ and projects present.
- [ ] **Step 4:** Ask the owner for visual sign-off on the localhost build (clearly more detail than before, no stutter on their machine). After sign-off, delete the unused old `public/glb/{desk,monitor,keyboard,mouse,cpu}.glb`. Deleting `../_git-backups/` is left to the owner.
