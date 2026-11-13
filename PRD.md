# Product Requirements Document (PRD): Living Developer Workspace

## 1. Problem Statement
Traditional developer portfolios rely on static lists and grids that tell visitors what a developer can do, rather than showing them. They fail to immediately capture attention or demonstrate advanced frontend architecture skills. Standard layouts force non-technical recruiters to dig for basic information, while failing to provide the technical depth that engineering managers look for in senior-level candidates.

## 2. Target User & Personas
**Primary Audience:** Tech Recruiters (need fast, accessible info).
**Secondary Audience:** Engineering Managers / Senior Developers (evaluating code quality, architecture, and UI/UX execution).

*   **Persona 1: Sarah, the Tech Recruiter.** She has 15 seconds to evaluate a candidate. She doesn't care about WebGL; she needs to know what your stack is, see your resume, and find your contact info immediately. If she gets confused by a 3D interface, she bounces.
*   **Persona 2: Alex, the Engineering Manager.** He inspects the element tree. He checks the Lighthouse score. He wants to see how you handle state, component structure in Next.js, and how elegantly you fetch and render data from a headless CMS.

## 3. Goals and Non-Goals
**Goals:**
*   Demonstrate advanced frontend engineering (Next.js, 3D rendering via React Three Fiber, ISR) interactively.
*   Provide a dual-experience: an immersive 3D desktop for desktop users, and a hyper-fast, accessible 2D fallback for mobile users.
*   Achieve 100% content manageability via Sanity (no hardcoded project data or text).
*   Ensure SEO and initial load performance remain excellent despite the 3D payload.

**Non-Goals (Out of scope for MVP):**
*   Arbitrary 3D model uploads via Sanity (models must be pre-coded in the frontend library).
*   A pan-and-zoom 3D experience on mobile devices.
*   Physics engines (objects falling, bouncing, or colliding).
*   Real-time multiplayer or chat features.

## 4. User Stories
*   **As a Recruiter**, I want a clear "Skip to Resume/Standard View" button on desktop, so that I can bypass the 3D experience if I am in a hurry.
*   **As an Engineering Manager**, I want to click the virtual monitor to browse project screenshots and open a project detail modal (gallery, role, highlights, outcomes, body), so that I can evaluate past frontend projects.
*   **As an Engineering Manager**, I want to click the bookshelf to see ongoing personal growth (e.g., language learning progress, vocabulary lists), so that I can gauge the developer's continuous learning mindset.
*   **As a Mobile User**, I want to see a clean, optimized 2D layout immediately upon loading, so that I don't drain my battery or experience lag.
*   **As the Site Administrator**, I want each room object to light up and become clickable automatically once I fill in its mapped Sanity content, so that it appears on the live site via ISR without a manual redeploy.

## 5. Feature List

| Feature | Scope | Description |
| :--- | :--- | :--- |
| **Code-Built Night Bedroom** | MVP | React Three Fiber scene, built from primitive boxes (no model files), with six clickable room objects. |
| **Mobile Fallback UI** | MVP | Completely separate 2D component tree rendered conditionally for mobile viewports, reusing the room's icons and palette. |
| **Sanity-Driven Activation** | MVP | Each room object is clickable only when its mapped Sanity content is non-empty; empty objects stay inert and drop out of nav. |
| **Right-Hand Content Panel** | MVP | A single panel component, reused across all six objects, slides in from the right when an object is clicked. |
| **ISR Webhooks** | MVP | Sanity triggers Vercel/Next.js to regenerate static pages on content update. |
| **Arbitrary 3D Uploads** | v2 | Upload custom `.gltf` models directly in Sanity Studio to render in the room. |
| **Dynamic Positioning** | v2 | Drag-and-drop X, Y, Z coordinate mapping from within Sanity Studio. |
| **Day/Night Cycle** | Later | Lighting in the 3D scene matches the visitor's local timezone. |

## 6. Detailed Functional Requirements (MVP)

**6.1. The 3D Scene (Desktop)**
*   Must use React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
*   A single code-built night bedroom (primitive boxes, no model files): floor and two back walls, desk under the window, bed, bookshelf, wall shelf, rug, plant.
*   Camera is a perspective camera (small fov) with free orbit within clamps: azimuth clamped to the room's open side, polar angle clamped above the floor and below the ceiling, zoom and pan clamped to stay inside the room.
*   Clicking an object flies the camera to a pose framing that object and opens the right-hand panel (6.2). Clicking empty space or the close control flies back to the overview pose.
*   Hovering a clickable object shows a glow, a pointer cursor, and a small label with the object's content name. Objects whose mapped Sanity content is empty are inert: no hover, no glow, not clickable, not in nav.
*   Must include a global UI overlay (HTML outside the canvas) with a clear "Simple page" toggle to the Standard View and HUD nav buttons mirroring the clickable objects.

**6.2. The Content Panel**
*   When a room object is clicked, the camera flies to it and a single right-hand panel (reused across all six objects) opens with that object's content, replacing the old per-object modal overlay.
*   Project and journal entries are listed in the panel; clicking one opens the existing project/journal detail in a modal on top of the panel.
*   The panel and any modal above it are fully accessible (focus moves into the panel/modal, `Escape` closes the modal first and the panel on a second press, ARIA labels).

**6.3. Mobile Fallback (The 2D UI)**
*   Rely on CSS media queries or user-agent detection at the middleware level to block the load of the 3D canvas entirely on mobile to save bandwidth.
*   The UI should mirror a high-quality standard developer portfolio (Hero text, List of Projects, About Me, Contact).

**6.4. Sanity Integration & Next.js Architecture**
*   Next.js `getStaticProps` (or App Router equivalent `fetch` with caching) will pull the workspace configuration.
*   If a webhook fires from Sanity, the Next.js cache for the specific route must invalidate, regenerating the static HTML/JSON.

## 7. Data Model Sketch (Sanity Schema)

Each room object maps to a fixed content slice; the object is clickable only once its slice is non-empty (`frontend/lib/room.ts#activeRoomIds`).

| Room Object | Content | Source |
| :--- | :--- | :--- |
| Bed | About me | `items.about` (body, philosophy, photo) |
| Monitor | Projects | `portfolio.projects`, `items.showcase` |
| PC | Tech stack & services | `items.stack` |
| Poster | Work experience | `items.about.experiences` |
| Bookshelf | Journal | `portfolio.journalEntries` |
| Phone | Contact | `items.contact` |

| Document / Object | Fields | Type | Description |
| :--- | :--- | :--- | :--- |
| `project` | `title`, `coverImage`, `gallery`, `role`, `highlights`, `outcomes`, `techStack`, `links`, `body` | String, Image, Array, PortableText | Standard portfolio project data; coverImage/gallery are screenshots shown on the showcase and in the project detail. |
| `journalEntry` | `title`, `date`, `body` | String, Date, PortableText | For ongoing learning (e.g., language milestones, framework exploration). |

The earlier `workspaceConfig`/`deskObject` schema (CMS-configurable object list) is not used by the frontend; the room's six objects and their mapping are fixed in code.

## 8. Edge Cases and Failure States

*   **WebGL Not Supported / Disabled:** If the user's browser lacks WebGL support, the site must automatically failover to the Mobile/2D UI regardless of screen size.
*   **Sanity API Outage:** Because we are using ISR, an API outage simply means the site serves the last successfully generated static version. No downtime for the user.
*   **Scene Boot:** The canvas must display a stylized CSS splash screen (not just a blank screen) while the 3D bundle loads and hydrates; a WebGL context loss after boot falls back to the Standard/2D UI.

## 9. Success Metrics
1.  **Performance:** Lighthouse score of 90+ on both Mobile (2D) and Desktop (3D initial load).
2.  **Engagement:** Average Time on Page > 45 seconds (indicating visitors are interacting with the room).
3.  **Conversion:** Click-through rate on "Resume" or "Contact" links > 10%.

## 10. Resolved Technical Decisions
1.  **Coordinate System:** Every box's position, size, and color is **hardcoded in the frontend** (`frontend/lib/room.ts`), in a design-spec sketch coordinate (x/y on the floor, z up) converted to three.js (y up) by `fromSketch`. No CMS-driven layout.
2.  **Asset Hosting:** No 3D model files. All geometry is built from primitive boxes in code; only content (text, image URLs) is fetched from the Sanity API.