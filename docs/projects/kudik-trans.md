# Car Rental & Travel Website — Sanity draft

Source: `D:/Ibang/Project/zynera/kudik-trans` (GitHub `iqbalamsyahs/kudik-trans`, personal account, sits in the Zynera folder). Rules: no client/business name, no repo or live link.
- Solo: the user wrote all 5 commits (4 as `ibang090202`, 1 merge as `M Iqbal Alamsyah S`). Real work is one feature commit plus an ESLint fix (~780 lines of TSX).
- Dates: 2025-12-26 (scaffold) – 2026-01-26.

## Title
Car Rental & Travel Booking Website with WhatsApp Ordering

## Slug
car-rental-travel

## Date
2025-12 – 2026-01

## Role
Frontend Developer

## Summary
A marketing site for a local car rental and travel business: hero booking form, fleet catalog with daily pricing, services page, and contact page. Every booking path turns into a pre-filled WhatsApp message instead of a backend checkout.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 3
- Lucide icons

## Highlights
- Built a hero booking form (name, origin, destination, date, time) that composes a pre-filled WhatsApp chat to the admin, so orders need no backend
- Built a fleet catalog from one typed data file: capacity, transmission, fuel, facilities, and in-city vs out-of-city daily prices, formatted as IDR with `Intl.NumberFormat`
- Reused the same data for a home-page fleet preview and the full fleet page, each with a "rent this unit" WhatsApp button
- Added services and contact pages with per-page metadata, an embedded map, and a floating WhatsApp button
- Responsive layout with a custom Tailwind color palette

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or live link, by choice)_

## Body
A small marketing site for a car rental and travel business. Visitors browse the fleet, compare daily prices, and book through WhatsApp, which is how the business already takes orders.

I built it alone with Next.js and Tailwind. All fleet, service, and contact content lives in one typed data file, so the home page preview, the fleet page, and the booking buttons stay in sync. Each call to action builds a WhatsApp link with the order details already written, so the owner gets a ready-to-answer message and no server is needed.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — hero with booking form
- [ ] Gallery — fleet catalog cards
- [ ] Gallery — services page
- [ ] Gallery — mobile view
- Hide business name, logo, phone number, and address.

## Before publish
- [ ] Very small project (1 real feature commit). Fine as a lighter entry, or skip / merge.
- [ ] Unclear if it shipped: phone number is still the placeholder `628123456789` and hero image is `hero-bg-placeholder.jpg`. Confirm status.
- [ ] Repo is on the user's personal GitHub, not ZyneraOfficial. Confirm whether it was a Zynera job or personal freelance (affects the Summary/Body wording).
- [ ] Business name appears in metadata, logo, and copy; keep out of screenshots.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
