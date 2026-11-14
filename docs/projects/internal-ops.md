# Internal Ops Platform — Sanity draft

Source: `D:/Ibang/Project/zynera/internal-ops-platform/internal-ops-fe` (GitHub ZyneraOfficial/internal-ops-fe, private). Team side project (not office work); naming Zynera OK. Repo private, so no repo link.
- Frontend: 20 of 22 commits by the user (the other 2 are their own PR merges), sole frontend author, 2026-01-17 – 2026-02-04.
- Backend (`internal-ops-be`, Go + Gin + PostgreSQL) was written by another developer. Not claimed here; mentioned only as context.

## Title
Internal Ops Platform — Dynamic Form Builder & Approval Admin

## Slug
internal-ops-platform

## Date
2026-01 – 2026-02

## Role
Frontend Developer

## Summary
Admin dashboard for Zynera's multi-tenant internal operations platform, built as a team side project. Admins build dynamic forms, set approval chains, and manage organizations, departments, categories, and employees. I built the whole frontend.

## Tech Stack
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix)
- TanStack Query
- TanStack Table
- Zustand
- React Hook Form
- Zod
- dnd-kit
- Axios

## Highlights
- Built a drag-and-drop form builder (dnd-kit) with 11 field types (text, number, select, date/time, file, textarea, checkbox, radio, map location) and per-field validation rules
- Built a multi-step approver setup per form template: each step can be a specific employee or a role
- Built the auth flow and an Axios client that refreshes tokens automatically and queues requests that fail during a refresh
- Wrote a reusable CRUD page hook and a shared data table (TanStack Table), then used them for the organization, category, department, employee, and form-template modules
- Built a reusable searchable select (cmdk) used across the forms
- Typed the API layer end to end with Zod schemas and TypeScript types; server state in TanStack Query, auth state in Zustand
- Set up the dashboard shell, layout, and shared UI kit; added ESLint + Prettier rules (import sorting, Tailwind class order)

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — repo is private)_

## Body
Internal Ops Platform is a team side project at Zynera. It lets organizations replace paper and chat-based requests with digital forms that go through an approval chain.

I built the admin frontend from the first commit. The core is a form builder: admins drag fields into order, pick from 11 field types including a map location picker, and set validation per field. Each form template then gets an approval chain, where every step is assigned to either a specific employee or a role. Around that sit the master-data modules (organizations, departments, categories, employees), all built on one shared CRUD hook and data table so new modules stay small.

The app talks to a Go REST API through a typed Axios client that handles token refresh on its own, so expired sessions don't kick users out mid-task.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — form builder with fields being dragged
- [ ] Gallery — approver steps setup
- [ ] Gallery — employee or form-template table
- [ ] Gallery — login screen
- Use dummy org and employee names; crop address bar.

## Before publish
- [x] Team side project at Zynera (not office work); naming Zynera confirmed 2026-11-14.
- [ ] Short project (~3 weeks, 20 commits) but you own the whole frontend, so it stands as its own entry. Merge into another entry only if it feels thin.
- [ ] Submission and approval inbox screens exist only as types (`submission.ts`), not pages. Don't claim them.
- [ ] Backend features (parallel approval, revision flow, FCM, audit log) belong to the other developer. Keep them out of Highlights.
