// MOCK DATA - swap for Sanity GROQ queries later (see PRD.md section 7 data model).
// Shapes mirror the Sanity schemas: profile / experience / projectCaseStudy /
// journalEntry / resume.

export type ContentKind =
  | "caseStudy"
  | "journal"
  | "resume"
  | "about"
  | "stack"
  | "showcase"
  | "contact";

export type StackCategory = "framework" | "language" | "tool" | "cloud";

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  /** Present when the role is finished. */
  endDate?: string;
  description: string;
}

export interface StackItem {
  name: string;
  category: StackCategory;
}

export interface Service {
  name: string;
  description: string;
}

export interface Contact {
  email: string;
  linkedin?: string;
  github?: string;
}

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
  /** about only: one-line working philosophy. */
  philosophy?: string;
  /** about only: career history. */
  experiences?: Experience[];
  /** stack only: tech stack items. */
  stack?: StackItem[];
  /** stack only: professional services. */
  services?: Service[];
  /** contact only: contact details. */
  contact?: Contact;
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
  {
    id: "about",
    kind: "about",
    title: "About & Experience",
    body: [
      "Frontend developer who cares about the long tail: the first render, the edge case, the user who holds the phone upside down. I have spent the last few years turning slow, tangled interfaces into fast, typed, server-rendered ones.",
      "I work best at the boundary between design and engineering — reading a Figma file for the intent behind a layout, then arguing for the implementation that keeps it fast. Accessibility is not a checklist pass; it is the same craft as performance.",
      "The tools I reach for change, but the discipline does not: small composable modules, explicit data flow, and code that reads like the problem it solves.",
    ],
    philosophy:
      "Clean code is code nobody has to explain — the reader's first guess should be the right one.",
    experiences: [
      {
        position: "Frontend Developer",
        company: "Freelance",
        startDate: "2024",
        description:
          "Building dashboards and offline-first web apps for small teams. Own discovery through delivery, from Next.js architecture to Lighthouse budgets.",
      },
      {
        position: "Software Engineer",
        company: "Acme Co",
        startDate: "2022",
        endDate: "2024",
        description:
          "Led the rewrite of a legacy jQuery admin dashboard into typed, server-rendered React. Cut time-to-interactive 4x and made complex filter state shareable via the URL.",
      },
      {
        position: "Junior Developer",
        company: "Startup X",
        startDate: "2020",
        endDate: "2022",
        description:
          "Shipped a cooperative bookkeeping app with offline-first sync. Learned what idempotent write paths actually cost and why they are worth it.",
      },
    ],
  },
  {
    id: "stack",
    kind: "stack",
    title: "My Stack & My Services",
    body: [],
    stack: [
      { name: "Next.js", category: "framework" },
      { name: "React", category: "framework" },
      { name: "Tailwind CSS", category: "framework" },
      { name: "Flutter", category: "framework" },
      { name: "TypeScript", category: "language" },
      { name: "SQL", category: "language" },
      { name: "Figma", category: "tool" },
      { name: "Git", category: "tool" },
      { name: "Vercel", category: "cloud" },
    ],
    services: [
      {
        name: "Frontend Development",
        description: "Typed, server-rendered React apps built on Next.js with accessibility and performance baked in.",
      },
      {
        name: "Mobile App Development",
        description: "Cross-platform mobile experiences with Flutter that share the same design language as the web.",
      },
      {
        name: "Performance Audits",
        description: "Profile, budget, and cut time-to-interactive without redesigning the product.",
      },
      {
        name: "Offline-first Architecture",
        description: "Sync strategies and local-first data flows that survive flaky connections.",
      },
    ],
  },
  {
    id: "showcase",
    kind: "showcase",
    title: "Showcase Projects",
    body: [],
  },
  {
    id: "contact",
    kind: "contact",
    title: "Contact",
    body: ["Open to frontend roles and interesting projects. Email works best."],
    contact: {
      email: "hello@ibang.dev",
      github: "https://github.com",
      linkedin: "https://www.linkedin.com",
    },
  },
];

export const getContent = (id: string): ContentItem | undefined =>
  contentItems.find((item) => item.id === id);
