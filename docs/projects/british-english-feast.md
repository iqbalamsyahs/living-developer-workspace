# British English Feast — Sanity draft

Source: `D:/Ibang/Project/zynera/british-english-feast` (GitHub ZyneraOfficial/british-english-feast, private). Zynera team project. Rules: no "Zynera" in title, no client name, no repo link.
- 3-person team. The user: 42 of 51 commits (incl. own PR merges), about 33k lines added, 2025-08-26 – 2026-08-12. Lead developer.
- Teammates: Angga Saeful built the discussion forum (threads, attachments, reply notifications, forum policy) and touched CI; Syifa Shintawati added one migration. Not claimed here.
- Not the same codebase as smart-english-adventure (2024). Different git history, schema, and stack; only the theme is similar.

## Title
British English Feast — English Learning LMS

## Slug
british-english-feast

## Date
2025-08 – 2026-08

## Role
Lead Full-Stack Developer

## Summary
Learning management system for English courses. Teachers build courses with materials, timed quizzes, and assignments; students enroll, learn through a course player, take quizzes, and submit work. I built most of the platform as part of a Zynera team.

## Tech Stack
- Laravel 12
- Livewire 3 + Volt
- Flux UI
- Tailwind CSS 4
- SortableJS
- Spatie Laravel Permission
- Amazon S3
- Pest
- GitHub Actions

## Highlights
- Built course management for teachers: courses split into sections, with drag-and-drop ordering of materials, quizzes, and assignments (SortableJS)
- Built a quiz engine: multiple choice, true/false, and fill-in-the-blank questions, per-student question shuffle saved per attempt, and a timer with a server-side deadline
- Built the student side: course catalog, course overview, a course player that tracks progress per item, quiz results, and a dashboard
- Built assignments: teachers set tasks, students upload files to S3, teachers grade them with a score and feedback
- Built admin modules for teachers, students, grades, and enrollment, with role-based access (admin, teacher, student)
- Added database notifications for new course content (materials, quizzes, assignments), with a bell, a notification list, and deep links to the content
- Wrote Pest feature tests for notifications and the course player

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo link, by choice)_

## Body
British English Feast is an LMS for English courses. Teachers organize courses into sections of reading material, quizzes, and assignments. Students enroll, work through a course player that remembers their progress, and get notified whenever new content is posted.

I led the build over about a year in a three-person Zynera team. I built course authoring with drag-and-drop ordering, the quiz engine (shuffled questions per attempt, timed sessions, auto-scored multiple choice, true/false, and fill-in-the-blank), the student learning flow, assignment submission with S3 storage and teacher grading, the admin modules, and the notification system. A teammate built the discussion forum.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — student course player
- [ ] Gallery — teacher course editor (section ordering)
- [ ] Gallery — quiz in progress with timer
- [ ] Gallery — assignment grading
- [ ] Gallery — notifications
- Dummy teacher/student accounts only.

## Before publish
- [x] Naming "British English Feast" confirmed OK (2026-11-14).
- [ ] The forum is a teammate's work. Keep it out of Highlights (only mentioned in Body as theirs).
- [x] smart-english-adventure left out of the portfolio (decided 2026-11-14: too small, overlaps this entry).
