# Community CMS — Sanity draft

Source: `C:/laragon/www/CDRandublatung` (GitLab aegisdev/cadaka-dharma-randublatung). Office project. Rules: no repo/site link, no client name.
- The user: 78 of 80 commits (43 non-merge), 2023-11-27 – 2023-12-18. Effectively the sole developer.
- Teammate game5413: 2 commits (person management plugin `kempeb/person`, detail person page). Not claimed here.
- Built on October CMS v1 (Laravel) with the `demo` theme reworked. The initial commit includes the whole October core, so diff line counts are meaningless. Don't quote them.
- Most features wire up third-party plugins (`rainlab/blog`, `rainlab/builder`, `indikator/news`, `raviraj/rjgallery`, `taema/youtubegallery`, `laminsanneh/flexicontact`). The custom plugin is `plugins/ibang/creation`.
- Last commit is "create under construction page". Unknown whether the site ever went live. Confirm before publishing.

## Title
Community Organization Website

## Slug
community-organization-website

## Date
2023-11 – 2023-12

## Role
Web Developer

## Summary
CMS-driven website for a community organization: member directory, news and events, photo and video galleries, a library of member creations, and a contact form, all managed from an October CMS backend.

## Tech Stack
- October CMS (Laravel, PHP)
- Twig
- Bootstrap 5
- jQuery
- Swiper
- Owl Carousel
- MySQL

## Highlights
- Built a custom October CMS plugin for member creations: backend models, list and form controllers, category management with reordering, and frontend components for listing, filtering by category, and detail pages
- Built the member directory with search and person detail pages on top of the person management plugin
- Built news and event pages with detail views, a "read next" list, and load-more pagination
- Built photo and YouTube video galleries and a library page grouped by category
- Added a contact form that sends messages by email
- Redesigned the theme: homepage, about, and family pages, navbar, footer, and a responsive layout across all pages
- Set up environment-based config and cache-busting for theme assets

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or site link, by choice)_

## Body
This project is the public website of a community organization, built on October CMS. Admins manage members, news, events, galleries, and a library of member creations from the CMS backend, and the site renders them on a reworked theme.

I built almost all of it over three weeks: a custom plugin for member creations with its own categories and frontend components, the member directory and search, news and event pages, photo and video galleries, a contact form that sends email, and a responsive redesign of the theme. A teammate contributed the base person management plugin.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — homepage
- [ ] Gallery — member directory with search
- [ ] Gallery — news/event detail with "read next"
- [ ] Gallery — creations library by category
- Dummy data only. Hide the logo, organization name, member names and photos, and the domain.

## Before publish
- [x] Generic title, no client name. Keep "Cadaka Dharma", "Randublatung", and the domain out of all public fields and screenshots.
- [ ] Confirm whether the site went live. If it never launched, consider adding "(not launched)" to the Body.
- [ ] Don't present third-party plugin features (blog, news, gallery, contact form plugins) as built from scratch. Only `ibang/creation` is custom.
- [ ] Low priority entry. The site sorts projects by `date desc`, so a 2023 date already places it near the end.
