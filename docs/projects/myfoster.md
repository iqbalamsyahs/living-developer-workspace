# MyFoster — Sanity draft

Source: `C:/laragon/www/myfoster` (GitHub ganganahmad1/myfoster, private). Zynera team project. Rules: no "Zynera" in title, no client name, no repo link.
- 2-person team. The user: 41 of 61 commits, about 14.7k lines added. Partner (Gan Gan Ahmad Setriawan): 20 commits (seeders, models, feed base, apply flow, Mailgun setup, family linking).
- Dates: 2023-05-07 – 2023-07-13.

## Title
MyFoster — Foster Family Matching Platform

## Slug
myfoster

## Date
2023-05 – 2023-07

## Role
Full-Stack Developer

## Summary
Platform that matches university students with foster families. Families post on a feed, students apply, and the app handles the application through to acceptance or expiry. Built with one other developer as a Zynera team project; I did most of the app.

## Tech Stack
- Laravel 10
- Livewire
- Alpine.js
- Tailwind CSS
- Flowbite
- WireUI
- Laravel Breeze
- Laravel Scheduler
- Laravel Queues
- Heroku

## Highlights
- Built role-based access (admin, foster family, student) on top of Breeze auth
- Built the profile module: a long student/family profile form (academic, personal, family, and document details) with photo upload
- Built the feed and post detail pages with likes and comments (Livewire)
- Built the admin panel: dashboard, user and admin management, and feed moderation
- Built in-app notifications and search
- Added a daily scheduled job that emails reminders on days 2, 4, and 6 of a pending application and auto-rejects it after 7 days
- Designed the HTML email templates (welcome, application sent/received, expiry reminders) sent through queued jobs
- Deployed to Heroku

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo link, by choice)_

## Body
MyFoster connects university students with foster families. Families share posts on a feed, students browse them and apply, and both sides are kept informed by email until the application is accepted or expires.

I built most of the app with one other developer. My part covered the role system, the detailed profile module, the feed and post pages with likes and comments, the admin panel, notifications, and search. I also built the application lifecycle: a daily scheduled job sends escalating reminders while an application is pending and rejects it automatically after seven days, using queued, branded HTML emails. I deployed it to Heroku.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — feed / home
- [ ] Gallery — post detail with apply button
- [ ] Gallery — profile page
- [ ] Gallery — admin dashboard
- [ ] Gallery — reminder email
- Dummy users only. Profiles hold ID/passport numbers and CGPA, so never show real ones.

## Before publish
- [x] Naming "MyFoster" confirmed OK (2026-11-14).
- [ ] The apply flow itself (`ApplyController`) and the Mailgun setup are the partner's work. Highlights only claim the reminder/expiry job and email templates on top of it. Keep it that way.
- [ ] Older stack (Laravel 10 + Livewire 2, 2023). Fine as an early full-stack entry.
