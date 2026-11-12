import type { PortableTextBlock } from "@portabletext/react";

export type ContentKind =
  | "project"
  | "journal"
  | "resume"
  | "about"
  | "stack"
  | "showcase"
  | "contact";

export type StackCategory = "framework" | "language" | "tool" | "cloud" | "database";

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  /** Present when the role is finished. */
  endDate?: string;
  description: PortableTextBlock[];
}

export interface StackItem {
  name: string;
  category: StackCategory;
}

export interface Service {
  name: string;
  description: string;
}

export interface SocialItem {
  /** Sanity array key; used as the React key when present. */
  _key?: string;
  platform: string;
  url: string;
}

export interface Contact {
  email: string;
  /** Optional scheduling link (e.g. a booking page); only https URLs are used. */
  bookingUrl?: string;
  blurb?: string;
  socials?: SocialItem[];
}

/** Raw Sanity shape of an image reference (before urlFor). */
export interface RawImage {
  _type: "image";
  asset: { _ref: string };
  alt?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Availability {
  isAvailable: boolean;
  statusText?: string;
  timezone?: string;
}

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  date?: string;
  /** project only: tech stack pills. */
  tech?: string[];
  /** project only: cover screenshot shown on the showcase card. */
  coverImage?: RawImage;
  /** project only: additional screenshots in the detail modal. */
  gallery?: RawImage[];
  /** project only: your role on the project. */
  role?: string;
  /** project only: key contributions / features. */
  highlights?: string[];
  /** project only: results / impact. */
  outcomes?: string[];
  /** Teaser shown on cards; falls back to a slice of the body. */
  summary?: string;
  body: PortableTextBlock[];
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

export interface PortfolioData {
  /** Every modalable item keyed by id (slug ?? _id), including the synthetic
   *  about/stack/showcase/contact/resume entries built from the profile. */
  items: Record<string, ContentItem>;
  projects: ContentItem[];
  journalEntries: ContentItem[];
  profile: {
    name: string;
    contact?: Contact;
    photo?: RawImage;
    availability?: Availability;
    faq?: FaqItem[];
    resumeFileUrl?: string;
  };
  siteConfig: SiteConfig;
}

export interface SiteConfig {
  brand: string;
  splashLine: string;
  heroTagline: string;
  metaTitle: string;
  metaDescription: string;
  headings: Record<
    "about" | "stack" | "showcase" | "contact" | "resume" | "projects" | "journal" | "experience",
    string
  >;
  ctas: Record<"caseStudy" | "resume" | "readCaseStudy" | "email", string>;
  categoryLabels: Record<StackCategory, string>;
  navItems: { id: string; label: string }[];
}

/** Raw Sanity shape returned by PORTFOLIO_QUERY. */
export interface PortfolioPayload {
  profile?: {
    _id: string;
    name?: string;
    philosophy?: string;
    bio?: PortableTextBlock[];
    experiences?: Experience[];
    stack?: StackItem[];
    services?: Service[];
    contact?: Contact;
    photo?: RawImage;
    availability?: Availability;
    faq?: FaqItem[];
    resumeFileUrl?: string;
    resume?: { headline?: PortableTextBlock[]; links?: { label: string; href: string }[] };
    siteConfig?: Partial<SiteConfig>;
  };
  projects?: RawProject[];
  journalEntries?: RawJournalEntry[];
}

interface RawProject {
  _id: string;
  title?: string;
  date?: string;
  summary?: string;
  techStack?: string[];
  coverImage?: RawImage;
  gallery?: RawImage[];
  role?: string;
  highlights?: string[];
  outcomes?: string[];
  links?: { label: string; href: string }[];
  body?: PortableTextBlock[];
  slug?: string;
}

interface RawJournalEntry {
  _id: string;
  title?: string;
  date?: string;
  summary?: string;
  body?: PortableTextBlock[];
  slug?: string;
}

const isHttps = (url?: string): url is string => !!url && url.toLowerCase().startsWith("https://");

/** "Hire me" target: a booking page if set (https only), else mailto, else nothing. */
export function hireMeHref(contact?: Contact): string | undefined {
  if (isHttps(contact?.bookingUrl)) return contact.bookingUrl;
  return contact?.email ? `mailto:${contact.email}` : undefined;
}

/** Resume target: the uploaded file if present, else the first configured link. */
export function resumeHref(p: { resumeFileUrl?: string; links?: { label: string; href: string }[] }): string | undefined {
  return p.resumeFileUrl || p.links?.[0]?.href || undefined;
}

/** Heading for a stack category; unknown categories read as tools. */
export function categoryLabel(labels: SiteConfig["categoryLabels"], category: string): string {
  return labels[category as StackCategory] ?? labels.tool;
}

/** Portable Text → plain text, for previews and JP detection. */
export function toPlainText(blocks: PortableTextBlock[] | undefined): string {
  return (blocks ?? []).map((b) => b._type === "block" ? (b.children ?? []).map((c) => "text" in c ? c.text : "").join("") : "").join("\n");
}

const headings: SiteConfig["headings"] = {
  about: "About & Experience",
  stack: "My Stack & My Services",
  showcase: "Showcase Projects",
  contact: "Contact",
  resume: "Resume",
  projects: "Selected projects",
  journal: "Learning journal",
  experience: "Experience",
};

const ctas: SiteConfig["ctas"] = {
  caseStudy: "View project",
  resume: "View resume",
  readCaseStudy: "View project",
  email: "Email me",
};

export const defaultSiteConfig: SiteConfig = {
  brand: "Ibang.dev",
  splashLine: "booting the desk…",
  heroTagline: "Frontend developer building fast, accessible React interfaces.",
  metaTitle: "Living Developer Workspace",
  metaDescription: "An interactive 3D/2D developer portfolio built with Next.js.",
  headings,
  ctas,
  categoryLabels: {
    framework: "Frameworks",
    language: "Languages",
    tool: "Tools",
    cloud: "Cloud & Infra",
    database: "Databases",
  },
  navItems: [
    { id: "showcase", label: "Showcase" },
    { id: "about", label: "About" },
    { id: "stack", label: "Stack" },
    { id: "contact", label: "Contact" },
    { id: "jrn-japanese", label: "Learning journal" },
    { id: "resume", label: "Resume" },
  ],
};

/** Deep-merge only the top-level keys the editor actually set; drop empties. */
function mergeDeep<T>(base: T, override?: Partial<T>): T {
  if (!override) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const k = key as keyof T;
    if (value === undefined || value === null || value === "") continue;
    const baseVal = base[k];
    out[k] =
      baseVal && typeof baseVal === "object" && typeof value === "object" && !Array.isArray(baseVal) && !Array.isArray(value)
        ? mergeDeep(baseVal, value as Partial<typeof baseVal>)
        : (value as T[keyof T]);
  }
  return out;
}

export function buildSiteConfig(raw: PortfolioPayload["profile"]): SiteConfig {
  return mergeDeep(defaultSiteConfig, raw?.siteConfig);
}

export function buildPortfolio(payload: PortfolioPayload): PortfolioData {
  const profile = payload.profile;
  const siteConfig = buildSiteConfig(profile);
  const fallbackName = siteConfig.brand.replace(/\.\w+$/, "") || "Ibang";

  const projects: ContentItem[] = (payload.projects ?? []).map((cs) => ({
    id: cs.slug ?? cs._id,
    kind: "project",
    title: cs.title ?? "Untitled",
    date: cs.date,
    tech: cs.techStack,
    coverImage: cs.coverImage,
    gallery: cs.gallery,
    role: cs.role,
    highlights: cs.highlights,
    outcomes: cs.outcomes,
    summary: cs.summary,
    body: cs.body ?? [],
    links: cs.links,
  }));

  const journalEntries: ContentItem[] = (payload.journalEntries ?? []).map((je) => ({
    id: je.slug ?? je._id,
    kind: "journal",
    title: je.title ?? "Untitled",
    date: je.date,
    summary: je.summary,
    body: je.body ?? [],
  }));

  const contact = profile?.contact;
  const about: ContentItem = {
    id: "about",
    kind: "about",
    title: siteConfig.headings.about,
    body: profile?.bio ?? [],
    philosophy: profile?.philosophy,
    experiences: profile?.experiences,
  };
  const stack: ContentItem = {
    id: "stack",
    kind: "stack",
    title: siteConfig.headings.stack,
    body: [],
    stack: profile?.stack,
    services: profile?.services,
  };
  const showcase: ContentItem = {
    id: "showcase",
    kind: "showcase",
    title: siteConfig.headings.showcase,
    body: [],
  };
  const resume: ContentItem = {
    id: "resume",
    kind: "resume",
    title: siteConfig.headings.resume,
    body: profile?.resume?.headline ?? [],
    links: profile?.resume?.links,
  };
  const contactItem: ContentItem = {
    id: "contact",
    kind: "contact",
    title: siteConfig.headings.contact,
    body: contact?.blurb ? [{ _type: "block", style: "normal", children: [{ _type: "span", marks: [], text: contact.blurb }] }] : [],
    contact,
  };

  const items: Record<string, ContentItem> = {
    about,
    stack,
    showcase,
    resume,
    contact: contactItem,
  };
  for (const p of projects) items[p.id] = p;
  for (const je of journalEntries) items[je.id] = je;

  return {
    items,
    projects,
    journalEntries,
    profile: {
      name: profile?.name ?? fallbackName,
      contact,
      photo: profile?.photo,
      availability: profile?.availability,
      faq: profile?.faq,
      resumeFileUrl: profile?.resumeFileUrl,
    },
    siteConfig,
  };
}
