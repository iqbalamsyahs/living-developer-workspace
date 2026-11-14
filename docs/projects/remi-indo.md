# Remi Indonesia (Discord Activity) — Sanity draft

Source: `D:/Ibang/Project/claude/remi-indo` (GitHub iqbalamsyahs/gas-remi, **public**, homepage https://remi-indo.vercel.app). Personal project, not Zynera, no client.
- 122 commits: 105 non-merge by the user (`ibang090202`) plus 10 PR merges. `Ayrus16` wrote the first 7 (2026-10-11/18): Socket.IO scaffold, card model/deal, seri/tris validation, opening round, turn actions, round scoring. Don't claim those as solo work.
- 95 of the user's 105 commits carry a `Co-Authored-By: Claude` trailer.
- Dates: 2026-10-11 – 2026-11-12, still active, so the Date ends in `present`.
- Size: ~5.1k lines TS (rules + server ~2.1k), 20 Vitest files, GitHub Actions CI (lint, build, tests, worker typecheck).

## Title
Remi Indonesia — Multiplayer Card Game as a Discord Activity

## Slug
remi-indo

## Date
2026-10 – present

## Role
Full-stack Developer

## Summary
A real-time, four-player Indonesian Remi card game that runs inside Discord voice channels as an Activity. The server owns all game state: it enforces the full house rules, hides each player's hand, and fills empty or dropped seats with bots.

## Tech Stack
- Next.js 16 (App Router), React 19
- TypeScript
- Discord Embedded App SDK (OAuth, Activity)
- Cloudflare Workers, Durable Objects, WebSocket
- Vercel
- Vitest, GitHub Actions

## Highlights
- Moved the realtime room from Socket.IO, then HTTP polling, to one Cloudflare Durable Object per Activity launch, with room state kept in Durable Object storage and clients on WebSocket
- Server-authoritative design: clients send intents only; the server validates every move and sends each player a filtered view, so opponents' hands and the stock stay hidden
- Verified players against Discord's REST API (instance participants) instead of trusting the client, with a separate dev-only login for testing outside Discord
- Extended the rules engine (built with a collaborator) with sessions to a target score, the overtake reset rule, closing bonuses, joker penalties, and "cekih" (calling for a needed discard), all covered by unit tests
- Wrote a rule-based bot: picks up discards that complete a meld, lays down pure runs, calls cekih when ready to close, and discards the card with the fewest connections in hand
- Handled disconnects: the game pauses, and a bot takes over the seat after a timeout; the player can reclaim it later, and spectators can choose a bot seat to take
- Built the table UI: drag-and-drop hand sorting, animated draws, discards and melds, end-of-round meld arrangement with a per-meld score breakdown, score history, turn reminders with a recorded voice clip, and a mobile layout

## Outcomes
_(empty — add only real, shareable numbers)_

## Links
- GitHub: https://github.com/iqbalamsyahs/gas-remi
- Live: https://remi-indo.vercel.app (only works inside Discord, or with dev login)

## Body
Remi is a card game many Indonesians play with friends, but the house rules (jokers drawn at random, pure runs, cekih, overtake resets) make it hard to find online. This project brings it into Discord: four people in a voice channel launch the Activity and play without leaving the call.

The game logic is plain TypeScript with no I/O, so it is unit-tested on its own and runs inside a Cloudflare Durable Object. Each Activity launch gets its own room. The server checks every move, keeps hidden cards hidden, and survives players dropping out by pausing and then handing the seat to a bot.

A friend wrote the first card and scoring modules. I built the realtime server, the Discord integration, the bot, the later rules, and the whole table UI. Development was AI-assisted.

Screenshots use sanitized data.

## Screenshots (TODO)
- [ ] Cover 16:9 — full table mid-round inside Discord
- [ ] Gallery — end-of-round meld arrangement and score breakdown
- [ ] Gallery — cekih alert / closing animation
- [ ] Gallery — loading screen with activity banner
- [ ] Gallery — mobile layout
- Blur Discord usernames and avatars of real people.

## Before publish
- [x] Repo link approved by the user (2026-11-14).
- [ ] Live link only works inside Discord. Keep it, or drop it and rely on screenshots.
- [x] Co-author credit stays "a friend", unnamed (2026-11-14).
- [x] "AI-assisted" approved; stated in Body (2026-11-14).
- [ ] PRD says no full 4-human session to `finished` has been tested. Don't claim "played by groups" or any usage.
- [ ] UI is in Indonesian. Fine, or mention it in captions.
