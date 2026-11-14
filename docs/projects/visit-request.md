# Visit Request App — Sanity draft

Source: `C:/laragon/www/visit-request-app` (GitHub iqbal090202/visit-request-app, **public**). Zynera team project; naming Zynera OK.
- 40 of 40 commits by the user (sole author), 2024-03-22 – 2024-08-13. Full-stack: Laravel backend + Vue frontend.

## Title
Visit Request — Guest Visit Booking & QR Check-in

## Slug
visit-request-app

## Date
2024-03 – 2024-08

## Role
Full-Stack Developer

## Summary
Web app for booking guest visits to a site. Visitors submit a request online, admins approve it, and approved guests get a QR code by email to check in at the gate. Built solo for a Zynera team project.

## Tech Stack
- Laravel 11
- Inertia.js
- Vue 3
- Pinia
- Tailwind CSS
- Chart.js
- DataTables
- Spatie Laravel Permission
- Laravel Excel
- Laravel Queues

## Highlights
- Built a public visit request form for multiple visitors: one person in charge, ID card upload with progress bar, file type and size checks
- Built the approval flow: admins accept or reject, the app blocks bookings that clash with an already-accepted visit in the same time slot
- On approval, the app generates a QR code and emails it to the person in charge through a queued job
- Built a browser QR scanner page (vue-qrcode-reader) that checks the code against that day's accepted visits
- Built an analytics page: visits per day and by purpose (bar and pie charts), plus monthly Excel export
- Added role and permission access (superadmin, admin) with Spatie Permission; user and role management
- Wrote setup docs and an in-app admin guide

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo link, by choice)_

## Body
Visit Request is a guest booking app built for a Zynera team project. Instead of arranging visits over chat, visitors fill in an online form with their group, visit purpose, time, and ID documents.

I built it alone, front to back. Admins review requests in a filterable table and accept or reject them. Before accepting, the app checks for clashes with visits already booked in that slot. An accepted request gets a QR code, which is emailed to the visit's person in charge through a background job. On the visit day, security scans the code from a browser and the app confirms it matches a visit booked for today. An analytics page shows visit trends and purposes, with a monthly Excel export.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — request list / dashboard
- [ ] Gallery — public visit form
- [ ] Gallery — request detail with accept/reject
- [ ] Gallery — QR scanner page
- [ ] Gallery — analytics charts
- Dummy visitors only; never show a real ID card (KTP) image.

## Before publish
- [x] Client stays unnamed; no repo link (decided 2026-11-14).
- [ ] Security: ID card uploads are saved on the `public` disk with timestamp filenames (`RequestController.php:92`), so anyone who guesses a URL can open them. The repo is public, so anyone can see this. Move them to private storage, or make the repo private.
- [ ] Stack is 2024 Laravel + Inertia + Vue. This is your only Vue entry, so it shows range.
