# Cengli (Split Bill App) — Sanity draft

Source: `D:/Ibang/Project/My Projects/cengli` (GitHub iqbalamsyahs/cengli, renamed from `talangin`, **public**). Personal project, not Zynera, no client.
- Solo: the user wrote the first 19 commits (as `ibang090202`), no AI co-author trailers. 2026-11-14: 2 follow-up commits (invite fix, README) co-authored with Claude.
- Dates: 2026-02-14 – 2026-02-17 (4 days). The Date field keeps 2026-02; the November commits are cleanup.

## Title
Cengli — Group Expense Splitting App

## Slug
cengli

## Date
2026-02 – 2026-02

## Role
Full-stack Developer

## Summary
A mobile-first web app for splitting group expenses. Friends log who paid, split a bill evenly or item by item with tax and discount shared proportionally, and get a short list of transfers that settles everyone up.

## Tech Stack
- Next.js 16 (App Router, Server Actions)
- React 19
- TypeScript
- Tailwind CSS 4, shadcn/ui (Radix)
- Drizzle ORM, Neon Postgres
- Clerk (auth)

## Highlights
- Designed the Postgres schema in Drizzle: groups, members, expenses, receipt line items, cached per-member splits, contacts, and one-time invitation tokens
- Built itemized receipt splitting: each line item is assigned to a member, and tax and discount are spread across items in proportion to their price, then rounded per member
- Wrote a greedy settlement planner that matches the largest debtors with the largest creditors to suggest a short list of transfers
- Supported "ghost" members (people without an account) so a group can be tracked before everyone signs up; a single-use invite link later binds the ghost member to the real Clerk user, keeping their history
- Recorded payments as settlement entries in the same ledger, so balances update without a separate payments table
- Added a reusable contact list, group settings (rename, delete, manage members), a profile page, dark mode, and toast feedback
- Mobile-first layout with a bottom navigation bar; amounts formatted in Rupiah with `Intl.NumberFormat`

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
- GitHub: https://github.com/iqbalamsyahs/cengli

## Body
Splitting a dinner bill gets messy when everyone ordered something different and the receipt has tax, service, and a discount. Cengli lets one person log the receipt line by line, assign each item to whoever ate it, and spreads the extra charges fairly across everyone.

Each group keeps a running balance per member. From those balances the app suggests the fewest practical transfers to settle up, and a payment is logged as a settlement entry in the same history. Friends who have not signed up yet can be added by name and later claim their spot through a one-time invite link.

I built it alone in a few days with Next.js Server Actions, Drizzle on Neon Postgres, and Clerk for sign-in.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — group page with balances and settlement plan
- [ ] Gallery — itemized receipt form (items, tax, discount)
- [ ] Gallery — settle up modal
- [ ] Gallery — invite link flow
- [ ] Gallery — mobile view, light and dark
- Use dummy names and amounts.

## Before publish
- [x] Repo link approved by the user (2026-11-14).
- [x] Invite authorization fix and new README pushed (2026-11-14, commits 897f7bd, 8945245).
- [ ] Expense create/update are multiple writes without `db.transaction`. Don't claim atomic or "consistent ledger".
- [ ] Settlement planner is greedy: short list, not a proven minimum. Wording above says "short", keep it that way.
- [ ] Built in 4 days, then idle. Fine as a side project; don't present it as a product with users.
- [ ] Live deployment? None found in repo. If deployed, decide on a demo link.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
