# CMMS Distribusi — Sanity draft

Source: `D:/Ibang/Project/Office/cmms-distribusi-fe` (private repo, gitlab aegisdev). Approved: description + sanitized screenshots only. No repo/app links.
Contribution: 294 commits, Nov 2025 – present, team of ~15.

## Title
CMMS Distribution — Utility Asset & Construction Planning

## Slug
cmms-distribution-platform

## Date
2025-11 – present

## Role
Frontend Developer

## Summary
Enterprise maintenance and construction-planning platform for an electricity distribution utility. Built asset, master-data, budget-planning, and reporting modules with approval workflows and role-based access.

## Tech Stack
- Next.js
- React
- TypeScript
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Tailwind CSS
- Radix UI
- Leaflet
- Vitest

## Highlights
- Built the distribution asset module: dynamic-field forms, features & specifications, drawings, attachments, asset swap, and approval workflow
- Built the construction budget (PRK) module: parent/unit views, drilldown tree, CSV bulk upload, status history, and gated submit workflow
- Developed construction work order flows: list, create/detail forms, item realization, and approval list
- Built organization master data: sites, addresses, service addresses, units, vendors, and contacts with full CRUD and export
- Built a report runner: static and dynamic reports, PDF preview, downloads, and recurring schedules
- Implemented permission-gated actions and buttons on top of the app's RBAC model

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — private repo, internal app)_

## Body
CMMS Distribution is an enterprise application used to manage electricity distribution assets and plan construction work, from budget allocation to work order realization.

I joined the frontend team in late 2025 and owned modules end to end, from API integration to UI: distribution asset management with dynamic, classification-driven forms; the construction budget (PRK) module with drilldown, bulk CSV upload, and approval workflow; organization and vendor master data; and a reusable report runner with scheduled reports.

The app is built on the Next.js App Router with TypeScript. Server state runs on TanStack Query, large data grids on TanStack Table, and complex forms on React Hook Form with Zod schemas. Actions are gated by permission so each role only sees what it can do.

Internal enterprise app — screenshots use sanitized data; source code and live access are not public.

## Screenshots (TODO)
- [ ] Cover 16:9 — asset detail form or PRK drilldown
- [ ] Gallery — PRK list / approval
- [ ] Gallery — report runner with schedule dialog
- Use dummy data; crop address bar, company/client name, logo.

## Before publish
- [ ] Client name: approval covered description + screenshots. Naming PLN not confirmed, so this draft says "an electricity distribution utility". Ask before naming the client.
- [ ] Change "Built"/"Developed" to "Contributed to" for any jointly-built module.
