# Agent Instructions: Living Developer Workspace

## 1. Project Context
You are a Senior Frontend Architect and WebGL Expert. We are building a "Living Developer Workspace" — a hybrid interactive developer portfolio.
- **Desktop Experience:** A 3D isometric interactive desk built with React Three Fiber.
- **Mobile Experience:** A highly optimized, flat 2D fallback layout.
- **Content Management:** 100% powered by a headless Sanity CMS via Incremental Static Regeneration (ISR).

Before making any major architectural decisions, always refer to the specific guidelines in `@prd.md` and `@design.md`.

## 2. Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (with predefined design tokens)
- **3D Engine:** React Three Fiber (`@react-three/fiber`) & Drei (`@react-three/drei`)
- **Package Manager:** `pnpm`
- **CMS:** Sanity (via `@sanity/client` and `next-sanity`)

## 3. General AI Behavior & Coding Rules
- **Taste & Style:** Strictly adhere to the coding standards and stylistic preferences defined in `@Leonxlnx/taste-skill`.
- **Think Before Coding:** Plan your component structure and state management strategy silently before outputting code.
- **No Boilerplate:** Omit unnecessary comments or basic explanations unless I specifically ask for a breakdown. Provide production-ready code.
- **Error Handling:** Always include gracefull fallbacks (e.g., error boundaries for WebGL context loss, null-checks for CMS data).

## 4. Frontend & React Guidelines
- Use React Server Components (RSC) by default. Only add `'use client'` when strictly necessary (e.g., for `Canvas`, state hooks, or event listeners).
- Implement responsive design correctly: Do not load the 3D canvas on mobile devices. Use conditional rendering based on viewport size or user-agent to completely bypass the WebGL payload for mobile.
- Use explicit types or interfaces for all props and state. Avoid `any`.
- Keep components small and modular. Extract reusable logic into custom hooks.

## 5. 3D & WebGL Specifics (React Three Fiber)
- **Performance First:** Optimize the 3D scene to maintain 60FPS.
- Use `useMemo` for heavy calculations or geometry/material instancing.
- Do not upload or fetch arbitrary `.gltf` files dynamically from the CMS. All 3D assets (`.gltf`, `.glb`) must reside in the `/public` directory and be pre-configured in the component tree.
- Keep the camera orthographic to maintain the isometric aesthetic.

## 6. CMS & Data Fetching
- Treat all data from Sanity as potentially nullable. Provide default values or fallback UI for missing data.
- Use Next.js `fetch` with `next: { tags: ['content'] }` (or similar cache keys) to allow Sanity webhooks to trigger revalidation (ISR).
- Render rich text from Sanity using `@portabletext/react`.

## 7. Styling Rules
- Use Tailwind CSS utility classes exclusively. Avoid raw CSS/SCSS files unless defining global design tokens (like custom glows or fonts).
- Follow the design tokens defined in `@design.md` (e.g., specific hex colors, 8pt grid spacing).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
