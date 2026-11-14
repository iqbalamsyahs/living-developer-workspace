# K-Means Literasi — Sanity draft

Source: `D:/Ibang/Project/Freelance/Joki Skripsi/kmeans-literasi` (GitHub ZyneraOfficial/kmeans-literasi). Zynera team project. Rules: no "Zynera" in title, no client/school name, no repo link.
- Solo: the user wrote all 18 commits (17 as `ibang090202`, 1 as `M Iqbal Alamsyah S`).
- Dates: 2025-06-02 – 2025-07-24.

## Title
School Literacy Tracker with K-Means Clustering

## Slug
kmeans-literasi

## Date
2025-06 – 2025-07

## Role
Full-Stack Developer

## Summary
Admin panel for a school literacy program. Teachers log students' reading and book reviews, and a K-Means analysis groups students by literacy performance to pick whose work gets featured in a public gallery. Built solo as a Zynera team project.

## Tech Stack
- Laravel 12
- Filament 3
- Livewire
- Filament Shield (Spatie Permission)
- Spatie Laravel Settings
- Laravel Excel
- Tailwind CSS 4

## Highlights
- Wrote the K-Means clustering by hand in PHP (centroid init, Euclidean assignment, centroid recompute, empty-cluster guard) over each student's average review grade and reviewed-book count, and stored results per academic year
- Built role-based views with Filament Shield: admin, literacy coordinator, and homeroom teacher, each seeing clusters at a different scope (whole school by grade and class, or just their own class)
- Modeled the school domain: academic years, grade levels, class sections, enrollments, teachers, students, reading logs, book reviews, literacy projects
- Added an academic-year switcher (Livewire) backed by a global Eloquent scope, so every resource filters to the active year
- Built dashboard widgets (stats overview, cluster distribution chart, per-class stats) and weekly/school progress reports with Excel export
- Added Excel import for students and class enrollments
- Built a public gallery of published student literacy projects
- Added app settings (school name, logo, address) and profile editing

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo link, by choice)_

## Body
This app supports a school literacy program. Teachers record what students read and how they review books, and the school uses those records to decide whose work gets showcased.

I built it alone on Laravel and Filament. The core is a K-Means analysis I wrote by hand in PHP: it groups students by their average review grade and the number of books they reviewed, saves each result per academic year, and marks the top cluster for the public gallery. Around it I built the school data model, role-based dashboards for coordinators and homeroom teachers, an academic-year switcher that scopes all data, progress reports with Excel export, bulk student import, and the public gallery itself.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — K-Means result page (clusters by class)
- [ ] Gallery — dashboard with cluster distribution chart
- [ ] Gallery — reading log / book review form
- [ ] Gallery — school progress report
- [ ] Gallery — public gallery page
- Dummy students only (minors). Blank out school name and logo in settings.

## Before publish
- [ ] Freelance thesis job (folder "Joki Skripsi"). Never mention a thesis, the student, or the school. Confirm you are OK showing it at all.
- [ ] `php-ai/php-ml` is in composer.json but unused; the K-Means is hand-written. Don't list php-ml.
- [ ] Only 2 features feed the clustering (avg review grade, reviewed-book count); the other assessment columns exist but stay unused. Don't claim more features.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
