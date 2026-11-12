import type { Config } from "tailwindcss";

// ponytail: design tokens are defined in CSS (`@theme` in app/globals.css),
// per Tailwind v4 — this file exists only to satisfy the project scaffold's
// type-checked config contract. The two overrides below are inert under v4
// (theme resolution is CSS-driven); delete this file once v4 is finalized
// across the team, or reintroduce the theme here via `@config` if migrating
// back to v3.
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
