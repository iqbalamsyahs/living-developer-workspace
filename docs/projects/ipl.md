# Estate Management SaaS — Sanity draft

Source: `D:/Ibang/Project/Freelance/ipl`, two repos merged into one entry (same product, two consoles). Freelance project via nuratecq. Rules: no repo/site link, no client or product name.
- `ipl-v2-frontend-operator-control` (GitHub nuratecq, private; extra remote `anggasaeful7/ipl-fe`): the user wrote 171 of 237 commits (164 non-merge), 2026-05-21 – 2026-10-10. Main frontend dev of the operator console.
- `ipl-v2-frontend-platform-control` (GitHub nuratecq, private): the user wrote 63 of 115 commits, 2026-06-20 – 2026-10-11. Took over after Nasri's initial setup and restructured it.
- Teammates, not claimed: Nasri Adzlani (project init, early billing types/sidebar, landing page, settings page), Farhan (billing fixes, manual future billing generation, payment blocking, maintenance page, xlsx format), Menglabs / Meng Lab (Mapbox maps, invoice management, deployment sync, CORS fix), anggasaeful7 (Dockerfile).
- The resident mobile app and the backend (incl. gRPC user-control, provider integration) are separate, not claimed.

## Title
Estate Management SaaS Consoles

## Slug
estate-management-saas-consoles

## Date
2026-05 – 2026-10

## Role
Frontend Developer

## Summary
Two web consoles for a multi-tenant housing-estate management SaaS: an operator console for billing dues, resident records, and daily estate operations, and a superadmin portal for provisioning workspaces, money flows, ads, and add-ons.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui (Radix)
- TanStack Query
- TanStack Table
- React Hook Form + Zod
- Zustand
- next-intl
- Chart.js, Recharts
- Axios

## Highlights
- Built most of the operator console from shadcn setup and i18n routing onward: shared data table with URL-synced search and pagination, global confirmation dialog, collapsible permission-aware sidebar, and responsive layouts down to tablet and mobile
- Built the billing flow: bill components assigned to units with due dates, specific bills with an issue generator, resident bill lists with a void status, payment editing, bulk delete with a floating action bar, and reconciliation export
- Built estate master data following the RW → RT → unit structure: bulk RT/RW creation, RW/RT admins, unit types, parent-child unit combinations, officers, emergency contacts, and a person combobox with infinite scroll
- Built operations modules: guest reports, issue reports, renovation permits, letter requests, and security and cleaning schedules with timezone-safe date handling
- Built the dashboard with per-RT recap cards, charts, recent activity, and date range filters
- Built multi-workspace auth: workspace selection at login, per-workspace API base URL resolved from the login response and routed through the Next.js proxy, forgot password with OTP, and a role permission management UI
- On the superadmin portal: restructured the codebase into services and hooks, built tenant and workspace management (tiered unit quota, bank account validation), ad management with workspace targeting, schedules, video and popup media, payout views, master data, and the add-on settings page

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or site link, by choice)_

## Body
This project is the web side of a multi-tenant SaaS for managing housing estates. Each estate runs in its own workspace. Estate operators, from property managers to neighborhood volunteers, use the operator console to bill and collect monthly dues, keep resident and unit records, and handle requests that residents send from the mobile app. Platform staff use a separate superadmin portal to provision workspaces and manage billing, payouts, ads, and add-ons across all estates.

As a freelance project, I was the main frontend developer of the operator console and a major contributor to the superadmin portal. I built the shared components, the billing and master data modules, the operations features, the dashboard, and the multi-workspace login flow, and later restructured the superadmin codebase and built its tenant, workspace, and advertising modules.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — operator dashboard with per-RT recap
- [ ] Gallery — resident bill list with bulk action bar
- [ ] Gallery — unit form with bill component assignment
- [ ] Gallery — superadmin workspace management
- Dummy data only. Hide the logo, product name, estate names, and domain.

## Before publish
- [x] Generic title, no client or product name. Keep "IPL Residence", "IPL Sistem", "nuratecq", "nuratech", and the domain out of all public fields and screenshots. ("IPL" as the dues term is generic, but avoid it in the title.)
- [ ] Don't claim the mobile app, backend, Mapbox maps, invoices, or deployment sync.
- [ ] Confirm the client allows a portfolio mention.
