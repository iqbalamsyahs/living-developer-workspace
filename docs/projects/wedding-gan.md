# Wedding Invitation (GSAP) — Sanity draft

Source: `D:/Ibang/Project/My Projects/wedding-gan2` (GitHub iqbalamsyahs/wedding-gan, personal account). Not a Zynera repo. Rules: no couple names, no repo or live link.
- Solo: the user wrote all 14 commits (as `ibang090202`).
- Dates: 2026-09-15 – 2026-11-14 (last commit today, so still active).

## Title
Animated Digital Wedding Invitation

## Slug
wedding-gan

## Date
2026-09 – present

## Role
Frontend Developer

## Summary
A single-page digital wedding invitation built around motion: a cover that splits open, scroll-triggered reveals in every section, a hand-rigged waving couple illustration, and a wishes form that sends to a Google Sheet. Mobile-first, with tablet and desktop layouts.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- GSAP (ScrollTrigger, ScrollSmoother)

## Highlights
- Built a GSAP timeline for the cover: the top and bottom halves split away, the photo ring rotates out, and the circular photo mask shrinks to the center via a CSS variable, then the cover is removed from the DOM
- Rigged a waving couple illustration from layered PNGs: the body is split with `clip-path` so each figure can be positioned, and each arm rotates on an elbow pivot taken from the source Lottie file
- Added scroll-triggered reveals across sections (clip-path headings, staggered slides, gradient-mask "ink" reveals for line art) through a small `useGsap` hook scoped to each section
- Respected `prefers-reduced-motion` everywhere with `gsap.matchMedia()`: no timelines run, content stays fully visible, and the cover is removed instantly
- Added inertia smooth scroll with ScrollSmoother on pointer devices, keeping native scroll on touch
- Built a wishes form that posts to a Google Sheet endpoint, with an optimistic list and animated pagination
- Organized components with atomic design (atoms, molecules, organisms) and wrote a PRD plus animation plans before building

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or live link, by choice)_

## Body
A wedding invitation where motion carries the experience. Guests open a single link on their phone, tap to open the cover, and the page unfolds section by section: the couple, the Quran verse, event details with a countdown and map link, gift details, and a wishes form.

I built it alone with Next.js, Tailwind, and GSAP. The cover open is one GSAP timeline that splits the page and shrinks a circular photo mask. The couple illustration is rigged by hand from layered images so each figure waves from the elbow. Every section reveals on scroll through a small hook that only runs animations when the visitor has not asked for reduced motion. Layouts were tuned separately for mobile, tablet, and desktop.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — desktop cover with the waving couple
- [ ] Gallery — cover opening mid-animation (short video or GIF if Sanity allows)
- [ ] Gallery — event section with countdown
- [ ] Gallery — wishes form and list
- [ ] Gallery — mobile view
- Replace couple names, parent names, venue, and the bank account image.

## Before publish
- [ ] Real couple's private event: confirm they are OK with it being shown, even sanitized. Paid job or a favor? If paid, set Role/Summary to freelance.
- [ ] Wishes list is not read back from the sheet: it starts from 3 placeholder wishes and only adds the visitor's own entry locally (the POST is `no-cors`, fire-and-forget). Don't claim a live wishes wall.
- [ ] 13 of 14 commits are co-authored with Claude (AI-assisted). Fine to leave unsaid, but don't oversell as hand-written line by line if asked.
- [ ] Overlaps with [wedding-sipa](wedding-sipa.md). Pick one, or merge into a single "Wedding invitations" entry (sipa = Google Sheets data, this one = motion).
- [ ] Still in progress (commit today). Re-check before publishing; the Lottie greeting assets are added but not wired in yet.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
