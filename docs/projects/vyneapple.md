# Vyneapple — Sanity draft

Sources (GitLab aegisdev/vyneapple-apps, private). Approved: description + sanitized screenshots only. No repo links.
- Web app: `C:/laragon/www/apps-vyneapple` (Laravel 7 + Blade/jQuery) — 172 commits, most active author, Nov 2021 – Nov 2025.
- Admin CMS: `D:/Ibang/Project/Office/vyneapple/vyneapple-cms` (React 16 + CoreUI) — 100 commits, Nov 2021 – Nov 2025.
- Landing page: `C:/laragon/www/vyneapple` (October CMS theme) — 54 commits, Nov 2021 – Aug 2025.
All three are one product, so they go in as one entry.

## Title
Vyneapple — Learning Platform (Web App, CMS & Landing Page)

## Slug
vyneapple-learning-platform

## Date
2021-11 – 2025-11

## Role
Full-Stack Developer

## Summary
Subscription-based learning platform with practice, exams, challenges, competitions, and leaderboards. Over four years I worked on all three parts: the learner web app, the admin CMS, and the marketing site.

## Tech Stack
- Laravel
- Blade
- jQuery
- Bootstrap
- ECharts
- MathJax
- Firebase Cloud Messaging
- React
- Redux
- CoreUI
- CKEditor
- KaTeX
- October CMS
- GitLab CI

## Highlights
- Learner web app: built the learn, exam, challenge, and competition flows (instructions, question sessions, results, answer review)
- Built the subscription and payment flow with a payment gateway: plans, invoices, and subscription history
- Built analytics dashboards with ECharts and multi-board leaderboards (practice, challenge, competition)
- Added push notifications with Firebase Cloud Messaging, plus a notification center
- Built auth flows: phone OTP sign-up, PIN reset, guest login, and account deletion
- Admin CMS: built the question-bank, question-set, theory, passage, and competition modules, plus package and gamification management
- Integrated a rich-text math editor (CKEditor + KaTeX) for writing questions
- Landing page: built the career, blog, leaderboard, FAQ, affiliate, and legal pages; added multi-language support and analytics tags (GTM, Meta Pixel)
- Set up the GitLab CI build for the CMS

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — unless the live site is public and approved to link)_

## Body
Vyneapple is a subscription learning platform. Learners practice by topic, take exams, join timed challenges and competitions, and track their progress through analytics and leaderboards.

From 2021 to 2025 I worked across the whole product. In the learner web app (Laravel + Blade) I built most of the core flows: lessons and theory, question sessions with math rendering, exam and challenge results with answer review, the subscription and payment flow, and push notifications. In the admin CMS (React) I built the content tools editors use to write questions with math notation, group them into question sets, and run competitions. On the marketing site (October CMS) I built the career, blog, leaderboard, affiliate, and legal pages, and added multi-language support.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — web app dashboard / analytics
- [ ] Gallery — question session (with math)
- [ ] Gallery — leaderboard
- [ ] Gallery — CMS question-set editor
- [ ] Gallery — landing page hero
- Use a dummy account; crop address bar; hide real names on leaderboards.

## Before publish
- [ ] Confirm that naming "Vyneapple" and showing its logo is OK; otherwise use "Learning Platform".
- [ ] Confirm the approval also covers this project.
- [ ] The payment gateway is unnamed on purpose (Midtrans Snap was used). Name it only if that's OK.
- [ ] Stack is older (Laravel 7, React 16, jQuery). Lead with scope and duration, not the tech.
- [ ] Mindtrex shares this CMS (`mindtrex-editor` package). Check the two entries don't overlap.
