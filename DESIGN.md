# Design Brief: Living Developer Workspace

## 1. Design Principles
1. **The Medium is the Message:** The UI must visually prove your frontend architecture skills. The 3D scene isn't just an image; it's a living artifact of your Next.js and WebGL capabilities. Every interaction must feel deliberate and technically sound.
2. **Respect the Hardware (Performance First):** A heavy 3D scene cannot compromise the user's device. We design for grace under pressure. The transition from a 3D desktop experience to a highly optimized, flat 2D mobile experience must be seamless and intentional, not a broken afterthought.
3. **Familiarity Breeds Intuition:** Interaction models should mirror tools your audience (engineering managers, developers) already uses. Modals should feel like IDE panels; typography should echo code editors.

## 2. Visual Direction
* **Mood:** "Warm Night Bedroom." Think of a cozy bedroom desk setup at night. Dark room, a desk lamp's warm pool of light, monitor glow, cozy and lived-in, low-poly. It should feel calm and personal, not clinical.
* **References:** High-end dark mode interfaces (like Linear or Vercel's dashboard), minimalist isometric pixel art, and VS Code syntax highlighting themes.
* **What to Avoid:** Corporate SaaS aesthetics (flat blue and white), overly playful or bouncy UI (no cartoonish physics), and cluttered "maximalist" designs. The 3D objects should be low-poly or stylized, not hyper-realistic, to avoid the "uncanny valley" and keep render times low.

## 3. Design Tokens
The design system leans into a dark-mode-first approach, using an 8pt grid system that maps perfectly to Tailwind CSS utility classes.

### Color Palette
* **Base/Background (`background`):** `#0F0D17`. A deep, warm near-black for the night room backdrop.
* **Surface (`surface`):** `#1A1626`. Used for modals and cards resting on the base background.
* **Line (`line`):** `#2C2540`. Hairline borders and dividers on dark surfaces.
* **Primary Accent (`primary`):** `#FFB86B`. A warm desk-lamp amber used for interactive elements, hover states on 3D objects, and success markers.
* **Primary Ink (`primary-ink`):** `#3A2008`. Dark brown text/icon color for use on top of the primary accent.
* **Secondary Accent (`secondary`):** `#B39DDB`. A soft purple used for highlighting distinct data types, like syntax highlighting (e.g., separating technical skills from personal journals).
* **Secondary Ink (`secondary-ink`):** `#2A1840`. Dark purple text/icon color for use on top of the secondary accent.
* **Text Primary (`text-primary`):** `#F3ECE4`. High contrast for readability on dark surfaces.
* **Text Secondary (`text-secondary`):** `#A99FB5`. For metadata, dates, and subtle UI hints.

### Type Scale
* **Display / UI Overlay:** *Space Grotesk*. A geometric sans-serif that feels slightly mechanical and tech-forward. Used for the HUD (Heads Up Display) elements overlaying the 3D canvas.
* **Body / Long Form:** *Inter*. The industry standard for readability. Used inside the project detail modals.
* **Foreign Language Support:** *Noto Sans JP*. Explicitly included to ensure the Kanji and Kana in your Japanese learning journals render beautifully and legibly without default font fallbacks breaking the layout.
* **Scale:** Base 16px. H1 (36px), H2 (24px), Body (16px), Caption (12px).

### Spacing & Radius
* **Spacing:** Strictly an 8pt grid (8, 16, 24, 32, 48, 64px) for perfect rhythm.
* **Border Radius:** 6px (sm) for small buttons/tags, 12px (md) for modals. Sharp enough to feel technical, soft enough to look modern.

### Shadows
Instead of standard drop shadows, we use **glows** (colored box-shadows) to represent screens and active objects in the dark scene.
* *Modal Glow:* `0 20px 40px -10px rgba(15, 13, 23, 0.8), 0 0 0 1px rgba(255, 184, 107, 0.2)`

## 4. Screen Inventory
1. **Boot Splash:** A full-screen, opaque CSS splash (brand mark + tagline) covering first paint and hydration. *Justification:* Prevents a blank screen and hides the server-rendered Standard View flipping to the 3D HUD on desktop.
2. **The Bedroom (3D Hero - Desktop Only):** The primary view. A code-built night bedroom you free-orbit, with an intro card over it and a HUD overlay.
3. **Room Panel (Slide-over):** A fixed right-hand panel that opens when a room object is clicked. Houses that object's Sanity content (About, Projects, Stack, Experience, Journal, Contact).
4. **Content Modal (Overlay):** A slide-over/centered dialog, opened for project or journal detail, from the room panel or the Standard View. Stacks above the panel.
5. **Standard View (2D Fallback - Mobile & Opt-in):** A clean, linear feed of about, stack, projects, and journal, with small room-object icons beside each section heading. *Justification:* Ensures recruiters on mobile or older devices get immediate access to the resume and contact info.

## 5. User Flows

### Core Journey 1: The Engineering Manager Deep Dive (Desktop)
1. User lands on the site; the boot splash fades out in just over a second.
2. User sees the night bedroom from the overview pose, with the intro card (name, tagline, resume) bottom-left.
3. User hovers the Monitor; it glows, the cursor turns to a pointer, and a "Projects" label appears.
4. User clicks. The camera flies to a pose framing the monitor; the intro card is replaced by the right-hand room panel listing projects.
5. User clicks a project in the panel; a project detail modal (gallery, role, highlights, outcomes, body) opens on top of the panel.
6. User hits `Escape`: the modal closes first. A second `Escape`, the close control, or a click on empty space closes the panel and flies the camera back to the overview.

### Core Journey 2: The Recruiter Bailout (Any Device)
1. User lands on the site.
2. If on Desktop, they click the persistent "Simple page" button in the top-right HUD.
3. The 3D canvas is unmounted, revealing the 2D Standard View.
4. If on Mobile, the viewport media query serves the 2D Standard View directly; the 3D bundle never loads.

## 6. Per-Screen Layout

### The Bedroom (3D Hero)
* **Z-Index 0 (Canvas):** The React Three Fiber scene, `aria-hidden`, fixed and full-viewport.
* **Z-Index 10 (HUD):** `pointer-events-none` absolute layer; only its controls opt back into pointer events.
    * *Top Left:* Logo / Name mark.
    * *Top Right:* Availability badge, Resume link, Contact button, Hire me, "Simple page" toggle (the Standard View) — shifted left of the panel while it's open.
    * *Bottom Center:* Hint text, hidden while the panel is open: `"Drag to rotate · Scroll to zoom · Click an object to open it"`.
    * *Right edge, vertically centered:* One icon button per active room object (hidden below `lg` while the panel is open, so it doesn't collide with the panel).
    * *Bottom Left (only when no panel is open):* The intro card — name, tagline, resume button.
* **Z-Index 10 (Room Panel):** Fixed to the right edge, `w-[min(28rem,50vw)]`, full height, replaces the intro card while an object is focused.

### Room Panel / Content Modal
* **Header:** Title of the content and a close button (`ModalHeader` / per-content header).
* **Metadata Bar:** A row of tech stack pills where relevant (e.g., Next.js, Figma, Google Sheets).
* **Body:** PortableText rendered from Sanity (supports headers, lists, code blocks, and images), or a list (projects, journal entries) that opens a further modal.
* **Footer:** External links (e.g., GitHub, Live Demo) where relevant.

## 7. Component Library (Key UI Elements)

| Component | Variants | States | Justification |
| :--- | :--- | :--- | :--- |
| **HUD Nav Button** | One per active room object | Default, Hover, Focus-Visible, `aria-pressed` while its panel is open | Icon buttons mirroring the clickable room objects, usable with a keyboard. |
| **Tech Pill** | Default, Language, Tool | Default | Distinct visual markers for stack parsing (e.g., default for frameworks, language/tool variants for languages and design tools). |
| **Room Object** | About, Showcase, Stack, Experience, Journal, Contact | Inert (empty content), Idle, Hover (Glow + Label) | Six fixed box groups in `frontend/lib/room.ts`; clickability and nav presence both derive from whether the object's mapped Sanity content is non-empty. |
| **Room Panel** | One per room object | Open (slides in from the right), Closed | A single reusable panel component that renders different content per object id; replaces per-object modals. |
| **Markdown Renderer**| H1, H2, Code Block, Blockquote | N/A | Ensures CMS text looks like a polished technical blog, not a raw string. |

## 8. States
* **Loading:** The initial load must *never* be a white screen. The boot splash (brand mark + tagline on the background color) covers first paint and hydration.
* **Empty:** A room object whose mapped Sanity content is empty is still drawn, but stays inert: no hover, no glow, no label, not in HUD nav, not clickable.
* **Offline/ISR Stale:** Because we rely on Next.js ISR, the site is technically never offline. It will serve the last successful static build. No visual error state is needed for the end-user.
* **WebGL Error:** If WebGL context is lost or unsupported, `SceneBoundary` catches it and the page falls back to the Standard View, with a small status message: `"The 3D scene could not load, so you are seeing the standard view."`

## 9. Responsive Behaviour
* **Desktop (≥ 768px, WebGL available):** Full 3D canvas with the HUD overlay, intro card, and room panel, unless the visitor opts into Standard View.
* **Desktop, panel open, narrow window (< `lg`):** The right-edge HUD nav icons hide so they don't collide with the panel; the top-right controls shift left of the panel instead.
* **Mobile (< 768px):** The 3D canvas is never loaded (SSR default, confirmed client-side by the media query). `StandardView` (2D) takes over, laid out as a vertical single-column stack with room-object icons beside each section heading.
* **Any size, modal open:** The modal is fullscreen below `md`, centered at 80% width from `md`, and a right-edge slide-over at 40% width (`lg` and up), stacking above the room panel.

## 10. Accessibility (A11y)
* **Contrast Ratios:** Text colors (`text-primary` #F3ECE4, `text-secondary` #A99FB5) on the dark surface/background tokens (§3) are chosen to stay readable; verify AA contrast when changing a token.
* **Keyboard Nav & Focus Order:** The 3D canvas is `aria-hidden`; real navigation is the HUD's icon buttons (one per active room object, each `aria-pressed` while its panel is open) and the room panel's own focusable content — no screen reader or keyboard user needs to know the 3D room exists to reach any content.
* **Focus Trapping:** The content modal (`<dialog>` + `showModal()`) traps focus natively and restores it to the trigger on close; opening the room panel moves focus to its first button.
* **Escape Order:** With both a modal and the room panel open, the first `Escape` closes the modal only; a second `Escape` (or the panel's close control, or a click on empty canvas) closes the panel and flies the camera back to the overview.
* **Motion:** `prefers-reduced-motion` makes the camera jump straight to each pose instead of flying, and is read once at mount (`useReducedMotion`).