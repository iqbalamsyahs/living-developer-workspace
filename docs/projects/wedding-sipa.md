# Wedding Invitation — Sanity draft

Source: `D:/Ibang/Project/zynera/wedding-sipa` (GitHub ZyneraOfficial/wedding-sipa). Zynera team project. Rules: no "Zynera" in title, no couple names, no repo or live link.
- Solo: the user wrote all 4 commits (2 as `ibang090202`, 2 as `M Iqbal Alamsyah S`).
- Dates: 2026-03-17 – 2026-03-19.

## Title
Digital Wedding Invitation with Google Sheets RSVP

## Slug
wedding-invitation

## Date
2026-03 – 2026-03

## Role
Frontend Developer

## Summary
A single-page digital wedding invitation with a scrapbook look, animated cover reveal, personalized guest greeting, live countdown, gift details, and an RSVP and wishes wall stored in Google Sheets. Built solo as a Zynera team project.

## Tech Stack
- Next.js 16 (App Router, Server Actions)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- React Hook Form + Zod
- Google Sheets API (google-spreadsheet, google-auth-library)
- date-fns

## Highlights
- Built an animated cover that opens with a stop-motion paper "curtain", then reveals the content with staggered Framer Motion variants
- Personalized each invitation link: a `?to=` slug is looked up in a "Guest List" sheet and the guest's name is shown on the greeting card, falling back to the raw slug
- Wrote Server Actions that append RSVPs (attendance, guest count, wishes) to Google Sheets through a service account, with Zod validation on both client and server
- Built a paginated wishes wall that reads back submitted messages, newest first, with relative timestamps
- Added a live countdown to the event, event details, and gift section with copy-to-clipboard account numbers
- Assembled a scrapbook visual style from layered images (torn paper, tape, dried flowers, photo collages) and a noise overlay

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or live link, by choice)_

## Body
A digital wedding invitation built as a single scrolling page. Guests open a personal link, watch a paper-style cover lift away, and see their own name on the greeting card.

I built it alone in a few days with Next.js and Framer Motion. Instead of a database, the couple manage everything in Google Sheets: one sheet holds the guest list that powers the personalized links, another collects RSVPs and wishes. Server Actions handle the reads and writes with a service account, and Zod validates every submission. The page also has a countdown, event details, a gift section, and a wishes wall that loads more messages on demand.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — cover page before opening
- [ ] Gallery — greeting card with a dummy guest name
- [ ] Gallery — countdown and event details
- [ ] Gallery — RSVP form and wishes wall (dummy wishes)
- [ ] Gallery — mobile view
- Blur or replace couple photos, names, venue, and bank account numbers.

## Before publish
- [ ] Real couple's private event: confirm they are OK with it being shown at all, even sanitized.
- [ ] Very small project (4 commits, 3 days). Fine as a lighter entry, or skip.
- [ ] Gift section holds real bank account numbers; never show them.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
