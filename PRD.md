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
*   **As an Engineering Manager**, I want to click a specific notebook on the desk to see ongoing personal growth (e.g., language learning progress, vocabulary lists), so that I can gauge the developer's continuous learning mindset.
*   **As a Mobile User**, I want to see a clean, optimized 2D layout immediately upon loading, so that I don't drain my battery or experience lag.
*   **As the Site Administrator**, I want to add a new predefined 3D object to the desk and populate it with content via Sanity, so that it appears on the live site automatically via ISR without a manual redeploy.

## 5. Feature List

| Feature | Scope | Description |
| :--- | :--- | :--- |
| **3D Isometric Scene** | MVP | React Three Fiber scene with interactive click-targets (Monitor, Whiteboard, Notebook). |
| **Mobile Fallback UI** | MVP | Completely separate 2D component tree rendered conditionally for mobile viewports. |
| **Sanity Object Mapping** | MVP | Ability to add/remove predefined objects to the desk via CMS (e.g., toggle an extra plant or a second monitor). |
| **Content Modals** | MVP | HTML/CSS overlays triggered by clicking 3D objects to display Sanity content. |
| **ISR Webhooks** | MVP | Sanity triggers Vercel/Next.js to regenerate static pages on content update. |
| **Arbitrary 3D Uploads** | v2 | Upload custom `.gltf` models directly in Sanity Studio to render on the desk. |
| **Dynamic Positioning** | v2 | Drag-and-drop X, Y, Z coordinate mapping from within Sanity Studio. |
| **Day/Night Cycle** | Later | Lighting in the 3D scene matches the visitor's local timezone. |

## 6. Detailed Functional Requirements (MVP)

**6.1. The 3D Scene (Desktop)**
*   Must use React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
*   Camera must be locked in an orthographic projection to force the isometric perspective.
*   Hover states must be obvious (e.g., cursor changes to pointer, object scales up 1.05x, or emits an outline).
*   Must include a global UI overlay (HTML outside the canvas) with a clear "View Standard Layout / Resume" toggle.

**6.2. The Content Modals**
*   When a 3D object is clicked, the camera zooms slightly to the object, and an HTML/CSS modal overlays the canvas.
*   Modals must be fully accessible (Focus trapping, `Escape` key to close, ARIA labels).

**6.3. Mobile Fallback (The 2D UI)**
*   Rely on CSS media queries or user-agent detection at the middleware level to block the load of the 3D canvas entirely on mobile to save bandwidth.
*   The UI should mirror a high-quality standard developer portfolio (Hero text, List of Projects, About Me, Contact).

**6.4. Sanity Integration & Next.js Architecture**
*   Next.js `getStaticProps` (or App Router equivalent `fetch` with caching) will pull the workspace configuration.
*   If a webhook fires from Sanity, the Next.js cache for the specific route must invalidate, regenerating the static HTML/JSON.

## 7. Data Model Sketch (Sanity Schema)

| Document / Object | Fields | Type | Description |
| :--- | :--- | :--- | :--- |
| `workspaceConfig` | `activeObjects` | Array of references | The single-ton document controlling what is currently on the desk. |
| `deskObject` | `internalName` | String | e.g., "Main Monitor", "Japanese Notebook". |
| | `modelType` | String (Dropdown) | Must map exactly to a frontend component (e.g., `monitor`, `whiteboard`, `notebook`). |
| | `contentReference` | Reference | Links to a Project, Resume, or Journal document. |
| `project` | `title`, `coverImage`, `gallery`, `role`, `highlights`, `outcomes`, `techStack`, `links`, `body` | String, Image, Array, PortableText | Standard portfolio project data; coverImage/gallery are screenshots shown on the showcase and in the project detail. |
| `journalEntry` | `title`, `date`, `body` | String, Date, PortableText | For ongoing learning (e.g., language milestones, framework exploration). |

## 8. Edge Cases and Failure States

*   **WebGL Not Supported / Disabled:** If the user's browser lacks WebGL support, the site must automatically failover to the Mobile/2D UI regardless of screen size.
*   **Sanity API Outage:** Because we are using ISR, an API outage simply means the site serves the last successfully generated static version. No downtime for the user.
*   **Heavy 3D Model Loading:** The canvas must display a stylized CSS loading state (not just a blank screen) while the `.gltf` files are downloading and parsing.

## 9. Success Metrics
1.  **Performance:** Lighthouse score of 90+ on both Mobile (2D) and Desktop (3D initial load).
2.  **Engagement:** Average Time on Page > 45 seconds (indicating visitors are interacting with the desk).
3.  **Conversion:** Click-through rate on "Resume" or "Contact" links > 10%.

## 10. Resolved Technical Decisions
1.  **Coordinate System:** The layout of the `deskObject` items will be **hardcoded in the frontend**. Positions will be strictly mapped based on the `modelType` (e.g., the monitor is fixed in the center, the notebook is fixed on the right) to ensure no visual overlap and to simplify the MVP scope.
2.  **Asset Hosting:** The 3D `.gltf` and `.obj` files will be **stored in the Next.js `/public` folder**. This leverages Vercel's Edge Network caching for heavy assets and simplifies deployment, as only the lightweight content data (text, image URLs) needs to be fetched from the Sanity API.