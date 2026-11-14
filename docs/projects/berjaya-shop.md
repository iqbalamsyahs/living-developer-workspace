# Berjaya Shop — Sanity draft

Source: `D:/Ibang/Project/Freelance/berjaya-shop` (GitHub TechWithZiza/berjaya-shop-laravel). Freelance project. Rules: no repo link; client/product name not yet confirmed.
- The user: 31 of 33 commits, 2024-11-30 – 2025-02-22. Solo backend + admin panel.
- Teammate ganganahmad: 2 small commits (removed cart pagination, added discount to cart response). Not claimed here.
- The mobile app that consumes this API is not in this repo. Not claimed here.
- Compared against `C:/laragon/www/Samudra-Bangunan-API`: 0 commits by the user (all Haris Rachman). Not a portfolio candidate.

## Title
E-Commerce API & Admin Panel

## Slug
ecommerce-api-admin-panel

## Date
2024-11 – 2025-02

## Role
Backend Developer

## Summary
Backend for a mobile shopping app: a REST API for products, cart, checkout, and in-app balance, with Midtrans payments, plus a web admin panel for products, users, and transactions.

## Tech Stack
- Laravel 11
- Laravel Sanctum
- Livewire 3 + Volt
- Mary UI
- Tailwind CSS
- DaisyUI
- Spatie Laravel Permission
- Midtrans

## Highlights
- Built a REST API for the mobile app: auth with Sanctum tokens, products with variants and discount filtering, cart, user profile, and transaction history
- Built checkout inside a DB transaction: validates each item, checks and decrements product/variant stock, applies product discounts, and clears purchased cart items
- Integrated Midtrans Snap for payments, with a webhook that verifies the SHA-512 signature and updates payment status
- Added an in-app balance: top-up through Midtrans, and paying for orders from balance
- Added shipping status tracking on paid orders
- Built the admin panel with Livewire Volt and Mary UI: product (with variants), user, and transaction management, with role-based access (superadmin, user) via Spatie Permission

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
_(empty — no repo link, by choice)_

## Body
This project is the backend for a mobile shopping app. Customers browse products and variants, add them to a cart, and check out by paying through Midtrans or from an in-app balance they top up.

As a freelance project, I built the Laravel backend: the REST API the mobile app uses, the checkout flow (stock checks, discounts, and order records in one DB transaction), the Midtrans integration with signed webhooks, balance top-ups, and shipping status. I also built the web admin panel for managing products, users, and transactions, using Livewire Volt and Mary UI with role-based access.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — admin product list
- [ ] Gallery — product form with variants
- [ ] Gallery — transaction list
- [ ] Gallery — Midtrans Snap payment (sandbox)
- Dummy data and Midtrans sandbox only.

## Before publish
- [x] Generic title, no client/product name (decided 2026-11-14). Keep "Berjaya" out of all public fields and screenshots.
- [ ] Optional code fixes before showing the code to anyone: transaction `show`/`updateShippingStatus` skip the owner check, top-up webhook is not idempotent, checkout clears cart by product without `user_id`, unused `CheckoutService` + `TransactionRepository`.
