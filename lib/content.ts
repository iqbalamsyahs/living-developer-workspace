// MOCK DATA - swap for Sanity GROQ queries later (see PRD.md section 7 data model).
// Shapes mirror the Sanity schemas: projectCaseStudy / journalEntry / resume.

export type ContentKind = "caseStudy" | "journal" | "resume";

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  date?: string;
  /** caseStudy only: tech stack pills. */
  tech?: string[];
  /** Paragraphs of body text. Journal entries may contain Japanese. */
  body: string[];
  links?: { label: string; href: string }[];
}

export const contentItems: ContentItem[] = [
  {
    id: "cs-pensioner-admin",
    kind: "caseStudy",
    title: "Pensioner Web Admin",
    date: "2025",
    tech: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    body: [
      "A management console for pension administrators. Rebuilt a legacy jQuery dashboard into a typed, server-rendered app that keeps complex filter state in the URL for shareable deep links.",
      "Query-heavy list views were the bottleneck. Moved pagination and filtering server-side, added ISR on the reference tables, and cut time-to-interactive from 6s to under 1.5s on a 3G profile.",
    ],
    links: [{ label: "GitHub", href: "https://github.com" }],
  },
  {
    id: "cs-face-verification",
    kind: "caseStudy",
    title: "Offline Face Verification Flow",
    date: "2024",
    tech: ["React", "WebRTC", "MediaPipe", "IndexedDB"],
    body: [
      "A KYC identity check that runs entirely in the browser on low-end hardware. The liveness step captures a selfie burst and runs a MediaPipe landmark model locally, so nothing leaves the device until the user confirms.",
      "The interesting part was the failure path: flaky cameras, poor lighting, and users who hold the phone upside down. Every failure mode gets a distinct, human-readable recovery step instead of a generic error.",
    ],
    links: [
      { label: "Case study", href: "https://example.com" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    id: "cs-farm-ledger",
    kind: "caseStudy",
    title: "Farm Ledger",
    date: "2023",
    tech: ["Next.js", "Prisma", "SQLite", "Figma"],
    body: [
      "A cooperative bookkeeping app for smallholder farmers. Data entry happens in a shared offline-first mobile view, then syncs in batches whenever connectivity returns.",
      "Schema conflicts were the hard problem. We went with append-only ledgers and idempotent sync, which traded a little storage for never losing a record.",
    ],
    links: [{ label: "GitHub", href: "https://github.com" }],
  },
  {
    id: "jrn-japanese",
    kind: "journal",
    title: "Japanese, 220 days in",
    date: "2026-07",
    body: [
      "この日記は、日本語の学習進捗を記録するための場所です。今週はJLPT N3の文法を復習し、読解問題を10問解きました。",
      "Progress is slow but compound. Kanji review is at 15/day now, up from 5 when I started, and the spaced-repetition backlog finally fits in a single session.",
    ],
  },
  {
    id: "jrn-rtk",
    kind: "journal",
    title: "Rebuilding with Redux Toolkit",
    date: "2026-05",
    body: [
      "Migrated the Farm Ledger state layer off hand-rolled reducers onto RTK Query. The win was not the boilerplate, it was the cache invalidation story: invalidation tags made the offline sync UI an order of magnitude easier to reason about.",
      "Next experiment: colocating query hooks with their components and letting the API surface stay the single source of truth.",
    ],
  },
  {
    id: "resume",
    kind: "resume",
    title: "Resume",
    body: [
      "Frontend developer focused on performance, accessibility, and server-rendered React. Currently building with Next.js, TypeScript, and Tailwind.",
      "Highlights: reduced a legacy dashboard's time-to-interactive by 4x, shipped an offline-first KYC flow, and rebuilt a cooperative ledger with idempotent sync.",
    ],
    links: [
      { label: "Download PDF", href: "#" },
      { label: "Email", href: "mailto:hello@ibang.dev" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
];

export const getContent = (id: string): ContentItem | undefined =>
  contentItems.find((item) => item.id === id);
