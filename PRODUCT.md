# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, equal weight:

- **Hiring:** tech recruiters (seconds to find stack, resume, contact) and engineering managers / senior devs (inspect code quality, performance, architecture).
- **Freelance clients:** businesses needing a web app, landing page, CMS, or API integration, evaluating whether to hire Iqbal Alamsyah for a project.

## Product Purpose

Personal portfolio of Iqbal Alamsyah, Frontend Web Developer. Success means a visitor:

1. downloads the resume,
2. makes contact (email, booking, Hire me), or
3. judges the technical skill from the site itself (3D scene, ISR, Lighthouse, code).

## Positioning

The site is its own proof: a code-built 3D night bedroom (no model files) driven entirely by Sanity content, with a fast 2D fallback. The interaction demonstrates the frontend skill instead of listing it.

## Operating Context

- Desktop with WebGL: 3D bedroom, objects open a right-hand content panel.
- Mobile, no WebGL, or opt-in: Standard View, a linear 2D page; the 3D bundle never loads.
- Content edited in Sanity Studio; ISR revalidation via webhook.

## Capabilities and Constraints

- Next.js App Router, TypeScript strict, Tailwind, React Three Fiber, Sanity. See `AGENTS.md`, `PRD.md`.
- All content from Sanity and nullable; a room object with empty content is inert and absent from nav.
- No 3D model files; geometry built from primitives in code.
- UI copy is English. Journal entries may contain Japanese.

## Evidence on Hand

- Real content in `content/data.mjs` (migrated from the owner's Framer site): bio, photo, stack, services, FAQ, socials, email.
- Projects: exactly six real ones: CMMS (PLN), New Virtual Cubicle (PLN), Landing Page Vyneapple, Web Apps Vyneapple, CMS Vyneapple, Mindtrex Academy. Add no others.
- Experience: Frontend Web Developer at Aegislabs, 2021 to present. The exact start month is unconfirmed; show the year only.
- No testimonials, client logos, reviews, or metrics exist. Do not invent any.

## Product Principles

1. Resume and contact are always one step away, in every view.
2. The 3D is a demonstration, never a gate; Standard View is a first-class path.
3. Performance is part of the pitch: 60fps desktop, Lighthouse 90+.
4. Show only real work and real facts.

## Accessibility & Inclusion

Keyboard reachable panel and modals (focus moves in, Esc closes modal then panel), `prefers-reduced-motion` honored, body text WCAG AA on all surfaces.
