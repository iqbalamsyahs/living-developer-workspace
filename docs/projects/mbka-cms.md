# MBKA CMS — Sanity draft

Source: `D:/Ibang/Project/Freelance/MBKA-CMS` (GitHub Mega-Beton-Kali-Abang/MBKA-CMS, private). Freelance project. Rules: no repo/site link, no client name.
- The user: 32 of 37 commits, 2023-10-13 – 2024-01-22. Main frontend dev of the admin panel.
- Teammate Ksatria Bagus Ramadhan: 5 commits (profile/edit profile, reset password, file upload validation, some voucher/ad changes). Not claimed here.
- Built on a commercial React admin template (Vuexy-style `@core`). Claim the business modules, not the template UI.
- Related repos, not claimed: `MBKA-Mobile` (0 commits by the user) and `MBKA-API` (local clone at `C:/laragon/www/Samudra-Bangunan-API`, 0 commits by the user). `D:/Ibang/Project/Freelance/MBKA-API` is not a git repo, only leftover config including a `.env`.

## Title
Retail Loyalty Admin Panel

## Slug
retail-loyalty-admin-panel

## Date
2023-10 – 2024-01

## Role
Frontend Developer

## Summary
Web admin panel for a building-materials retailer's member app: manages products, transactions, member points, vouchers, and in-app ads, with a sales analytics dashboard.

## Tech Stack
- React 18
- Redux Toolkit
- React Router 6
- Reactstrap + Bootstrap 5
- React Hook Form
- React Data Table Component
- ApexCharts
- Axios
- GitHub Actions (FTP deploy to cPanel)

## Highlights
- Built the analytics dashboard: totals for revenue, transactions, products, and new members, plus best-selling and best-income products, top members by points and by transactions, and lowest-stock alerts
- Built CRUD modules backed by a REST API, each with list, detail, and form views and its own Redux slice: products, categories, companies, members, and admins
- Built the transaction module: list and detail views, manual transaction entry linked to members, and transaction export
- Built voucher management, including a review flow for voucher requests submitted by members
- Built the ad manager for the mobile app's home carousel and popup banners
- Added the public pages the mobile app needs for store listing: privacy policy, member policy, about, and an account-deletion guide, plus in-app account deletion
- Set up the build and the GitHub Actions workflow that deploys to cPanel over FTP

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo or site link, by choice)_

## Body
This project is the web admin panel behind a member and loyalty mobile app for a building-materials retailer. Staff use it to manage the product catalog, record and review transactions, run voucher programs, manage the ads shown in the app, and track sales and member activity on a dashboard.

As a freelance project, I built most of the panel on top of a React admin template: the dashboard, the product, category, company, member, transaction, voucher, and ad modules, the routing and navigation, and the public policy and account-deletion pages required for the app store listing. A GitHub Actions workflow builds the app and deploys it to cPanel over FTP.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — analytics dashboard
- [ ] Gallery — product list
- [ ] Gallery — transaction detail
- [ ] Gallery — voucher request review
- Dummy data only. Hide the logo, company name, and domain in the navbar and page titles.

## Before publish
- [x] Generic title, no client name. Keep "MBKA", "Mega Beton", and the domain out of all public fields and screenshots.
- [ ] Mention the admin template honestly if asked. Don't present template pages (calendar, kanban, chat, and similar) as your own work.
- [ ] Optional cleanup: `D:/Ibang/Project/Freelance/MBKA-API/.env` is a leftover file with possible credentials. Delete it if it's not needed.
