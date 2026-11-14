# ACFC — Sanity draft

Source: `D:/Ibang/Project/Freelance/acfc` (two repos merged into one entry). Freelance / Zynera team project. Rules: no repo link, no client name.
- `acfc-web` (GitHub ZyneraOfficial/acfc): the user wrote 34 of 36 commits, 2025-06-20 – 2025-08-18, solo frontend. Teammate Angga Saeful: 2 CI commits (2026-11-11), not claimed here.
- `acfc-landingpage` (GitHub ganganahmad/acfc): the user wrote 6 of 9 commits, 2025-05-20 – 2025-05-21. It is a first static version, superseded by `acfc-web`.

## Title
Corporate Group Profile Website

## Slug
corporate-group-profile-website

## Date
2025-05 – 2025-08

## Role
Frontend Developer

## Summary
Company profile website for an investment and development group: a single-page site covering services, projects, sub-companies, and leadership, with themed detail pages per sub-company, built as a fully static Next.js export.

## Tech Stack
- Next.js 15 (App Router, static export)
- React 19
- TypeScript
- Tailwind CSS 4
- Swiper
- react-scroll
- GitHub Actions (FTP deploy)

## Highlights
- Built the one-page layout: hero, about, services, projects, sub-companies, organization, contact, and contact form sections, with scroll-linked navbar navigation
- Built per-sub-company detail pages and per-person organization pages from typed data, pre-rendered with `generateStaticParams` and falling back to `notFound()`
- Added per-sub-company theming (colors, borders, decorative patterns) that drives both the page and the navbar
- Built Swiper sliders for services and projects, and a project card showing structured project specs (area, units, phase, status, budget)
- Made the full site responsive across mobile, tablet, and desktop
- Set up static export (`output: 'export'`, unoptimized images) and a GitHub Actions workflow that builds and deploys to shared hosting over FTP
- Before that, built the first version as a static HTML/CSS/Bootstrap 5 landing page

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or site link, by choice)_

## Body
This project is a company profile website for an investment and development group with several sub-companies. Visitors scroll through one page covering the group's services, flagship projects, sub-companies, and leadership, then reach out through a contact form.

I built it as part of the Zynera team. It started as a static HTML and Bootstrap landing page, which I later rebuilt in Next.js and TypeScript. Content lives in typed data files, so each sub-company and each leader gets a pre-rendered detail page, and each sub-company page carries its own color theme and patterns. The site exports to plain static files, and a GitHub Actions workflow deploys it to shared hosting over FTP.

Screenshots have the client's name and logos removed.

## Screenshots (TODO)
- [ ] Cover 16:9 — home hero (logo blurred/replaced)
- [ ] Gallery — services slider
- [ ] Gallery — sub-company detail page (themed)
- [ ] Gallery — mobile view
- Remove or replace client logos, names, and contact details (the email in the contact form).

## Before publish
- [x] Generic title, no client name. Keep "ACFC" and the full company name out of all public fields and screenshots.
- [ ] Confirm with the Zynera owner that this project may be shown, even anonymized.
- [ ] Optional: the contact form only opens a `mailto:` link (it has no backend). Don't describe it as form handling.
