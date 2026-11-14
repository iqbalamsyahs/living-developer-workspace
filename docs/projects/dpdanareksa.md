# Pension Fund Admin Panel — Sanity draft

Source: `D:/Ibang/Project/Freelance/nura/dpdanareksa-fe`. Freelance project. Two remotes, both private: `nuratecq/danareksa-cms` (main, work via PRs #1–#54) and `ZyneraOfficial/dpdanareksa-fe` (early mirror, last real commit 2026-02-22). Rules: no repo/site link, no client name.
- The user: 123 of 146 commits (as `M Iqbal Alamsyah S` + `ibang090202`), 2026-02-05 – 2026-10-02. Main frontend dev: bootstrapped the project and built nearly every module.
- Teammates, not claimed: Nasri Adzlani (Docker/GHCR CI via Copilot bot, lockfile and axios fixes, auth/Turnstile fix), anggasaeful7 (5 commits 2026-04-30: image preview, notif duration, error handling), Muhammad Farhan / Meng Lab (merge commits only).
- The participant mobile app (Android/iOS) is a separate project, not in this repo, not claimed.

## Title
Pension Fund Admin Panel

## Slug
pension-fund-admin-panel

## Date
2026-02 – 2026-10

## Role
Frontend Developer

## Summary
Web admin panel for a pension fund: manages retiree data, monthly benefits, periodic data verification from the mobile app, company profile content, admin accounts, and an audit log.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix)
- TanStack Query
- TanStack Table
- React Hook Form + Zod
- Zustand
- Recharts
- Axios
- Cloudflare Turnstile

## Highlights
- Set up the project from scratch: App Router structure, design tokens, shared UI components, ESLint/Prettier/Husky, and route protection through the Next.js proxy
- Built a reusable data table with server-side search, pagination, and three-state sorting, later centralized into a `useTableParams` hook, plus row actions and Excel/PDF export
- Built the retiree module: list, detail, and multi-tab edit form (personal data, family and heirs, attendance history), cascading province-to-village address selection, photo upload, password reset, and historical tax document downloads
- Built bulk imports: retiree data and monthly benefits from Excel templates, and yearly tax documents from a ZIP of PDFs matched by filename
- Built the data verification views for submissions from the mobile app: selfie photo, location coordinates, emergency contact, date range filter, and export
- Built the dashboard: summary cards, participant charts, and a list of participants who missed this period's verification, with export
- Built the company profile CMS: vision and mission, organization structure with ordering, yearly financial reports, and a growth chart with budget vs. realization and audited vs. unaudited data, including yearly YoY summaries
- Built admin account management with roles, an audit log with old/new data diff, login with captcha, and public terms and privacy pages

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or site link, by choice)_

## Body
This project is the web admin panel for a pension fund. Retirees use a separate mobile app to verify their data periodically; administrators use this panel to manage retiree records, import monthly benefit data and tax documents, review verification submissions, and keep the company profile content shown in the app up to date.

As a freelance project, I bootstrapped the frontend and built almost all of it: the shared table and form components, the retiree, benefits, verification, dashboard, company profile, admin, and audit log modules, and the authentication flow with captcha. Teammates handled the Docker build pipeline and a few smaller fixes.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — dashboard
- [ ] Gallery — retiree edit form (personal data tab)
- [ ] Gallery — growth chart in company profile
- [ ] Gallery — audit log diff dialog
- Dummy data only. Hide the logo, sidebar branding, building photo on the login page, and domain. No real names, NIP, photos, or coordinates.

## Before publish
- [x] Generic title, no client name. Keep "Danareksa", "DP Danareksa", "Pelindo", "nuratecq", and the domain out of all public fields and screenshots.
- [ ] Confirm the client allows a portfolio mention at all (financial/personal data domain).
- [ ] Don't claim the mobile app or the CI/Docker pipeline.
