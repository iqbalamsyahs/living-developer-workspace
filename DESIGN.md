# Design Brief: Living Developer Workspace

## 1. Design Principles
1. **The Medium is the Message:** The UI must visually prove your frontend architecture skills. The 3D scene isn't just an image; it's a living artifact of your Next.js and WebGL capabilities. Every interaction must feel deliberate and technically sound.
2. **Respect the Hardware (Performance First):** A heavy 3D scene cannot compromise the user's device. We design for grace under pressure. The transition from a 3D desktop experience to a highly optimized, flat 2D mobile experience must be seamless and intentional, not a broken afterthought.
3. **Familiarity Breeds Intuition:** Interaction models should mirror tools your audience (engineering managers, developers) already uses. Modals should feel like IDE panels; typography should echo code editors; navigation should feel like terminal commands.

## 2. Visual Direction
* **Mood:** "Midnight Engineering." Think of a developer's desk at 1 AM. Focused, dimly lit, glowing screens, and highly organized. It should feel calm but highly technical.
* **References:** High-end dark mode interfaces (like Linear or Vercel's dashboard), minimalist isometric pixel art, and VS Code syntax highlighting themes.
* **What to Avoid:** Corporate SaaS aesthetics (flat blue and white), overly playful or bouncy UI (no cartoonish physics), and cluttered "maximalist" designs. The 3D objects should be low-poly or stylized, not hyper-realistic, to avoid the "uncanny valley" and keep render times low.

## 3. Design Tokens
The design system leans into a dark-mode-first approach, using an 8pt grid system that maps perfectly to Tailwind CSS utility classes.

### Color Palette
* **Base/Background:** `#0F172A` (Slate 900). A deep, rich navy—easier on the eyes than pure black, reminiscent of modern code editors.
* **Surface:** `#1E293B` (Slate 800). Used for modals and cards resting on the base background.
* **Primary Accent:** `#10B981` (Emerald 500). A "terminal green" used sparingly for interactive elements, hover states on 3D objects, and success markers.
* **Secondary Accent:** `#8B5CF6` (Violet 500). Used for highlighting distinct data types, like syntax highlighting (e.g., separating technical skills from personal journals).
* **Text Primary:** `#F8FAFC` (Slate 50). High contrast for readability on dark surfaces.
* **Text Secondary:** `#94A3B8` (Slate 400). For metadata, dates, and subtle UI hints.

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
* *Modal Glow:* `0 20px 40px -10px rgba(15, 23, 42, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.2)`

## 4. Screen Inventory
1. **Boot Sequence (Loading Screen):** A stylized terminal-like loading screen while `.gltf` assets parse. *Justification:* Prevents staring at a blank canvas and sets the technical tone immediately.
2. **The Desktop (3D Hero - Desktop Only):** The primary view. The interactive isometric workspace.
3. **Content Modal (Overlay):** A slide-over or centered panel that opens when a 3D object is clicked. Houses the actual Sanity CMS content.
4. **Standard View (2D Fallback - Mobile & Opt-in):** A clean, linear feed of your projects and journals. *Justification:* Ensures recruiters on mobile or older devices get immediate access to your resume.

## 5. User Flows

### Core Journey 1: The Engineering Manager Deep Dive (Desktop)
1. User lands on the site; boot sequence completes in < 1s.
2. User sees the isometric desk. A subtle green glow pulses on the Virtual Monitor.
3. User hovers over the Monitor; cursor changes to pointer, object scales up 1.05x.
4. User clicks. The camera dynamically lerps (moves) closer to the monitor.
5. The showcase renders on the monitor as a screenshot slider; hovering a project reveals a "View project" overlay that opens a project detail modal (gallery, role, highlights, outcomes, body).
6. User hits `Escape` to close the modal; camera resets to the default isometric view.

### Core Journey 2: The Recruiter Bailout (Any Device)
1. User lands on the site.
2. If on Desktop, they click the persistent "Standard View / Resume" button in the top right HUD.
3. The 3D canvas fades out, revealing the 2D standard UI.
4. If on Mobile, the routing middleware automatically serves the 2D standard UI directly, bypassing the WebGL payload entirely.

## 6. Per-Screen Layout

### The Desktop (3D Hero)
* **Z-Index -1 (Canvas):** The React Three Fiber scene. Centered. Fixed position.
* **Z-Index 10 (HUD):** Absolute positioned HTML layer.
    * *Top Left:* Logo / Name mark.
    * *Top Right:* "Toggle Standard View" button.
    * *Bottom Center:* A subtle hint text: `"Drag to rotate • Click glowing objects to inspect"`

### Content Modal
* **Header:** Title of the content, Date, and a definitive "X" close button.
* **Metadata Bar:** A row of tech stack pills (e.g., Next.js, Figma, Google Sheets).
* **Body:** PortableText rendered from Sanity (supports headers, lists, code blocks, and images).
* **Footer:** External links (e.g., GitHub, Live Demo).

## 7. Component Library (Key UI Elements)

| Component | Variants | States | Justification |
| :--- | :--- | :--- | :--- |
| **HUD Button** | Primary (Outline) | Default, Hover (Solid Green), Active, Focus-Visible | Minimalist HTML buttons hovering over the canvas shouldn't distract from the 3D scene. |
| **Tech Pill** | Default, Language, Tool | Default | Distinct visual markers for stack parsing (e.g., green for frameworks, purple for design tools like Figma). |
| **3D Object Wrapper**| Monitor, Whiteboard, Notebook | Idle, Hover (Glow/Scale), Loading Content | A generic HOC (Higher Order Component) that handles raycasting clicks and passing the Sanity ID to the modal. |
| **Markdown Renderer**| H1, H2, Code Block, Blockquote | N/A | Ensures CMS text looks like a polished technical blog, not a raw string. |

## 8. States
* **Loading:** The initial load must *never* be a white screen. Use a CSS-only dark screen with a monospace loading percentage tracking the asset pipeline.
* **Empty:** If Sanity fails to return a specific object's content, the modal opens with a stylized 404 terminal message: `> _ Content not found. End of file.`
* **Offline/ISR Stale:** Because we rely on Next.js ISR, the site is technically never offline. It will serve the last successful static build. No visual error state is needed for the end-user.
* **WebGL Error:** If WebGL context is lost or unsupported, a global catch component immediately unmounts the canvas and mounts the 2D Standard View with a small toast notification: `"Hardware acceleration disabled. Standard view active."`

## 9. Responsive Behaviour
* **Desktop (> 1024px):** Full 3D canvas. HUD overlays. Modals slide in from the right edge taking up 40% of the screen width to maintain canvas visibility on the left.
* **Tablet (768px - 1024px):** 3D canvas remains. Modals are centered and take up 80% of the screen. Touch events map to click events for the 3D objects.
* **Mobile (< 768px):** The 3D canvas component is conditionally bypassed. The `StandardView` component (2D) takes over the entire routing experience. Layout becomes a vertical single-column stack.

## 10. Accessibility (A11y)
* **Contrast Ratios:** The `#F8FAFC` text on `#0F172A` background guarantees a WCAG AAA contrast ratio.
* **Keyboard Nav & Focus Order:** The 3D canvas is inherently hostile to screen readers. We solve this by adding `aria-hidden="true"` to the canvas container. Behind the canvas (visually hidden but DOM-accessible), we place a standard semantic HTML list of the content, ensuring keyboard and screen reader users can Tab through the projects without knowing the 3D desk exists.
* **Focus Trapping:** When a modal is open, the `Tab` key must cycle only within the modal's links and the close button.
* **Motion:** Provide a fallback for users with `prefers-reduced-motion` enabled in their OS. If true, disable the camera lerping/zooming effects and simply snap the modals open instantly.